<template>
  <div ref="containerRef" class="ai-avatar-3d" :class="{ 'is-ready': isReady }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import type { AvatarState } from '@/types'

/**
 * The PAL avatar, rebuilt in 3D as a blend of the two brand systems:
 *
 *  - From AiAvatar.vue it keeps the exact mark — one large ring with a triad
 *    of small rings orbiting it — and the same state grammar (idle drifts,
 *    thinking tightens and spins faster, chatting collapses into an
 *    equal-ring clover whose rings pulse), plus the flowing three-accent
 *    gradient painted as vertex colors travelling around each ring.
 *
 *  - From RibbonCanvas.vue it takes its construction: each ring is not a
 *    solid tube but a BAND of fine parallel line loops lying on a torus
 *    surface — the ribbon canvas bent into a circle — with a gentle wave
 *    travelling around the circumference. The same lengthwise ribbon strands
 *    can run through the scene behind the mark (chat-header mounts only).
 *
 * Symmetry is the design rule: all rings stay coplanar and face-on, and every
 * animated tilt or wave is applied either to the whole mark or identically to
 * all three small rings, so the mark's 120° symmetry holds in every frame.
 */

interface Props {
  state?: AvatarState
  /**
   * The lengthwise ribbon strands. On for the full chat-page header where
   * they have room to breathe; off (default) when the avatar stands alone.
   */
  ribbons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  state: 'idle',
  ribbons: false
})

const containerRef = ref<HTMLDivElement | null>(null)
const isReady = ref(false)

const ACCENTS = [
  new THREE.Color('#e8b4a0'),
  new THREE.Color('#b8d4c8'),
  new THREE.Color('#c9b8e8')
]
// Ribbon rows reuse the RibbonCanvas palette; edges fade toward the page
// paper (the LatticeCanvas trick) so strands dissolve cleanly on light bg.
const RIBBON_PALETTE = ['#e8b4a0', '#d8d8d8', '#b8d4c8', '#c0c0c0', '#c9b8e8', '#e0e0e0']
const PAPER = new THREE.Color('#fdfbf7')

// Geometry targets mirror AiAvatar.vue's viewBox-200 values, scaled /10.
// orbit is rad/s (2D rotated 0.6°/frame and 2°/frame at 60fps). ringWave is
// the amplitude of the band's travelling wave, relative to ring radius.
const STATE_TARGETS: Record<AvatarState, {
  largeR: number; smallR: number; dist: number; orbit: number
  spread: number; amp: number; flow: number; ringWave: number
  think: number; chat: number
}> = {
  idle:     { largeR: 5.0, smallR: 2.4, dist: 2.2, orbit: 0.63, spread: 0.55, amp: 1.0,  flow: 1.0, ringWave: 0.015, think: 0, chat: 0 },
  thinking: { largeR: 6.0, smallR: 2.0, dist: 1.2, orbit: 2.1,  spread: -0.3, amp: 1.7,  flow: 2.4, ringWave: 0.028, think: 1, chat: 0 },
  chatting: { largeR: 2.4, smallR: 2.4, dist: 2.4, orbit: 0,    spread: 0.4,  amp: 1.25, flow: 1.6, ringWave: 0.02, think: 0, chat: 1 }
}

// Live parameters, eased toward the current state's targets every frame.
const cur = { ...STATE_TARGETS.idle }

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let clock: THREE.Clock
let animationFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let time = 0
let orbitAngle = 0

let avatarGroup: THREE.Group
let triadGroup: THREE.Group

// Each ring is LOOPS strands on a torus surface of minor radius `minor`
// (in unit-ring space) — a circular band of ribbon lines. Few strands, wide
// minor radius: the gaps between strands are part of the look. WebGL lines
// are always 1px, so each strand is drawn as SUB tightly-bunched parallel
// lines (SUB_DELTA apart) to give it real thickness.
const LOOPS = 7
const SUB = 3
const SUB_DELTA = 0.008
const LOOP_SEGS = 96

interface Ring {
  mesh: THREE.LineSegments
  material: THREE.LineBasicMaterial
  geometry: THREE.BufferGeometry
  posAttr: THREE.BufferAttribute
  colorAttr: THREE.BufferAttribute
  minor: number
  baseOpacity: number
  /** Triad position for the small rings; undefined for the large ring. */
  baseAngle?: number
}

const rings: Ring[] = []

interface Strand {
  line: THREE.Line
  material: THREE.LineBasicMaterial
  positions: THREE.BufferAttribute
  xs: Float32Array
  y0: number
  z: number
  rowPhase: number
  baseOpacity: number
}

const strands: Strand[] = []

const STRAND_POINTS = 120
const STRAND_LENGTH = 40

const tmpColor = new THREE.Color()

// The shared gradient — the 3D twin of the SVG's single userSpaceOnUse
// linearGradient: three stops fixed across the mark's diagonal, their colors
// cycling through the accents over a 3s period. Every strand of every ring
// samples this one field by position, so the rings orbit THROUGH the
// gradient rather than carrying colors of their own.
const gradientStops = [new THREE.Color(), new THREE.Color(), new THREE.Color()]

function updateGradientStops(flowT: number) {
  const p = ((flowT % 3) + 3) % 3
  const step = Math.floor(p)
  const f = p - step
  const sf = f * f * (3 - 2 * f)
  for (let k = 0; k < 3; k++) {
    gradientStops[k]!
      .copy(ACCENTS[(k + step) % 3]!)
      .lerp(ACCENTS[(k + step + 1) % 3]!, sf)
  }
}

function sampleGradient(u: number, out: THREE.Color) {
  if (u < 0.5) {
    out.copy(gradientStops[0]!).lerp(gradientStops[1]!, u * 2)
  } else {
    out.copy(gradientStops[1]!).lerp(gradientStops[2]!, (u - 0.5) * 2)
  }
}

function buildRing(minor: number, baseOpacity: number): Ring {
  const count = LOOPS * SUB * LOOP_SEGS
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const indices: number[] = []
  for (let l = 0; l < LOOPS * SUB; l++) {
    const base = l * LOOP_SEGS
    for (let s = 0; s < LOOP_SEGS; s++) {
      indices.push(base + s, base + ((s + 1) % LOOP_SEGS))
    }
  }
  const geometry = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(positions, 3)
  const colorAttr = new THREE.BufferAttribute(colors, 3)
  geometry.setAttribute('position', posAttr)
  geometry.setAttribute('color', colorAttr)
  geometry.setIndex(indices)
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: baseOpacity
  })
  const mesh = new THREE.LineSegments(geometry, material)
  return { mesh, material, geometry, posAttr, colorAttr, minor, baseOpacity }
}

/**
 * Lay the band's loops out on the torus surface with a travelling wave, and
 * color every vertex by sampling the ONE shared gradient at its position in
 * mark space (ring orbit included, so rings move through the fixed field).
 * The wave is a pure function of loop/segment angle and time — identical for
 * every ring — so applying it can never break the triad's symmetry.
 *
 * `angle` is the ring's total rotation in the mark plane (triad base angle
 * minus orbit), `dist` its offset from center, `scale` its radius.
 */
function updateRingGeometry(
  ring: Ring,
  flowT: number,
  waveAmp: number,
  angle: number,
  dist: number,
  scale: number
) {
  const pos = ring.posAttr.array as Float32Array
  const col = ring.colorAttr.array as Float32Array
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  for (let l = 0; l < LOOPS; l++) {
    const phi = (l / LOOPS) * Math.PI * 2
    const cosPhi = Math.cos(phi)
    const sinPhi = Math.sin(phi)
    for (let sub = 0; sub < SUB; sub++) {
      const minor = ring.minor + (sub - (SUB - 1) / 2) * SUB_DELTA
      for (let s = 0; s < LOOP_SEGS; s++) {
        const theta = (s / LOOP_SEGS) * Math.PI * 2
        const wave = waveAmp * Math.sin(theta * 3 + flowT * 1.3 + phi)
        const r = 1 + minor * cosPhi + wave
        const x = Math.cos(theta) * r
        const y = Math.sin(theta) * r
        const i = ((l * SUB + sub) * LOOP_SEGS + s) * 3
        pos[i] = x
        pos[i + 1] = y
        pos[i + 2] = minor * sinPhi

        // Position in mark space → gradient coordinate along the diagonal.
        const px = dist + scale * x
        const py = scale * y
        const mx = px * cosA - py * sinA
        const my = px * sinA + py * cosA
        const u = Math.min(1, Math.max(0, 0.5 + (mx - my) / 13))
        sampleGradient(u, tmpColor)
        // Fine strands can't carry the pastel accents the way the SVG's
        // 5-unit strokes do — lean the sampled color slightly richer.
        tmpColor.offsetHSL(0, 0.18, -0.05)
        col[i] = tmpColor.r
        col[i + 1] = tmpColor.g
        col[i + 2] = tmpColor.b
      }
    }
  }
  ring.posAttr.needsUpdate = true
  ring.colorAttr.needsUpdate = true
}

function gauss(x: number, sigma: number): number {
  return Math.exp(-(x * x) / (2 * sigma * sigma))
}

function initThreeJS() {
  if (!containerRef.value) return
  const container = containerRef.value
  const width = container.clientWidth || 1
  const height = container.clientHeight || 1

  scene = new THREE.Scene()
  clock = new THREE.Clock()

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 18)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // --- The mark: one large ring + an orbiting triad of small rings --------
  avatarGroup = new THREE.Group()
  scene.add(avatarGroup)

  const largeRing = buildRing(0.1, 0.85)
  avatarGroup.add(largeRing.mesh)
  rings.push(largeRing)

  triadGroup = new THREE.Group()
  avatarGroup.add(triadGroup)

  // 2D triad: top, bottom-right, bottom-left (90°, then ±120°). Each pivot is
  // rotated so its local X axis points radially — the ring sits at
  // (dist, 0, 0) inside it, and one shared tilt about that axis stays
  // perfectly 3-fold symmetric.
  const baseAngles = [Math.PI / 2, Math.PI / 2 - (2 * Math.PI) / 3, Math.PI / 2 + (2 * Math.PI) / 3]
  baseAngles.forEach((baseAngle) => {
    const pivot = new THREE.Group()
    pivot.rotation.z = baseAngle
    triadGroup.add(pivot)
    const ring = buildRing(0.18, 0.92)
    ring.baseAngle = baseAngle
    pivot.add(ring.mesh)
    rings.push(ring)
  })

  // --- The lengthwise element: ribbon strands through the scene ----------
  if (props.ribbons) {
    const strandCount = 11
    for (let k = 0; k < strandCount; k++) {
      const y0 = ((k / (strandCount - 1)) - 0.5) * 11
      const inFront = k % 4 === 2
      const z = inFront ? 1.9 : -2.6 - (k % 3) * 0.7
      const xs = new Float32Array(STRAND_POINTS)
      const posArr = new Float32Array(STRAND_POINTS * 3)
      const colArr = new Float32Array(STRAND_POINTS * 3)
      const strandColor = new THREE.Color(RIBBON_PALETTE[k % RIBBON_PALETTE.length])

      for (let p = 0; p < STRAND_POINTS; p++) {
        const nx = p / (STRAND_POINTS - 1)
        const x = (nx - 0.5) * STRAND_LENGTH
        xs[p] = x
        posArr[p * 3] = x
        posArr[p * 3 + 1] = y0
        posArr[p * 3 + 2] = z

        // Smoothstepped edge fade toward the paper color (RibbonCanvas fade,
        // LatticeCanvas light-background treatment).
        const fadeWidth = 0.18
        let a = 1
        if (nx < fadeWidth) a = nx / fadeWidth
        else if (nx > 1 - fadeWidth) a = (1 - nx) / fadeWidth
        a = a * a * (3 - 2 * a)
        tmpColor.copy(PAPER).lerp(strandColor, a)
        colArr[p * 3] = tmpColor.r
        colArr[p * 3 + 1] = tmpColor.g
        colArr[p * 3 + 2] = tmpColor.b
      }

      const geom = new THREE.BufferGeometry()
      const positions = new THREE.BufferAttribute(posArr, 3)
      geom.setAttribute('position', positions)
      geom.setAttribute('color', new THREE.BufferAttribute(colArr, 3))
      const baseOpacity = inFront ? 0.35 : 0.8
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: baseOpacity
      })
      const line = new THREE.Line(geom, material)
      scene.add(line)
      strands.push({
        line,
        material,
        positions,
        xs,
        y0,
        z,
        rowPhase: k * 1.7,
        baseOpacity
      })
    }
  }

  resizeObserver = new ResizeObserver(() => {
    if (!containerRef.value) return
    const w = containerRef.value.clientWidth || 1
    const h = containerRef.value.clientHeight || 1
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObserver.observe(container)

  isReady.value = true
  animate()
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05)
  time += dt

  // Ease every parameter toward the active state's targets — this is what
  // makes all state changes glide instead of snap. Deliberately slow
  // (~0.9s settle) so transitions read as one calm morph.
  const target = STATE_TARGETS[props.state] ?? STATE_TARGETS.idle
  const ease = Math.min(1, dt * 1.6)
  for (const key of Object.keys(cur) as Array<keyof typeof cur>) {
    cur[key] += (target[key] - cur[key]) * ease
  }

  orbitAngle += cur.orbit * dt
  triadGroup.rotation.z = -orbitAngle

  // The mark faces forward, always — a whisper of fixed tilt so the band's
  // depth registers, but no swaying.
  avatarGroup.rotation.x = 0.1

  const flowT = time * (1 + cur.think * 1.4)
  const thinkPulse = 1 + cur.think * 0.15 * Math.sin(time * Math.PI)
  // Chatting radius pulse — the 3D version of the SVG r="20;36;20" 1.2s loop.
  const chatPulse = 1 + cur.chat * (0.16 + 0.33 * Math.sin((time * Math.PI * 2) / 1.2))

  updateGradientStops(flowT)

  rings.forEach((ring, idx) => {
    if (idx === 0) {
      ring.mesh.scale.setScalar(cur.largeR)
      updateRingGeometry(ring, flowT, cur.ringWave, 0, 0, cur.largeR)
    } else {
      const r = cur.smallR * chatPulse
      ring.mesh.scale.setScalar(r)
      ring.mesh.position.x = cur.dist
      updateRingGeometry(
        ring,
        flowT,
        cur.ringWave,
        (ring.baseAngle ?? 0) - orbitAngle,
        cur.dist,
        r
      )
    }
    ring.material.opacity = Math.min(1, ring.baseOpacity * thinkPulse)
  })

  // Ribbons: waves + parting around the mark + chat ripple from the center.
  for (const strand of strands) {
    const arr = strand.positions.array as Float32Array
    const dir = strand.y0 >= 0 ? 1 : -1
    for (let p = 0; p < STRAND_POINTS; p++) {
      const x = strand.xs[p]!
      const nx = (x + STRAND_LENGTH / 2) / STRAND_LENGTH
      const flowY =
        Math.sin(nx * Math.PI * 4 + time * 1.5 * cur.flow + strand.rowPhase) * 0.55 * cur.amp +
        Math.sin(nx * Math.PI * 7 + strand.rowPhase * 2 + time * 1.1 * cur.flow) * 0.28 * cur.amp
      const part = strand.y0 * gauss(x, 3.4) * cur.spread
      const dcen = Math.sqrt(x * x + strand.y0 * strand.y0)
      const ripple = cur.chat * Math.sin(dcen * 1.8 - time * 6.5) * gauss(x, 5) * 0.6 * dir
      arr[p * 3 + 1] = strand.y0 + part + flowY + ripple
    }
    strand.positions.needsUpdate = true
    strand.material.opacity = Math.min(1, strand.baseOpacity * (1 + cur.think * 0.25 * Math.sin(time * Math.PI)))
  }

  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  initThreeJS()
})

onUnmounted(() => {
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  if (resizeObserver) resizeObserver.disconnect()
  for (const ring of rings) {
    ring.geometry.dispose()
    ring.material.dispose()
  }
  for (const strand of strands) {
    strand.line.geometry.dispose()
    strand.material.dispose()
  }
  if (renderer) {
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }
})
</script>

<style scoped>
.ai-avatar-3d {
  position: relative;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  pointer-events: none;
  overflow: hidden;
}

.ai-avatar-3d.is-ready {
  opacity: 1;
}

.ai-avatar-3d :deep(canvas) {
  display: block;
}
</style>
