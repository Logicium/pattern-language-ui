<template>
  <div
    ref="host"
    class="ps"
    :class="{ 'is-ready': ready, 'is-grabbing': drag.on, 'is-masked': mask, 'is-soft': soft }"
    :style="blur > 0.05 ? { filter: `blur(${blur.toFixed(1)}px)` } : undefined"
  >
    <div class="ps__limb" :style="limbStyle" />
    <!-- the dwell: a ring that draws itself around a dot the pointer rests on -->
    <svg v-if="cards" ref="dwellEl" class="ps__dwell" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="11" :stroke-dasharray="DWELL_C" :stroke-dashoffset="DWELL_C" />
    </svg>
    <a
      v-for="n in labelNodes"
      :key="n.id"
      :ref="(el) => setLabel(n.id, el as HTMLElement | null)"
      class="ps__label"
      :href="`/patterns/${n.id}`"
      @click.prevent="open(n.id)"
      @pointerenter="hoverLabel(n.id)"
      @pointerleave="hoverLabel(null)"
    >
      <span class="ps__n">{{ String(n.id).padStart(2, '0') }}</span>
      <span class="ps__t">{{ n.title }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { allPatterns as patterns } from '@/utils/data/patterns'

/**
 * The pattern library as a globe: the fifty patterns on a sphere, joined to
 * the patterns they relate to, turning slowly from top left to bottom right.
 * Names surface for the patterns facing the viewer, never on top of each
 * other; hovering a dot holds the globe and lights its relations, a click
 * opens the pattern. Drag to turn it yourself.
 */

/** Where the ball sits, as fractions of the host: centre and radius, desktop and phone. */
export interface SpherePlace {
  cx: number
  cy: number
  r: number
  pcx?: number
  pcy?: number
  pr?: number
}

const props = withDefaults(
  defineProps<{
    /** Selectors for things the names must not sit across: the hero copy, a banner. */
    avoid?: string[]
    place?: SpherePlace
    /** How many names may be up at once, desktop and phone. */
    labels?: [number, number]
    /** Seconds before the ball arrives. */
    delay?: number
    /** Fade the top edge into the page. */
    mask?: boolean
    /** Overall presence, 0 to 1: a hero can turn the ball down as the page scrolls. */
    dim?: number
    /** Out of focus, in CSS pixels. */
    blur?: number
    /** A backdrop, not the subject: draws at 1x and every other frame. */
    soft?: boolean
    /**
     * Cards mode: resting on a dot for a moment, or clicking one, selects it
     * (emitted as `select`) instead of opening its page.
     */
    cards?: boolean
    /** The selected pattern: the ball holds still and keeps it lit. */
    hold?: number | null
    /** Hold the turning, e.g. while the page scrolls; it resumes softly. */
    still?: boolean
  }>(),
  { avoid: () => [], place: undefined, labels: () => [9, 3], delay: 0, mask: true, dim: 1, blur: 0, soft: false, cards: false, hold: null, still: false }
)
const emit = defineEmits<{ hover: [id: number | null]; select: [id: number | null] }>()

/** Where a pattern is on screen, in the host's pixels, and how much it faces the viewer. */
defineExpose({
  locate(id: number): { x: number; y: number; front: number } | null {
    const i = byId.get(id)
    if (i === undefined) return null
    const n = nodes[i]!
    return { x: n.sx, y: n.sy, front: n.front }
  }
})

const router = useRouter()
const host = ref<HTMLDivElement | null>(null)
const ready = ref(false)

/* ------------------------------------------------------------ the graph */

interface Node {
  id: number
  title: string
  p: THREE.Vector3 // on the unit sphere
  degree: number
  sx: number
  sy: number
  front: number // -1 (far side) .. 1 (facing the camera)
  lit: number
  tLit: number
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const nodes: Node[] = patterns.map((pt, i) => {
  const y = 1 - (i / (patterns.length - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const a = i * GOLDEN
  return { id: pt.id, title: pt.title, p: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), degree: 0, sx: 0, sy: 0, front: 0, lit: 0, tLit: 0 }
})
const byId = new Map(nodes.map((n, i) => [n.id, i]))
const byTitle = new Map(patterns.map((p) => [p.title, p.id]))
const edges: Array<[number, number]> = []
{
  const seen = new Set<string>()
  patterns.forEach((pt) => {
    pt.relatedPatterns?.forEach((title) => {
      const other = byTitle.get(title)
      if (other === undefined || other === pt.id) return
      const a = byId.get(pt.id)!
      const b = byId.get(other)!
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (seen.has(key)) return
      seen.add(key)
      edges.push([a, b])
      nodes[a]!.degree++
      nodes[b]!.degree++
    })
  })
}
const neighbours = nodes.map(() => new Set<number>())
edges.forEach(([a, b]) => {
  neighbours[a]!.add(b)
  neighbours[b]!.add(a)
})
const labelNodes = nodes.map((n) => ({ id: n.id, title: n.title }))

/* ------------------------------------------------------------ three.js */

const INK = new THREE.Color('#2a2a2a')
const WARM = new THREE.Color('#d47b5f')
const CAM_Z = 10
const FOV = 32
const ARC_SEGS = 14
const AXIS = new THREE.Vector3(1, 1, 0).normalize() // turns top left to bottom right
const AUTO_SPEED = 0.07 // rad/s

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let globe: THREE.Group
let pointLit: THREE.BufferAttribute
let edgeLit: THREE.BufferAttribute
let lineMat: THREE.ShaderMaterial
let gridMat: THREE.ShaderMaterial
let pointMat: THREE.ShaderMaterial
const disposables: Array<{ dispose(): void }> = []
const edgeLitValue = new Float32Array(edges.length)

const POINT_VERT = `
attribute float aSize;
attribute float aLit;
uniform float uPixelRatio;
uniform float uScale;
uniform float uFade;
varying float vAlpha;
varying float vLit;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float front = clamp(wp.z / uScale, -1.0, 1.0);
  float f = front * 0.5 + 0.5;
  vec4 mv = viewMatrix * wp;
  float size = aSize * (0.5 + 0.5 * f) * (1.0 + aLit * 0.7);
  gl_PointSize = size * uPixelRatio * (${CAM_Z.toFixed(1)} / -mv.z);
  gl_Position = projectionMatrix * mv;
  vAlpha = mix(0.16, 1.0, f * f) * uFade;
  vLit = aLit;
}`
const POINT_FRAG = `
uniform vec3 uInk;
uniform vec3 uWarm;
varying float vAlpha;
varying float vLit;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float core = 1.0 - smoothstep(0.42, 0.62, d);
  float halo = (1.0 - smoothstep(0.2, 1.0, d)) * (0.12 + vLit * 0.3);
  float a = (core + halo) * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(uInk, uWarm, vLit), a);
}`
const LINE_VERT = `
attribute float aLit;
uniform float uScale;
varying float vFront;
varying float vLit;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vFront = clamp(wp.z / uScale, -1.0, 1.0) * 0.5 + 0.5;
  vLit = aLit;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`
const LINE_FRAG = `
uniform vec3 uInk;
uniform vec3 uWarm;
uniform float uFade;
uniform float uLo;
uniform float uHi;
varying float vFront;
varying float vLit;
void main() {
  float a = mix(uLo, uHi, vFront * vFront) + vLit * 0.55 * vFront;
  gl_FragColor = vec4(mix(uInk, uWarm, vLit), a * uFade);
}`

function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) {
  const ang = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1))
  if (ang < 1e-4) return out.copy(a)
  const s = Math.sin(ang)
  return out.copy(a).multiplyScalar(Math.sin((1 - t) * ang) / s).addScaledVector(b, Math.sin(t * ang) / s)
}

function initThree() {
  if (!host.value) return
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.set(0, 0, CAM_Z)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(pixelRatio())
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.className = 'ps__canvas'
  host.value.prepend(renderer.domElement)

  globe = new THREE.Group()
  globe.quaternion.setFromAxisAngle(AXIS, 0.9)
  scene.add(globe)

  const uniforms = () => ({
    uScale: { value: 1 },
    uFade: { value: 0 },
    uInk: { value: INK },
    uWarm: { value: WARM },
    uLo: { value: 0.035 },
    uHi: { value: 0.22 }
  })

  // the relations, as arcs on the surface
  const lineGeo = new THREE.BufferGeometry()
  const lp = new Float32Array(edges.length * ARC_SEGS * 2 * 3)
  const ll = new Float32Array(edges.length * ARC_SEGS * 2)
  const v0 = new THREE.Vector3()
  const v1 = new THREE.Vector3()
  edges.forEach(([a, b], e) => {
    for (let s = 0; s < ARC_SEGS; s++) {
      slerp(nodes[a]!.p, nodes[b]!.p, s / ARC_SEGS, v0).multiplyScalar(1.012)
      slerp(nodes[a]!.p, nodes[b]!.p, (s + 1) / ARC_SEGS, v1).multiplyScalar(1.012)
      const o = (e * ARC_SEGS + s) * 6
      lp.set([v0.x, v0.y, v0.z, v1.x, v1.y, v1.z], o)
    }
  })
  lineGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3))
  edgeLit = new THREE.BufferAttribute(ll, 1)
  edgeLit.setUsage(THREE.DynamicDrawUsage)
  lineGeo.setAttribute('aLit', edgeLit)
  lineMat = new THREE.ShaderMaterial({ vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, uniforms: uniforms(), transparent: true, depthWrite: false, depthTest: false })
  globe.add(new THREE.LineSegments(lineGeo, lineMat))
  disposables.push(lineGeo, lineMat)

  // a faint graticule, so the ball reads as a ball
  const gridGeo = new THREE.BufferGeometry()
  const rings: number[] = []
  const RING_SEGS = 96
  const ring = (fn: (t: number) => [number, number, number]) => {
    for (let s = 0; s < RING_SEGS; s++) {
      const a = fn((s / RING_SEGS) * Math.PI * 2)
      const b = fn(((s + 1) / RING_SEGS) * Math.PI * 2)
      rings.push(...a, ...b)
    }
  }
  for (let m = 0; m < 6; m++) {
    const phi = (m / 6) * Math.PI
    ring((t) => [Math.cos(t) * Math.cos(phi), Math.sin(t), Math.cos(t) * Math.sin(phi)])
  }
  for (const lat of [-0.6, -0.3, 0, 0.3, 0.6]) {
    const r = Math.cos(lat * Math.PI * 0.5)
    const y = Math.sin(lat * Math.PI * 0.5)
    ring((t) => [Math.cos(t) * r, y, Math.sin(t) * r])
  }
  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rings), 3))
  gridGeo.setAttribute('aLit', new THREE.BufferAttribute(new Float32Array(rings.length / 3), 1))
  gridMat = new THREE.ShaderMaterial({ vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, uniforms: { ...uniforms(), uLo: { value: 0.012 }, uHi: { value: 0.07 } }, transparent: true, depthWrite: false, depthTest: false })
  globe.add(new THREE.LineSegments(gridGeo, gridMat))
  disposables.push(gridGeo, gridMat)

  // the patterns
  const pointGeo = new THREE.BufferGeometry()
  const pp = new Float32Array(nodes.length * 3)
  const ps = new Float32Array(nodes.length)
  nodes.forEach((n, i) => {
    pp.set([n.p.x, n.p.y, n.p.z], i * 3)
    ps[i] = 5 + Math.min(4, n.degree * 0.6)
  })
  pointGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3))
  pointGeo.setAttribute('aSize', new THREE.BufferAttribute(ps, 1))
  pointLit = new THREE.BufferAttribute(new Float32Array(nodes.length), 1)
  pointLit.setUsage(THREE.DynamicDrawUsage)
  pointGeo.setAttribute('aLit', pointLit)
  pointMat = new THREE.ShaderMaterial({
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    uniforms: { ...uniforms(), uPixelRatio: { value: renderer.getPixelRatio() } },
    transparent: true,
    depthWrite: false,
    depthTest: false
  })
  globe.add(new THREE.Points(pointGeo, pointMat))
  disposables.push(pointGeo, pointMat)
}

/* ------------------------------------------------------------ layout */

const metrics = { w: 1, h: 1, halfW: 1, halfH: 1, cx: 0, cy: 0, r: 1, phone: false }
const limbStyle = shallowRef<Record<string, string>>({})
let resizeObserver: ResizeObserver | null = null

// Hairlines and dots do not need more than 1.5x; a backdrop needs 1x.
const pixelRatio = () => (props.soft ? 1 : Math.min(window.devicePixelRatio || 1, 1.5))
let appliedRatio = 0

function resize() {
  if (!renderer || !host.value) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  if (!w || !h) return
  const ratio = pixelRatio()
  if (w !== metrics.w || h !== metrics.h || ratio !== appliedRatio) {
    appliedRatio = ratio
    renderer.setPixelRatio(ratio)
    pointMat.uniforms.uPixelRatio!.value = ratio
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    placed.clear()
  }
  metrics.w = w
  metrics.h = h
  metrics.halfH = Math.tan((FOV * Math.PI) / 360) * CAM_Z
  metrics.halfW = metrics.halfH * (w / h)
  metrics.phone = w < 768
  // By default: right of centre, rising from the foot of the hero on desktop;
  // low and small, under the copy, on phones. A `place` prop overrides it.
  const pl = props.place
  if (pl) {
    const cx = metrics.phone ? (pl.pcx ?? pl.cx) : pl.cx
    const cy = metrics.phone ? (pl.pcy ?? pl.cy) : pl.cy
    const r = metrics.phone ? (pl.pr ?? pl.r) : pl.r
    metrics.r = r * Math.min(w, h)
    metrics.cx = cx * w
    metrics.cy = cy * h
  } else {
    metrics.r = metrics.phone ? Math.min(w * 0.46, h * 0.3) : Math.min(w * 0.27, h * 0.6)
    metrics.cx = metrics.phone ? w * 0.5 : w * 0.62
    metrics.cy = metrics.phone ? h - metrics.r * 0.55 : h * 0.97
  }
  // world units per pixel at the sphere's depth
  const upp = (2 * metrics.halfH) / h
  globe.scale.setScalar(metrics.r * upp)
  globe.position.set((metrics.cx - w / 2) * upp, (h / 2 - metrics.cy) * upp, 0)
  limbStyle.value = { left: `${metrics.cx}px`, top: `${metrics.cy}px`, width: `${metrics.r * 2}px`, height: `${metrics.r * 2}px` }
}

/* ------------------------------------------------------------ labels */

const labelEls = new Map<number, HTMLElement>()
function setLabel(id: number, el: HTMLElement | null) {
  if (el) labelEls.set(id, el)
  else labelEls.delete(id)
}
interface Rect { l: number; r: number; t: number; b: number }
const placed = new Set<number>()
const sides = new Map<number, 'left' | 'right'>()
const overlaps = (a: Rect, b: Rect, pad: number) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad
const keepOut: Rect[] = []
let keepOutAt = 0
function measureKeepOut(now: number) {
  if (!host.value || now - keepOutAt < 250) return
  keepOutAt = now
  keepOut.length = 0
  const base = host.value.getBoundingClientRect()
  for (const sel of props.avoid) {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) keepOut.push({ l: r.left - base.left, r: r.right - base.left, t: r.top - base.top, b: r.bottom - base.top })
    })
  }
}

function placeLabels() {
  const max = metrics.phone ? props.labels[1] : metrics.w < 1100 ? Math.ceil(props.labels[0] * 0.66) : props.labels[0]
  const hover = hovered.value
  const want: Array<{ i: number; score: number }> = []
  nodes.forEach((n, i) => {
    if (n.front < 0.12) return
    if (n.sx < 0 || n.sx > metrics.w || n.sy < 0 || n.sy > metrics.h) return
    let score = n.front + n.degree * 0.02
    if (placed.has(i)) score += 0.3 // hysteresis: a name that is up stays up
    if (i === hover) score += 10
    else if (hover !== null && neighbours[hover]!.has(i)) score += 3
    want.push({ i, score })
  })
  want.sort((a, b) => b.score - a.score)
  const rects: Rect[] = []
  const shown = new Set<number>()
  for (const { i } of want) {
    if (shown.size >= max && i !== hover) break
    const n = nodes[i]!
    const el = labelEls.get(n.id)
    if (!el) continue
    const w = el.offsetWidth
    const h = el.offsetHeight
    const prev = sides.get(i)
    const fitsRight = n.sx + 14 + w <= metrics.w - 8
    const fitsLeft = n.sx - 14 - w >= 8
    if (!fitsRight && !fitsLeft) continue // a name never runs off the edge
    let side: 'left' | 'right' = prev ?? 'right'
    if (side === 'right' && !fitsRight) side = 'left'
    if (side === 'left' && !fitsLeft) side = 'right'
    const l = side === 'right' ? n.sx + 14 : n.sx - 14 - w
    const rect: Rect = { l, r: l + w, t: n.sy - h / 2, b: n.sy + h / 2 }
    // a name never sits across another name or another dot
    if (rects.some((r) => overlaps(r, rect, 6))) continue
    if (keepOut.some((r) => overlaps(r, rect, 10))) continue
    if (nodes.some((m, j) => j !== i && m.front > 0 && m.sx > rect.l - 6 && m.sx < rect.r + 6 && m.sy > rect.t - 4 && m.sy < rect.b + 4)) continue
    rects.push(rect)
    sides.set(i, side)
    shown.add(i)
    el.classList.toggle('is-left', side === 'left')
    el.style.transform = `translate3d(${l.toFixed(1)}px, ${rect.t.toFixed(1)}px, 0)`
    const depth = 0.4 + 0.6 * n.front
    el.style.opacity = String((i === hover ? 1 : depth) * fade.v * Math.max(0, Math.min(1, props.dim)))
  }
  for (const [i, n] of nodes.entries()) {
    if (shown.has(i)) continue
    const el = labelEls.get(n.id)
    if (!el) continue
    el.style.opacity = '0'
    if (placed.has(i)) el.classList.remove('is-left')
  }
  placed.clear()
  shown.forEach((i) => placed.add(i))
  for (const [i, n] of nodes.entries()) labelEls.get(n.id)?.classList.toggle('is-culled', !shown.has(i))
}

/* ------------------------------------------------------------ interaction */

const hovered = ref<number | null>(null)
const drag = ref({ on: false })
const spin = { speed: 0, target: AUTO_SPEED, vx: 0, vy: 0 }
// the dwell: resting on a dot for DWELL seconds selects it (cards mode)
const DWELL = 1.5
const DWELL_C = (2 * Math.PI * 11).toFixed(2)
const dwellEl = ref<SVGSVGElement | null>(null)
let dwell = 0
let dwellOn: number | null = null
let dwellAt = 0
const pointer = { x: -1, y: -1, downX: 0, downY: 0, moved: false, lastX: 0, lastY: 0 }
const fade = { v: 0 }
let held = 0
let reduceMotion = false
const qTmp = new THREE.Quaternion()
const tmp = new THREE.Vector3()

function nearestNode(x: number, y: number): number | null {
  let best: number | null = null
  let bestD = metrics.phone ? 22 : 16
  nodes.forEach((n, i) => {
    if (n.front < 0.05) return
    const d = Math.hypot(n.sx - x, n.sy - y)
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return best
}

function hoverLabel(id: number | null) {
  labelHover = id === null ? null : (byId.get(id) ?? null)
}
let labelHover: number | null = null

function onPointerMove(e: PointerEvent) {
  if (!host.value) return
  const rect = host.value.getBoundingClientRect()
  pointer.x = e.clientX - rect.left
  pointer.y = e.clientY - rect.top
  if (drag.value.on) {
    const dx = e.clientX - pointer.lastX
    const dy = e.clientY - pointer.lastY
    pointer.lastX = e.clientX
    pointer.lastY = e.clientY
    if (Math.hypot(e.clientX - pointer.downX, e.clientY - pointer.downY) > (e.pointerType === 'touch' ? 7 : 4)) pointer.moved = true
    const k = 1 / metrics.r
    spin.vx = dy * k
    spin.vy = dx * k
    qTmp.setFromAxisAngle(new THREE.Vector3(1, 0, 0), spin.vx)
    globe.quaternion.premultiply(qTmp)
    qTmp.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin.vy)
    globe.quaternion.premultiply(qTmp)
  }
}
// A finger turns the ball too: the host lets vertical pans through to the
// page (touch-action), so a sideways drag spins and an up-and-down one scrolls;
// when the browser takes a touch for scrolling it cancels the pointer, which
// ends the drag without a tap.
function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType !== 'touch') return
  drag.value.on = true
  pointer.moved = false
  pointer.downX = pointer.lastX = e.clientX
  pointer.downY = pointer.lastY = e.clientY
  spin.vx = spin.vy = 0
  if (e.pointerType === 'touch' && host.value) {
    const rect = host.value.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
  }
}
function onPointerUp(e: PointerEvent) {
  if (!drag.value.on) return
  drag.value.on = false
  // a name handles its own click
  if (!pointer.moved && !(e.target as HTMLElement | null)?.closest?.('.ps__label')) {
    if (!host.value) return
    const rect = host.value.getBoundingClientRect()
    const i = nearestNode(e.clientX - rect.left, e.clientY - rect.top)
    if (i !== null) open(nodes[i]!.id)
    else if (props.cards) emit('select', null) // a click on nothing lets the card go
  }
  // a finger lifts clean away: nothing stays hovered, so no ring starts drawing
  if (e.pointerType === 'touch') pointer.x = pointer.y = -1
}
function onPointerCancel() {
  pointer.x = pointer.y = -1
  pointer.moved = true
  drag.value.on = false
}
function onPointerLeave() {
  pointer.x = pointer.y = -1
  drag.value.on = false
}
function open(id: number) {
  if (props.cards) {
    dwell = 0
    emit('select', id)
  } else void router.push(`/patterns/${id}`)
}

/* ------------------------------------------------------------ the loop */

let frame: number | null = null
let lastT = 0
let visible = true
let intersection: IntersectionObserver | null = null

let skip = false
function tick(t: number) {
  frame = null
  if (!renderer || !host.value) return
  // as a backdrop, every other frame is plenty
  if (props.soft && (skip = !skip)) {
    if (visible) frame = requestAnimationFrame(tick)
    return
  }
  const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016)
  lastT = t

  // hover: the dot under the pointer, or the name under it
  const near = pointer.x >= 0 && !drag.value.on ? nearestNode(pointer.x, pointer.y) : null
  const h = labelHover ?? near
  if (h !== hovered.value) {
    hovered.value = h
    host.value.style.cursor = h !== null ? 'pointer' : drag.value.on ? 'grabbing' : 'grab'
    emit('hover', h === null ? null : nodes[h]!.id)
  }

  // the dwell: resting on a dot that is not already selected draws a ring
  // around it, and selects it when the ring closes; leaving lets it go
  const holdIdx = props.hold === null ? null : (byId.get(props.hold) ?? null)
  if (props.cards && h !== null && h !== holdIdx && !drag.value.on) {
    // by the clock, not by frames, so it is the same wait on a slow machine
    if (dwellOn !== h) {
      dwellOn = h
      dwellAt = t
    }
    dwell = (t - dwellAt) / 1000
    if (dwell >= DWELL) {
      dwell = 0
      dwellOn = null
      emit('select', nodes[h]!.id)
    }
  } else {
    dwellOn = null
    dwell = Math.max(0, dwell - dt * 4)
  }
  if (dwellEl.value) {
    const el = dwellEl.value
    if (dwell > 0 && h !== null) {
      const n = nodes[h]!
      el.style.transform = `translate3d(${(n.sx - 14).toFixed(1)}px, ${(n.sy - 14).toFixed(1)}px, 0) rotate(-90deg)`
      el.style.opacity = String(Math.min(1, dwell * 4))
      ;(el.firstElementChild as SVGCircleElement).style.strokeDashoffset = String(Number(DWELL_C) * (1 - Math.min(1, dwell / DWELL)))
    } else el.style.opacity = '0'
  }

  // turning: slows to a hold while something is hovered or selected, or while
  // the page scrolls; eases back up to speed unhurriedly, and coasts after a drag
  spin.target = reduceMotion || hovered.value !== null || holdIdx !== null || props.still || drag.value.on ? 0 : AUTO_SPEED
  spin.speed += (spin.target - spin.speed) * Math.min(1, dt * (spin.target > spin.speed ? 0.7 : 2.5))
  if (!drag.value.on) {
    const decay = Math.exp(-dt * 3)
    spin.vx *= decay
    spin.vy *= decay
    if (Math.abs(spin.vx) > 1e-4 || Math.abs(spin.vy) > 1e-4) {
      qTmp.setFromAxisAngle(new THREE.Vector3(1, 0, 0), spin.vx * dt * 60)
      globe.quaternion.premultiply(qTmp)
      qTmp.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin.vy * dt * 60)
      globe.quaternion.premultiply(qTmp)
    }
  }
  qTmp.setFromAxisAngle(AXIS, spin.speed * dt)
  globe.quaternion.premultiply(qTmp)
  globe.updateMatrixWorld()

  // arrival, after any delay
  held = Math.max(0, held - dt)
  if (held === 0) fade.v = Math.min(1, fade.v + dt / 1.8)
  const ease = (1 - Math.pow(1 - fade.v, 3)) * Math.max(0, Math.min(1, props.dim))
  const uScale = globe.scale.x
  for (const m of [lineMat, gridMat, pointMat]) {
    m.uniforms.uScale!.value = uScale
    m.uniforms.uFade!.value = ease
  }

  // where every pattern is on screen, and how much it faces us
  nodes.forEach((n) => {
    tmp.copy(n.p).applyMatrix4(globe.matrixWorld)
    n.front = THREE.MathUtils.clamp(tmp.z / uScale, -1, 1)
    tmp.project(camera)
    n.sx = ((tmp.x + 1) / 2) * metrics.w
    n.sy = ((1 - tmp.y) / 2) * metrics.h
  })

  // what lights up: the dot under the pointer, or failing that the selected one
  const hv = hovered.value ?? holdIdx
  let dirty = false
  nodes.forEach((n, i) => {
    n.tLit = hv === null ? 0 : i === hv ? 1 : neighbours[hv]!.has(i) ? 0.6 : 0
    const next = n.lit + (n.tLit - n.lit) * Math.min(1, dt * 7)
    if (Math.abs(next - n.lit) > 1e-3) {
      n.lit = next
      pointLit.setX(i, next)
      dirty = true
    }
  })
  if (dirty) pointLit.needsUpdate = true
  let edgesDirty = false
  edges.forEach(([a, b], e) => {
    const target = hv !== null && (a === hv || b === hv) ? 1 : 0
    const cur = edgeLitValue[e]!
    const next = cur + (target - cur) * Math.min(1, dt * 7)
    if (Math.abs(next - cur) > 1e-3) {
      edgeLitValue[e] = next
      for (let s = 0; s < ARC_SEGS * 2; s++) edgeLit.setX(e * ARC_SEGS * 2 + s, next)
      edgesDirty = true
    }
  })
  if (edgesDirty) edgeLit.needsUpdate = true

  measureKeepOut(t)
  placeLabels()
  // dev only: lets a headless audit read where the names are and whether the ball has arrived
  if (import.meta.env.DEV) (window as unknown as { __ps: unknown }).__ps = { nodes, keepOut, metrics, placed: [...placed], fade: fade.v, hovered: hovered.value, hold: props.hold, dwell, speed: spin.speed, pointer: { ...pointer }, visible, t }
  renderer.render(scene, camera)
  if (visible) frame = requestAnimationFrame(tick)
}

function start() {
  if (frame === null && visible) {
    lastT = 0
    frame = requestAnimationFrame(tick)
  }
}

onMounted(() => {
  if (!host.value) return
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  held = reduceMotion ? 0 : props.delay
  initThree()
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host.value)
  intersection = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    if (visible) start()
  })
  intersection.observe(host.value)
  const el = host.value
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointercancel', onPointerCancel)
  el.addEventListener('pointerleave', onPointerLeave)
  ready.value = true
  start()
})

watch(() => props.place, resize, { deep: true })
watch(() => props.soft, resize)

onBeforeUnmount(() => {
  if (frame !== null) cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  intersection?.disconnect()
  const el = host.value
  if (el) {
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointerup', onPointerUp)
    el.removeEventListener('pointercancel', onPointerCancel)
    el.removeEventListener('pointerleave', onPointerLeave)
  }
  disposables.forEach((d) => d.dispose())
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
})
</script>

<style scoped>
.ps {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}
.ps.is-masked {
  mask-image: linear-gradient(to bottom, transparent 0%, black 22%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 22%, black 100%);
}
.ps.is-grabbing {
  cursor: grabbing;
}
.ps.is-soft {
  will-change: filter;
  pointer-events: none;
}
.ps :deep(.ps__canvas) {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  display: block;
}
/* the edge of the ball, and a breath of shade behind it */
.ps__limb {
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(42, 42, 42, 0.1);
  background: radial-gradient(circle at 38% 32%, rgba(255, 255, 255, 0.5), rgba(42, 42, 42, 0.035) 70%, rgba(42, 42, 42, 0.06) 100%);
  opacity: 0;
  transition: opacity 1.8s ease;
  pointer-events: none;
}
.is-ready .ps__limb {
  opacity: 1;
}
/* the dwell ring: a hairline that draws itself clockwise around the dot */
.ps__dwell {
  position: absolute;
  top: 0;
  left: 0;
  width: 28px;
  height: 28px;
  opacity: 0;
  fill: none;
  stroke: var(--color-accent-warm);
  stroke-width: 1;
  stroke-linecap: round;
  pointer-events: none;
  will-change: transform, opacity;
}
.ps__label {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
  padding: 0.15rem 0;
  font-family: var(--font-family);
  font-size: 0.66rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--color-text-primary);
  text-decoration: none;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.9s ease;
  will-change: transform, opacity;
}
.ps__label.is-culled {
  pointer-events: none;
  /* a name that has to go leaves quickly, so it never lingers under a new one */
  transition-duration: 0.35s;
}
.ps__label:hover .ps__t {
  color: var(--color-accent-warm);
}
.ps__n {
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}
@media (max-width: 767px) {
  .ps.is-masked {
    mask-image: linear-gradient(to bottom, transparent 0%, black 45%, black 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 45%, black 100%);
  }
  .ps__label {
    font-size: 0.6rem;
  }
}
</style>
