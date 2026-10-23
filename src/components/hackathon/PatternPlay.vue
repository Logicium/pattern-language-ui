<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { allPatterns } from '@/utils/data/patterns'
import { allChallenges } from '@/utils/data/challenges'
import { demoApi, hackathonApi, type HackathonIdea } from '@/services/api'
import { evidenceFor, type EvidenceItem } from '@/data/wicked-evidence'
import { examplesFor } from '@/data/pattern-examples'
import { HACKATHON_SLUG } from '@/data/hackathon'
import type { Challenge, Pattern } from '@/types'

/**
 * The Field — the Community Solution Sprint's game. One thing on screen per act, the HUD
 * kept to the top edge, the web itself carrying the meaning.
 *
 *  01 problem   the fifteen wicked problems alone, warm points wired by the
 *               patterns they share; turning, draggable; touch one.
 *  –  review    only that problem, in focus, with three real stories of it
 *               from rural America as nodes around it; a HUD panel shows its
 *               shape; confirm.
 *  02 patterns  the problem at centre, the forty-five patterns fade in on
 *               their own hairlines, the ones that answer it on a ring; touch
 *               one to open it.
 *  –  pattern   that pattern in focus with real examples of it in use; add it
 *               to the solution or go back. One to three.
 *  03 combine   PAL writes, grounded in Cañon City.
 *  04 brief     the web distilled to the problem and the chosen patterns, the
 *               pitch beside it, the morning-after headline as a front page,
 *               and the community's other ideas along the foot.
 *
 * Ideas persist: in this browser (an anonymous profile) and on the shared
 * board. Any idea can be handed to PAL as a real playbook.
 */

type Phase = 'problem' | 'review' | 'patterns' | 'pattern' | 'combine' | 'brief'

interface Brief {
  name: string
  pitch: string
  build: string[]
  ask: string
  headline: string
  lede: string
  source: 'pal' | 'local'
}

interface SavedIdea {
  id: string
  createdAt: string
  challengeId: number
  problem: string
  patternIds: number[]
  patterns: string[]
  brief: Brief
  remoteId?: number
}

const props = defineProps<{ mode: 'game' | 'site' }>()
const emit = defineEmits<{
  close: [target?: 'about' | 'register', payload?: { name: string; pitch: string }]
  handoff: [idea: SavedIdea]
}>()

/* ------------------------------------------------------------------ state */

const phase = ref<Phase>('problem')
const challenge = ref<Challenge | null>(null)
const candidateIds = ref<number[]>([])
const selected = ref<number[]>([])
const patternFocus = ref<number | null>(null)
const hovered = ref<number | null>(null)
const labelHover = ref<number | null>(null)
const brief = ref<Brief | null>(null)
// touch: a name tapped once shows its two options; a second tap opens it
const armed = ref<number | null>(null)
// the story card under the pointer, so its side never flips while it grows
const cardHover = ref<number | null>(null)
// touch: the card opened by a first tap; a second tap follows its link
const cardOpen = ref<number | null>(null)
/** The card being read, whichever way it was opened. */
const readKey = computed(() => cardOpen.value ?? cardHover.value)
// the openings: what a wicked problem is (once a session), then, after a
// problem is chosen, what that choice says and what a pattern is
const intro = ref<null | 'wicked' | 'pattern'>(null)
// phones: how far the pitch has been scrolled, so the constellation can recede
const briefScroll = ref(0)
function onBriefScroll(e: Event) {
  const top = (e.target as HTMLElement).scrollTop
  briefScroll.value = Math.min(1, top / Math.max(1, metrics.h * 0.3))
}
const introStep = ref(0)
const combineLine = ref('')
const ideasOpen = ref(false)

const byTitle = new Map(allPatterns.map((p) => [p.title, p]))
const byId = new Map(allPatterns.map((p) => [p.id, p]))
const challengeById = new Map(allChallenges.map((c) => [c.id, c]))

const PROBLEM_BASE = 1000
const EVIDENCE_BASE = 2000
const EVIDENCE_SLOTS = 4 // three stories, plus the front page on the brief
const FUTURE_SLOT = 3
const problemKey = (cid: number) => PROBLEM_BASE + cid
const isProblemKey = (key: number) => key >= PROBLEM_BASE && key < EVIDENCE_BASE
const activeProblemKey = computed(() => (challenge.value ? problemKey(challenge.value.id) : null))

const selectedPatterns = computed(() =>
  selected.value.map((id) => byId.get(id)).filter((p): p is Pattern => !!p)
)
const canCombine = computed(() => selected.value.length >= 1)

const STEP = computed(() => {
  switch (phase.value) {
    case 'problem': return { n: '01', name: 'The problem', hint: 'Touch a wicked problem. Drag to turn the web.' }
    case 'review': return { n: '01', name: 'The problem', hint: '' }
    case 'patterns': return { n: '02', name: 'The patterns', hint: `Touch a pattern to learn more or select it. ${selected.value.length} chosen.` }
    case 'pattern': return { n: '02', name: 'The patterns', hint: '' }
    case 'combine': return { n: '03', name: 'Combining', hint: '' }
    case 'brief': return { n: '04', name: 'The pitch', hint: '' }
  }
})

/** The site's shared copy uses em dashes; the game's typography does not. */
const undash = (t: string | undefined) => (t ?? '').replace(/\s*—\s*/g, ', ')

/** The shape of the problem under review. */
const review = computed(() => {
  const c = challenge.value
  if (!c) return null
  const key = problemKey(c.id)
  const i = nodeIndex.get(key)
  const neighbours = ccEdges
    .filter(([a, b]) => a === i || b === i)
    .map(([a, b]) => nodes[a === i ? b : a]!.title)
  const answers = c.relatedPatterns.filter((t) => byTitle.has(t))
  return {
    n: String(c.id).padStart(2, '0'),
    of: String(allChallenges.length).padStart(2, '0'),
    title: c.title,
    description: undash(c.description),
    signs: c.manifestations.slice(0, 2).map(undash),
    answers,
    neighbours,
    evidence: evidenceFor(c.id).slice(0, 3)
  }
})

/** The pattern under review. */
const patternReview = computed(() => {
  const p = patternFocus.value !== null ? byId.get(patternFocus.value) : undefined
  if (!p) return null
  const clipTo = (s: string | undefined, n: number) => {
    const t = undash(s).replace(/\s+/g, ' ').trim()
    return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`
  }
  return {
    n: String(p.id).padStart(2, '0'),
    of: String(allPatterns.length).padStart(2, '0'),
    title: p.title,
    category: p.category ?? '',
    description: undash(p.description),
    solution: clipTo(p.solution, 170),
    answers: challenge.value?.relatedPatterns.includes(p.title) ?? false,
    chosen: selected.value.includes(p.id),
    examples: examplesFor(p.id).slice(0, 3)
  }
})

/** Cards shown around whatever is in focus. */
const evidenceItems = computed<EvidenceItem[]>(() => {
  if (phase.value === 'review') return review.value?.evidence ?? []
  if (phase.value === 'pattern') return patternReview.value?.examples ?? []
  return []
})
const yearOf = (iso: string) => iso.slice(0, 4)
function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.closest('.ecard__img')?.classList.add('is-empty')
}

/* ------------------------------------------------------------ palette */

const INK = new THREE.Color('#1b1b1b')
const ACCENTS = [new THREE.Color('#e8a98f'), new THREE.Color('#9fcfbd'), new THREE.Color('#b8a3e6')]
const ACCENT_HEX = ['#e8a98f', '#9fcfbd', '#b8a3e6']
const WARM = new THREE.Color('#c4572f')
const WARM_DEEP = new THREE.Color('#9a3f1f')

/**
 * The colour field behind the web. Each wicked problem has its own three
 * washes; the field drifts to them as a problem is hovered and stays there
 * once one is chosen.
 */
const WASH_DEFAULT = ['#efb496', '#a6d0bd', '#bda7ea']
const WASHES: string[][] = [
  ['#f0b39a', '#f3d7a6', '#c8b4ea'],
  ['#a9d3c4', '#cfe3b0', '#f1c2a8'],
  ['#b9c4f0', '#d8b6e8', '#a8d8d0'],
  ['#f2c08f', '#e9a7a0', '#b4cfe6'],
  ['#c2b0ec', '#f0b8c8', '#acd6c0'],
  ['#e8c79a', '#b8d4a8', '#d6b0d8'],
  ['#9fcfd6', '#bfc2f0', '#f1d0a0'],
  ['#f1a99a', '#f2d39c', '#a9c9e8'],
  ['#b6dcb4', '#a8cde6', '#ecbfa0'],
  ['#e4b0d4', '#b5b8ee', '#f0d0a8'],
  ['#f3c7a0', '#c9e0b8', '#c7b2e6'],
  ['#a8c4ec', '#f0b0a0', '#d8e2a8'],
  ['#d4b8ec', '#a6dccc', '#f2bfa2'],
  ['#f0be9c', '#b0d6e0', '#e6b8cc'],
  ['#c4d8a4', '#e8b49c', '#b0b4e8']
]
const washStyle = computed(() => {
  let id: number | null = null
  if (phase.value === 'problem') {
    const h = hovered.value ?? armed.value
    if (h !== null && isProblemKey(h)) id = h - PROBLEM_BASE
  } else if (challenge.value) id = challenge.value.id
  const w = id !== null ? WASHES[(id - 1 + WASHES.length) % WASHES.length]! : WASH_DEFAULT
  return { '--w1': w[0], '--w2': w[1], '--w3': w[2], '--bs': String(Math.round(briefScroll.value * 100) / 100) }
})

/** What choosing each wicked problem says about the person who chose it. */
const CHOSE: Record<number, { head: string; body: string }> = {
  1: { head: 'You chose the ones who leave.', body: 'That says you still believe this can be a place worth coming home to, and that the reasons to stay can be built.' },
  2: { head: 'You chose what the elders carry.', body: 'That says you know what is not handed on is lost, and you mean to be there for the handing.' },
  3: { head: 'You chose trust.', body: 'That says you know nothing gets built between people who have stopped believing each other, and you are willing to go first.' },
  4: { head: 'You chose the ones no one checks on.', body: 'That says you notice who is missing from the room, and you think a town is measured by them.' },
  5: { head: 'You chose the stalled engine.', body: 'That says you believe good work can still happen here, and that what it earns should stay here too.' },
  6: { head: 'You chose where we are going.', body: 'That says you would rather argue about the future together than drift into one nobody picked.' },
  7: { head: 'You chose the longest problem.', body: 'That says you know the way out has to be wider than one family can build alone, and you want to help widen it.' },
  8: { head: 'You chose the hardest table.', body: 'That says you still think neighbors can disagree and stay neighbors, and you are willing to pull up a chair.' },
  9: { head: 'You chose the broken promise.', body: 'That says you would rather repair the gap between people and the places meant to serve them than walk away from it.' },
  10: { head: 'You chose what is already here.', body: 'That says you see an empty storefront as a beginning, and you trust a town to hold more than it thinks it does.' },
  11: { head: 'You chose the table.', body: 'That says you know a town that cannot feed itself cannot fully decide for itself.' },
  12: { head: 'You chose what no one thanks.', body: 'That says you understand that care often looks like maintenance, and that a road is a promise too.' },
  13: { head: 'You chose the quiet.', body: 'That says you believe people go silent from being unheard, not from not caring, and you want to listen first.' },
  14: { head: 'You chose the land itself.', body: 'That says you are thinking about who lives here after all of us, and what they will inherit.' },
  15: { head: 'You chose what is coming apart.', body: 'That says you know institutions are only people agreeing to keep showing up, and you are ready to show up.' }
}
const chose = computed(() => (challenge.value ? CHOSE[challenge.value.id] ?? null : null))

/* ----------------------------------------------------------- the graph */

interface Node {
  key: number
  kind: 'pattern' | 'problem' | 'evidence'
  title: string
  home: THREE.Vector3
  pos: THREE.Vector3
  target: THREE.Vector3
  drift: number
  alpha: number
  tAlpha: number
  size: number
  tSize: number
  color: THREE.Color
  tColor: THREE.Color
  sx: number
  sy: number
  onScreen: boolean
  depth: number
}

const nodes: Node[] = []
const nodeIndex = new Map<number, number>()
const ppEdges: Array<[number, number]> = []
const cpEdges: Array<[number, number]> = []
const ccEdges: Array<[number, number]> = []

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeNode(key: number, kind: Node['kind'], title: string, v: THREE.Vector3, rand: () => number): Node {
  return {
    key, kind, title,
    home: v.clone(), pos: v.clone(), target: v.clone(),
    drift: rand() * Math.PI * 2,
    alpha: 0, tAlpha: 0.5, size: 3, tSize: 3,
    color: (kind === 'problem' ? WARM : INK).clone(),
    tColor: (kind === 'problem' ? WARM : INK).clone(),
    sx: 0, sy: 0, onScreen: false, depth: 0.5
  }
}

function relax(set: Node[], edges: Array<[number, number]>, rest: number, radius: number) {
  const local = new Map(set.map((n, i) => [nodes.indexOf(n), i]))
  const f = set.map(() => new THREE.Vector3())
  const d = new THREE.Vector3()
  const pairs = edges
    .map(([a, b]) => [local.get(a), local.get(b)] as const)
    .filter((e): e is readonly [number, number] => e[0] !== undefined && e[1] !== undefined)
  for (let it = 0; it < 340; it++) {
    const temp = 1 - it / 340
    f.forEach((v) => v.set(0, 0, 0))
    for (let i = 0; i < set.length; i++) {
      for (let j = i + 1; j < set.length; j++) {
        d.subVectors(set[i]!.home, set[j]!.home)
        const dist = Math.max(0.2, d.length())
        d.multiplyScalar(1.5 / (dist * dist * dist))
        f[i]!.add(d)
        f[j]!.sub(d)
      }
    }
    for (const [a, b] of pairs) {
      d.subVectors(set[b]!.home, set[a]!.home)
      const dist = d.length()
      d.multiplyScalar(((dist - rest) * 0.08) / Math.max(dist, 0.001))
      f[a]!.add(d)
      f[b]!.sub(d)
    }
    set.forEach((n, i) => {
      f[i]!.addScaledVector(n.home, -0.015)
      n.home.addScaledVector(f[i]!, 0.6 * temp + 0.1)
    })
  }
  let maxR = 0
  set.forEach((n) => (maxR = Math.max(maxR, n.home.length())))
  set.forEach((n) => {
    n.home.multiplyScalar(radius / maxR)
    n.home.z *= 0.75
  })
}

function buildGraph() {
  const rand = mulberry32(45)
  const rv = () => new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).multiplyScalar(3)
  allPatterns.forEach((p) => {
    nodeIndex.set(p.id, nodes.length)
    nodes.push(makeNode(p.id, 'pattern', p.title, rv(), rand))
  })
  allChallenges.forEach((c) => {
    nodeIndex.set(problemKey(c.id), nodes.length)
    nodes.push(makeNode(problemKey(c.id), 'problem', c.title, rv(), rand))
  })
  const seen = new Set<string>()
  allPatterns.forEach((p) => {
    const a = nodeIndex.get(p.id)!
    p.relatedPatterns?.forEach((t) => {
      const q = byTitle.get(t)
      if (!q) return
      const b = nodeIndex.get(q.id)!
      const k = a < b ? `${a}-${b}` : `${b}-${a}`
      if (seen.has(k)) return
      seen.add(k)
      ppEdges.push([a, b])
    })
  })
  allChallenges.forEach((c) => {
    const a = nodeIndex.get(problemKey(c.id))!
    c.relatedPatterns.forEach((t) => {
      const q = byTitle.get(t)
      if (q) cpEdges.push([a, nodeIndex.get(q.id)!])
    })
  })
  for (let i = 0; i < allChallenges.length; i++) {
    for (let j = i + 1; j < allChallenges.length; j++) {
      const a = allChallenges[i]!
      const b = allChallenges[j]!
      if (a.relatedPatterns.some((t) => b.relatedPatterns.includes(t))) {
        ccEdges.push([nodeIndex.get(problemKey(a.id))!, nodeIndex.get(problemKey(b.id))!])
      }
    }
  }
  relax(nodes.filter((n) => n.kind === 'pattern'), ppEdges, 1.5, 4.6)
  relax(nodes.filter((n) => n.kind === 'problem'), ccEdges, 1.8, 4.4)
  // Evidence nodes: stories that surface around whatever is in focus, and
  // the front page on the brief. They wait at the focus point, invisible.
  for (let i = 0; i < EVIDENCE_SLOTS; i++) {
    nodeIndex.set(EVIDENCE_BASE + i, nodes.length)
    nodes.push(makeNode(EVIDENCE_BASE + i, 'evidence', '', new THREE.Vector3(0, 0, 1.2), rand))
  }
  nodes.forEach((n) => {
    n.pos.copy(n.home)
    n.target.copy(n.home)
    if (n.kind === 'evidence') n.tAlpha = 0
  })
}

/* ------------------------------------------------------------ three.js */

const host = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let field: THREE.Group
let pointGeo: THREE.BufferGeometry
let pointMat: THREE.ShaderMaterial
let posAttr: THREE.BufferAttribute
let sizeAttr: THREE.BufferAttribute
let alphaAttr: THREE.BufferAttribute
let colorAttr: THREE.BufferAttribute
let basePos: THREE.BufferAttribute
let baseMat: THREE.LineBasicMaterial
let ccPos: THREE.BufferAttribute
let ccMat: THREE.LineBasicMaterial
let livePos: THREE.BufferAttribute
let liveCol: THREE.BufferAttribute
let liveMat: THREE.LineBasicMaterial
let liveLines: THREE.LineSegments
let constPos: THREE.BufferAttribute
let constMat: THREE.LineBasicMaterial
const disposables: Array<{ dispose(): void }> = []

const CONST_SEGS = 6
const constProgress = new Float32Array(CONST_SEGS)

let frame: number | null = null
let running = false
let lastT = 0
let clockT = 0
let reduceMotion = false
let resizeObserver: ResizeObserver | null = null
const metrics = { w: 1, h: 1, halfW: 8, halfH: 4.8, portrait: false }
const CAM_Z = 14
const FOV = 38
const cam = { z: CAM_Z, tz: CAM_Z, x: 0, y: 0, px: 0, py: 0 }
const fieldShift = { x: 0, tx: 0, y: 0, ty: 0 }
const fieldScale = { v: 1, t: 1 }
const rot = { x: 0, y: 0, vx: 0, vy: 0, auto: 0, settle: false, lastDrag: -1e9 }
const fade = { v: 1, t: 1 }
const free = { cx: 0, cy: 0, rx: 0, ry: 0, valid: false }
const keepOut = { l: 0, r: 0, t: 0, b: 0, valid: false }
let lastMeasure = 0
const headEl = ref<HTMLElement | null>(null)
const footEl = ref<HTMLElement | null>(null)
const sheetEl = ref<HTMLElement | null>(null)
const tmp = new THREE.Vector3()

const POINT_VERT = `
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uPixelRatio;
uniform float uFade;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uPixelRatio * (${CAM_Z.toFixed(1)} / -mv.z);
  gl_Position = projectionMatrix * mv;
  vAlpha = aAlpha * uFade;
  vColor = aColor;
}`
const POINT_FRAG = `
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float core = 1.0 - smoothstep(0.46, 0.64, d);
  float halo = (1.0 - smoothstep(0.3, 1.0, d)) * 0.2;
  float a = (core + halo) * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor, a);
}`

function lineSet(count: number, material: THREE.LineBasicMaterial, withColor = false) {
  const geo = new THREE.BufferGeometry()
  const pos = new THREE.BufferAttribute(new Float32Array(count * 6), 3)
  geo.setAttribute('position', pos)
  let col: THREE.BufferAttribute | undefined
  if (withColor) {
    col = new THREE.BufferAttribute(new Float32Array(count * 6), 3)
    geo.setAttribute('color', col)
  }
  const mesh = new THREE.LineSegments(geo, material)
  field.add(mesh)
  disposables.push(geo, material)
  return { mesh, pos, col }
}

function initThree() {
  if (!host.value) return
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.set(0, 0, CAM_Z)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  host.value.appendChild(renderer.domElement)

  field = new THREE.Group()
  scene.add(field)

  const n = nodes.length
  pointGeo = new THREE.BufferGeometry()
  posAttr = new THREE.BufferAttribute(new Float32Array(n * 3), 3)
  sizeAttr = new THREE.BufferAttribute(new Float32Array(n), 1)
  alphaAttr = new THREE.BufferAttribute(new Float32Array(n), 1)
  colorAttr = new THREE.BufferAttribute(new Float32Array(n * 3), 3)
  pointGeo.setAttribute('position', posAttr)
  pointGeo.setAttribute('aSize', sizeAttr)
  pointGeo.setAttribute('aAlpha', alphaAttr)
  pointGeo.setAttribute('aColor', colorAttr)
  pointMat = new THREE.ShaderMaterial({
    vertexShader: POINT_VERT,
    fragmentShader: POINT_FRAG,
    uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uFade: { value: 1 } },
    transparent: true,
    depthWrite: false,
    depthTest: false
  })
  disposables.push(pointGeo, pointMat)

  baseMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.13, depthWrite: false })
  basePos = lineSet(ppEdges.length, baseMat).pos
  ccMat = new THREE.LineBasicMaterial({ color: WARM, transparent: true, opacity: 0.26, depthWrite: false })
  ccPos = lineSet(ccEdges.length, ccMat).pos
  liveMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false })
  const live = lineSet(ppEdges.length + cpEdges.length + ccEdges.length + EVIDENCE_SLOTS, liveMat, true)
  liveLines = live.mesh
  livePos = live.pos
  liveCol = live.col!
  constMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.8, depthWrite: false })
  constPos = lineSet(CONST_SEGS, constMat).pos

  field.add(new THREE.Points(pointGeo, pointMat))
  resize()
}

function resize() {
  if (!renderer || !host.value) return
  const w = host.value.clientWidth
  const h = host.value.clientHeight
  if (!w || !h) return
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  metrics.w = w
  metrics.h = h
  metrics.halfH = Math.tan((FOV * Math.PI) / 360) * CAM_Z
  metrics.halfW = metrics.halfH * (w / h)
  metrics.portrait = w < h
  layoutTargets()
  requestAnimationFrame(measureCards)
}

/* ------------------------------------------------------------ layout */

function candidateCount() {
  return metrics.portrait || metrics.w < 760 || metrics.h < 520 ? 6 : 8
}

/** Where every node wants to be, and how it looks, given the phase. */
function layoutTargets() {
  const p = phase.value
  const siteMode = props.mode === 'site'
  const landscape = !metrics.portrait
  const cands = candidateIds.value
  const active = activeProblemKey.value
  const choosing = p === 'problem'
  const reviewing = p === 'review'
  const focusing = p === 'pattern'
  const gathered = p === 'patterns' || p === 'combine'
  const distilled = p === 'brief'
  const focusKey = patternFocus.value

  const lit = new Set<number>()
  const hoveredProblem = choosing && hovered.value !== null && isProblemKey(hovered.value)
  if (hoveredProblem) {
    const hi = nodeIndex.get(hovered.value!)
    ccEdges.forEach(([a, b]) => {
      if (a === hi) lit.add(nodes[b]!.key)
      if (b === hi) lit.add(nodes[a]!.key)
    })
  }

  if (siteMode) {
    fieldShift.tx = 0
    fieldShift.ty = 0
    fieldScale.t = 1
  } else if (choosing) {
    fieldShift.tx = 0
    fieldShift.ty = landscape ? -metrics.halfH * 0.04 : -metrics.halfH * 0.06
    fieldScale.t = landscape ? 1 : 0.9
  } else if (reviewing || focusing) {
    const short = landscape && metrics.h < 520
    fieldShift.tx = landscape && !short ? -metrics.halfW * 0.3 : 0
    fieldShift.ty = landscape && !short ? 0 : portraitColumn().ty
    fieldScale.t = 1
  } else if (distilled) {
    fieldShift.tx = landscape ? -metrics.halfW * 0.5 : 0
    fieldShift.ty = landscape ? metrics.halfH * 0.38 : metrics.halfH * 0.44
    fieldScale.t = 1
  } else if (free.valid) {
    fieldShift.tx = free.cx
    fieldShift.ty = free.cy
    fieldScale.t = 1
  } else {
    fieldShift.tx = 0
    fieldShift.ty = -metrics.halfH * 0.06
    fieldScale.t = 1
  }
  cam.tz = siteMode ? CAM_Z * 1.6 : CAM_Z
  fade.t = siteMode ? 0.5 : p === 'combine' ? 0.9 : 1

  // Phones (and short landscape screens) stack the patterns as a list of
  // nodes with their names beside them, instead of a ring they cannot fit.
  const stacked = !landscape || metrics.h < 520
  const twoCol = stacked && landscape
  const ringRx = free.valid ? free.rx : Math.min(metrics.halfW * 0.62, 5.2)
  const ringRy = free.valid ? free.ry : Math.min(metrics.halfH * (metrics.portrait ? 0.36 : 0.6), 3.6)
  const smallR = Math.min(landscape ? metrics.halfH * 0.22 : metrics.halfH * 0.13, 2.4)

  const evidenceCount = reviewing
    ? review.value?.evidence.length ?? 0
    : focusing
      ? patternReview.value?.examples.length ?? 0
      : 0
  const evAngles = [135, 180, 225]
  const evRadius = Math.min(metrics.halfH * 0.52, 2.7)
  // Portrait: where the focused node and its column of stories sit.
  const pFocusX = metrics.halfW * 0.62
  const pColX = -metrics.halfW * 0.9
  const pRows = portraitColumn().rows
  const shortLand = landscape && metrics.h < 520
  const focusPos = (out: THREE.Vector3) =>
    shortLand ? out.set(-metrics.halfW * 0.2, 0, 1.2) : landscape ? out.set(0, 0, 1.2) : out.set(pFocusX, 0, 1.2)
  const focusColor = focusing && focusKey !== null && selected.value.includes(focusKey)
    ? ACCENTS[selected.value.indexOf(focusKey)]!
    : INK

  nodes.forEach((n) => {
    if (n.kind === 'evidence') {
      const i = n.key - EVIDENCE_BASE
      if ((reviewing || focusing) && i < evidenceCount) {
        if (shortLand) {
          n.target.set(-metrics.halfW * 0.88, pRows[i]!, 1.0)
        } else if (landscape) {
          const a = (evAngles[i]! * Math.PI) / 180
          n.target.set(Math.cos(a) * evRadius, Math.sin(a) * evRadius, 1.0)
        } else {
          n.target.set(pColX, pRows[i]!, 1.0)
        }
        n.tAlpha = 0.95
        n.tSize = 6.5
        n.tColor.copy(reviewing ? WARM : focusColor)
      } else if (distilled && landscape && i === FUTURE_SLOT && brief.value?.headline) {
        // The front page hangs straight below the constellation.
        n.target.set(0, -smallR * 1.45, 0.8)
        n.tAlpha = 0.95
        n.tSize = 6.5
        n.tColor.copy(INK)
      } else {
        n.target.set(0, 0, 1.2)
        n.tAlpha = 0
        n.tSize = 3
        n.tColor.copy(WARM)
      }
      return
    }
    if (n.kind === 'problem') {
      const isActive = n.key === active
      if (reviewing && isActive) {
        focusPos(n.target)
        n.tAlpha = 1
        n.tSize = 13
        n.tColor.copy(WARM_DEEP)
      } else if (focusing && isActive) {
        // The problem steps aside while a pattern is read.
        n.target.set(0, 0, 1.2)
        n.tAlpha = 0
        n.tSize = 6
        n.tColor.copy(WARM)
      } else if (reviewing || focusing) {
        n.target.copy(n.home).multiplyScalar(1.15)
        n.target.z -= 7
        n.tAlpha = 0
        n.tSize = 4
        n.tColor.copy(WARM)
      } else if ((gathered || distilled) && isActive) {
        if (gathered && stacked) n.target.set(metrics.halfW * (twoCol ? 0.8 : 0.84), 0, 0.2)
        else n.target.set(0, 0, 0.2)
        n.tAlpha = 1
        n.tSize = p === 'combine' ? 11 : distilled ? 11 : 9.5
        n.tColor.copy(WARM_DEEP)
      } else if (gathered || distilled) {
        n.target.copy(n.home).multiplyScalar(1.6)
        n.tAlpha = 0
        n.tSize = 3
        n.tColor.copy(WARM)
      } else {
        n.target.copy(n.home)
        const isHover = hovered.value === n.key
        const on = lit.has(n.key)
        n.tAlpha = siteMode ? 0.8 : hoveredProblem ? (isHover ? 1 : on ? 0.95 : 0.35) : 1
        n.tSize = siteMode ? 6 : isHover ? 12 : on ? 9.5 : 8.5
        n.tColor.copy(isHover ? WARM_DEEP : WARM)
      }
      return
    }
    const ci = cands.indexOf(n.key)
    const si = selected.value.indexOf(n.key)
    if (focusing) {
      if (n.key === focusKey) {
        focusPos(n.target)
        n.tAlpha = 1
        n.tSize = 13
        n.tColor.copy(focusColor)
      } else {
        n.target.copy(n.home).multiplyScalar(1.3)
        n.target.z -= 6
        n.tAlpha = 0
        n.tSize = 3
        n.tColor.copy(INK)
      }
    } else if (distilled) {
      if (si >= 0) {
        const count = Math.max(1, selected.value.length)
        const a = -Math.PI / 2 + (si / count) * Math.PI * 2 + (count === 1 ? Math.PI / 2 : 0)
        n.target.set(Math.cos(a) * smallR, Math.sin(a) * smallR, 0.4)
        n.tAlpha = 1
        n.tSize = 9.5
        n.tColor.copy(ACCENTS[si]!)
      } else {
        n.target.copy(n.home).multiplyScalar(1.6)
        n.tAlpha = 0
        n.tSize = 3
        n.tColor.copy(INK)
      }
    } else if (gathered && ci >= 0 && stacked) {
      // a column (two on short landscape screens), names to the right
      const perCol = twoCol ? Math.ceil(cands.length / 2) : cands.length
      const col = twoCol ? Math.floor(ci / perCol) : 0
      const row = ci - col * perCol
      const span = free.valid ? free.ry : metrics.halfH * 0.5
      const y = span * (1 - (2 * (row + 0.5)) / perCol) * 0.94
      const x0 = twoCol ? (col === 0 ? -metrics.halfW * 0.86 : metrics.halfW * 0.04) : -metrics.halfW * 0.8
      const x = x0 + (row % 2 ? 0.14 : 0) + (si >= 0 ? 0.2 : 0)
      n.target.set(x, y, 0.6 + (row % 2 ? 0.12 : -0.12))
      n.tAlpha = 1
      n.tSize = si >= 0 ? 10 : hovered.value === n.key ? 8.5 : 7
      n.tColor.copy(si >= 0 ? ACCENTS[si]! : INK)
    } else if (gathered && ci >= 0) {
      const a = -Math.PI / 2 + (ci / cands.length) * Math.PI * 2
      const k = si >= 0 ? 0.78 : 1
      n.target.set(Math.cos(a) * ringRx * k, Math.sin(a) * ringRy * k, 0.6 + Math.sin(a * 3) * 0.3)
      n.tAlpha = 1
      n.tSize = si >= 0 ? 10 : hovered.value === n.key ? 8.5 : 7
      n.tColor.copy(si >= 0 ? ACCENTS[si]! : INK)
    } else if (gathered) {
      n.target.copy(n.home).multiplyScalar(1.3)
      n.tAlpha = p === 'patterns' ? 0.22 : 0.12
      n.tSize = 3.4
      n.tColor.copy(INK)
    } else {
      n.target.copy(n.home)
      n.tAlpha = siteMode ? 0.55 : 0
      n.tSize = 3.8
      n.tColor.copy(INK)
    }
  })
}

watch([phase, candidateIds, selected, hovered, patternFocus, () => props.mode], () => {
  if (phase.value !== 'patterns' && phase.value !== 'combine') free.valid = false
  layoutTargets()
})

/**
 * Upright phones: the three stories stand in a column under the HUD, spaced
 * by their measured height, so the column ends above the panel whatever the
 * screen. Returns the field's vertical shift and the three row offsets.
 */
function portraitColumn(): { ty: number; rows: number[] } {
  const shortLand = !metrics.portrait && metrics.h < 520
  const zCard = 1.0
  const pxPerUnit = (metrics.h / (2 * metrics.halfH)) * (CAM_Z / (CAM_Z - zCard))
  // the tallest card sets the rhythm (book examples run a line longer)
  const heights = [0, 1, 2].map((i) => parseFloat(labelEls.get(EVIDENCE_BASE + i)?.style.getPropertyValue('--h0') ?? '') || 0)
  const cardPx = Math.max(...heights) || 76
  const gapPx = 12
  const columnPx = 3 * cardPx + 2 * gapPx
  const headBottom = Math.max(48, headEl.value?.getBoundingClientRect().bottom ?? 56)
  // upright: between the HUD and the panel, which can rise to half the
  // screen; short landscape: the whole height beside the panel
  const top = headBottom + (shortLand ? 10 : 14)
  const room = (shortLand ? metrics.h - 12 : metrics.h * 0.5 - 12) - top
  const centerPx = top + (columnPx <= room ? room / 2 : columnPx / 2)
  const step = (cardPx + gapPx) / pxPerUnit
  return { ty: (metrics.h / 2 - centerPx) / pxPerUnit, rows: [step, 0, -step] }
}

function measureFree() {
  const head = headEl.value?.getBoundingClientRect()
  const foot = footEl.value?.getBoundingClientRect()
  if (!head || !foot || !metrics.w) return
  const w = metrics.w
  const h = metrics.h
  const left = metrics.portrait ? 110 : 220
  const right = w - left
  const top = head.bottom + 48
  const bottom = foot.top - 40
  if (right - left < 120 || bottom - top < 120) return
  const wpp = (2 * metrics.halfW) / w
  const cx = ((left + right) / 2 - w / 2) * wpp
  const cy = -((top + bottom) / 2 - h / 2) * wpp
  let rx = ((right - left) / 2) * wpp
  let ry = ((bottom - top) / 2) * wpp
  if (!(metrics.portrait || metrics.h < 520)) {
    rx = Math.min(rx, ry * 1.7)
    ry = Math.min(ry, rx * 1.4)
  }
  const changed =
    !free.valid ||
    Math.abs(cx - free.cx) > 0.05 ||
    Math.abs(cy - free.cy) > 0.05 ||
    Math.abs(rx - free.rx) > 0.05 ||
    Math.abs(ry - free.ry) > 0.05
  Object.assign(free, { cx, cy, rx, ry, valid: true })
  if (changed) layoutTargets()
}

/* ------------------------------------------------------------- loop */

const ease = (a: number, b: number, k: number) => a + (b - a) * k

function tick(now: number) {
  if (!running || !renderer) return
  frame = requestAnimationFrame(tick)
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016)
  lastT = now
  clockT += dt
  const k = 1 - Math.pow(0.06, dt)
  const kSlow = 1 - Math.pow(0.32, dt)
  const motion = reduceMotion ? 0.2 : 1
  const p = phase.value
  const gameOn = props.mode === 'game'
  const choosing = p === 'problem'
  const focused = p === 'review' || p === 'pattern'
  const gathered = p === 'patterns' || p === 'combine'
  const distilled = p === 'brief'
  const combining = p === 'combine'

  if (now - lastMeasure > 250) {
    lastMeasure = now
    const head = headEl.value?.getBoundingClientRect()
    if (head && gameOn) {
      Object.assign(keepOut, { l: head.left - 8, r: head.right + 8, t: head.top - 8, b: head.bottom + 8, valid: true })
    } else keepOut.valid = false
    if (gathered) measureFree()
  }

  cam.z = ease(cam.z, cam.tz, kSlow)
  cam.x = ease(cam.x, cam.px * 0.4 * motion, kSlow)
  cam.y = ease(cam.y, cam.py * 0.25 * motion, kSlow)
  camera.position.set(cam.x, cam.y, cam.z)
  camera.lookAt(0, 0, 0)

  fieldShift.x = ease(fieldShift.x, fieldShift.tx, kSlow)
  fieldShift.y = ease(fieldShift.y, fieldShift.ty, kSlow)
  field.position.set(fieldShift.x, fieldShift.y, 0)
  fieldScale.v = ease(fieldScale.v, fieldScale.t, kSlow)
  field.scale.setScalar(fieldScale.v)

  const idle = now - rot.lastDrag > 2500 && hovered.value === null && armed.value === null
  const autoTarget = gameOn && choosing && idle ? 0.12 * motion : 0
  rot.auto = ease(rot.auto, autoTarget, kSlow)
  if (!drag.active) {
    rot.y += rot.vy * dt + rot.auto * dt
    rot.x += rot.vx * dt
    rot.vx *= Math.pow(0.08, dt)
    rot.vy *= Math.pow(0.08, dt)
  }
  if (rot.settle && !drag.active && Math.abs(rot.vx) + Math.abs(rot.vy) < 0.05) {
    rot.y = ease(rot.y, Math.round(rot.y / (Math.PI * 2)) * Math.PI * 2, kSlow)
    rot.x = ease(rot.x, 0, kSlow)
  }
  rot.x = Math.max(-1.3, Math.min(1.3, rot.x))
  const sway = combining ? 0.55 : 0.09
  field.rotation.y = rot.y + (choosing || focused ? 0 : Math.sin(clockT * sway) * 0.1 * motion)
  field.rotation.x = rot.x + (choosing ? 0.16 : 0) + (focused ? 0 : Math.cos(clockT * 0.07) * 0.06 * motion)

  fade.v = ease(fade.v, fade.t, kSlow)
  pointMat.uniforms.uFade!.value = fade.v
  const siteMode = !gameOn
  baseMat.opacity = ease(baseMat.opacity, (gathered ? 0.09 : siteMode ? 0.13 : 0) * fade.v, kSlow)
  ccMat.opacity = ease(ccMat.opacity, (choosing || siteMode ? 0.26 : 0) * fade.v, kSlow)
  constMat.opacity = (distilled ? 0.85 : 0.8) * fade.v

  const active = activeProblemKey.value
  nodes.forEach((n, i) => {
    n.pos.lerp(n.target, kSlow)
    const still = n.key === active || n.kind === 'evidence' || n.key === patternFocus.value || (distilled && selected.value.includes(n.key))
    const dr = (gathered ? 0.05 : 0.1) * motion * (still ? 0 : 1)
    const x = n.pos.x + Math.sin(clockT * 0.35 + n.drift) * dr
    const y = n.pos.y + Math.cos(clockT * 0.29 + n.drift * 1.7) * dr
    const z = n.pos.z + Math.sin(clockT * 0.23 + n.drift * 0.6) * dr
    posAttr.setXYZ(i, x, y, z)
    let ts = n.tSize
    if (n.kind === 'problem' && choosing) ts *= 1 + Math.sin(clockT * 1.6 + n.drift) * 0.09
    if (focused && (n.key === active || n.key === patternFocus.value)) ts *= 1 + Math.sin(clockT * 1.4) * 0.06
    if (combining && (n.key === active || selected.value.includes(n.key))) ts *= 1 + Math.sin(clockT * 3 + i) * 0.12
    n.size = ease(n.size, ts, k)
    n.alpha = ease(n.alpha, n.tAlpha, k)
    n.color.lerp(n.tColor, k)
    const cue = choosing ? 0.4 + 0.6 * n.depth : 1
    sizeAttr.setX(i, n.size * (choosing ? 0.8 + 0.4 * n.depth : 1))
    alphaAttr.setX(i, n.alpha * cue)
    colorAttr.setXYZ(i, n.color.r, n.color.g, n.color.b)
  })
  posAttr.needsUpdate = true
  sizeAttr.needsUpdate = true
  alphaAttr.needsUpdate = true
  colorAttr.needsUpdate = true

  const at = (idx: number) => [posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx)] as const
  ppEdges.forEach(([a, b], e) => {
    basePos.setXYZ(e * 2, ...at(a))
    basePos.setXYZ(e * 2 + 1, ...at(b))
  })
  ccEdges.forEach(([a, b], e) => {
    ccPos.setXYZ(e * 2, ...at(a))
    ccPos.setXYZ(e * 2 + 1, ...at(b))
  })
  basePos.needsUpdate = true
  ccPos.needsUpdate = true

  // Live relations: a hovered problem's, the focus's evidence spokes, or the ring's.
  const candSet = new Set(candidateIds.value)
  const activeIdx = active !== null ? nodeIndex.get(active) : undefined
  const hoverIdx = choosing && hovered.value !== null && isProblemKey(hovered.value) ? nodeIndex.get(hovered.value) : undefined
  const focusIdx = p === 'review' ? activeIdx : p === 'pattern' && patternFocus.value !== null ? nodeIndex.get(patternFocus.value) : undefined
  let live = 0
  const push = (a: number, b: number) => {
    const na = nodes[a]!, nb = nodes[b]!
    livePos.setXYZ(live * 2, ...at(a))
    livePos.setXYZ(live * 2 + 1, ...at(b))
    liveCol.setXYZ(live * 2, na.color.r, na.color.g, na.color.b)
    liveCol.setXYZ(live * 2 + 1, nb.color.r, nb.color.g, nb.color.b)
    live++
  }
  if (hoverIdx !== undefined) {
    ccEdges.forEach(([a, b]) => (a === hoverIdx || b === hoverIdx) && push(a, b))
  } else if (focusIdx !== undefined) {
    for (let i = 0; i < EVIDENCE_SLOTS; i++) {
      const ei = nodeIndex.get(EVIDENCE_BASE + i)!
      if (nodes[ei]!.alpha > 0.05) push(focusIdx, ei)
    }
  } else if (gathered) {
    ppEdges.forEach(([a, b]) => candSet.has(nodes[a]!.key) && candSet.has(nodes[b]!.key) && push(a, b))
    cpEdges.forEach(([a, b]) => a === activeIdx && candSet.has(nodes[b]!.key) && push(a, b))
  } else if (distilled && activeIdx !== undefined) {
    const fi = nodeIndex.get(EVIDENCE_BASE + FUTURE_SLOT)!
    if (nodes[fi]!.alpha > 0.05) push(activeIdx, fi)
  }
  liveLines.geometry.setDrawRange(0, live * 2)
  livePos.needsUpdate = true
  liveCol.needsUpdate = true
  liveMat.opacity = ease(liveMat.opacity, live ? (gathered ? 0.4 : focused ? 0.45 : 0.6) * fade.v : 0, k)

  const sel = selected.value.map((id) => nodeIndex.get(id)!)
  const pi = activeIdx
  const segs: Array<[number, number] | null> = [
    pi !== undefined && sel[0] !== undefined ? [pi, sel[0]] : null,
    pi !== undefined && sel[1] !== undefined ? [pi, sel[1]] : null,
    pi !== undefined && sel[2] !== undefined ? [pi, sel[2]] : null,
    sel[0] !== undefined && sel[1] !== undefined ? [sel[0], sel[1]] : null,
    sel[1] !== undefined && sel[2] !== undefined ? [sel[1], sel[2]] : null,
    sel[2] !== undefined && sel[0] !== undefined ? [sel[2], sel[0]] : null
  ]
  segs.forEach((s, j) => {
    const hide = focused
    constProgress[j] = ease(constProgress[j]!, s && !hide ? 1 : 0, kSlow * 0.8)
    if (!s) {
      constPos.setXYZ(j * 2, 0, 0, 0)
      constPos.setXYZ(j * 2 + 1, 0, 0, 0)
      return
    }
    const [a, b] = s
    const [ax, ay, az] = at(a)
    const [bx, by, bz] = at(b)
    const t = constProgress[j]!
    constPos.setXYZ(j * 2, ax, ay, az)
    constPos.setXYZ(j * 2 + 1, ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t)
  })
  constPos.needsUpdate = true

  renderer.render(scene, camera)
  project()
}

function project() {
  field.updateMatrixWorld()
  let zMin = Infinity
  let zMax = -Infinity
  nodes.forEach((n, i) => {
    tmp.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
    field.localToWorld(tmp)
    n.depth = tmp.z
    if (n.alpha > 0.05) {
      zMin = Math.min(zMin, tmp.z)
      zMax = Math.max(zMax, tmp.z)
    }
    tmp.project(camera)
    n.sx = (tmp.x * 0.5 + 0.5) * metrics.w
    n.sy = (-tmp.y * 0.5 + 0.5) * metrics.h
    n.onScreen = tmp.z < 1
  })
  const span = Math.max(0.001, zMax - zMin)
  nodes.forEach((n) => (n.depth = Math.max(0, Math.min(1, (n.depth - zMin) / span))))
  placeLabels()
  pick()
}

function start() {
  if (running || !renderer) return
  running = true
  lastT = performance.now()
  frame = requestAnimationFrame(tick)
}
function stop() {
  running = false
  if (frame !== null) cancelAnimationFrame(frame)
  frame = null
}

/* ------------------------------------------------------------ labels */

const labelEls = new Map<number, HTMLElement>()
function setLabelEl(key: number, el: unknown) {
  if (el instanceof HTMLElement) {
    const fresh = labelEls.get(key) !== el
    labelEls.set(key, el)
    if (fresh && el.classList.contains('ecard--story')) {
      requestAnimationFrame(() => {
        measureCard(el)
        if (metrics.portrait) layoutTargets()
      })
    }
  } else labelEls.delete(key)
}

/**
 * A story card is one frame with two faces inside, each laid out at its
 * final size: the compact face at rest, the full face when read. The frame
 * grows between their measured heights, so nothing reflows on the way.
 */
function measureCard(el: HTMLElement) {
  const small = el.querySelector<HTMLElement>('.ecard__face--s')
  const large = el.querySelector<HTMLElement>('.ecard__face--l')
  if (!small || !large || !small.offsetHeight) return
  el.style.setProperty('--h0', `${small.offsetHeight + 2}px`)
  el.style.setProperty('--h1', `${Math.max(large.offsetHeight, small.offsetHeight) + 2}px`)
}
function measureCards() {
  for (const el of labelEls.values()) if (el.classList.contains('ecard--story')) measureCard(el)
}
/** Mouse: a card opens while the pointer rests on it. Touch never hovers. */
function onCardEnter(key: number, e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  cardHover.value = key
  measureCard(e.currentTarget as HTMLElement)
}
function onCardLeave(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  cardHover.value = null
}
/**
 * Touch: the first tap opens a card where it stands (the others step back),
 * the second follows its link. A card with no link closes on a second tap.
 * Mouse clicks follow the link straight away, as before.
 */
let cardPointer = 'mouse'
function onCardClick(key: number, e: MouseEvent, hasUrl: boolean) {
  if (cardPointer === 'mouse') return
  if (cardOpen.value !== key) {
    e.preventDefault()
    cardOpen.value = key
    const el = e.currentTarget as HTMLElement
    if (el.classList.contains('ecard--story')) measureCard(el)
    return
  }
  if (!hasUrl) {
    e.preventDefault()
    cardOpen.value = null
  }
}

// slot: -4 a wicked problem to pick, -1 a candidate, 0–2 a chosen pattern.
interface LabelItem { key: number; title: string; slot: number }
const labelItems = computed<LabelItem[]>(() => {
  const p = phase.value
  if (p === 'problem') return allChallenges.map((c) => ({ key: problemKey(c.id), title: c.title, slot: -4 }))
  if (p === 'brief') return selected.value.map((id, i) => ({ key: id, title: byId.get(id)?.title ?? '', slot: i }))
  if (p !== 'patterns') return []
  return candidateIds.value.map((id) => ({ key: id, title: byId.get(id)?.title ?? '', slot: selected.value.indexOf(id) }))
})

type Side = 'right' | 'left' | 'below'
const sides = new Map<number, Side>()
interface Placed { l: number; r: number; t: number; b: number; rank: number; el: HTMLElement; key: number }
/** Names shown last frame keep their place, so the web does not flicker as it turns. */
let shownLast = new Set<number>()
const placed: Placed[] = []
/** Where each interactive name sits on screen, for picking by pointer. */
const labelRects = new Map<number, { l: number; r: number; t: number; b: number }>()

/**
 * Opacity is settled for every name first and written once at the end. A
 * provisional write followed by a later "hide" in the same frame looks
 * harmless, but the layout reads in between commit the first value, so the
 * fade restarts every frame and hidden names hover half-visible.
 */
const pendingOp = new Map<HTMLElement, number>()

function placeLabels() {
  placed.length = 0
  labelRects.clear()
  pendingOp.clear()
  const gameOn = props.mode === 'game'
  for (const [key, el] of labelEls) {
    const n = nodes[nodeIndex.get(key) ?? -1]
    if (!n || !n.onScreen || !gameOn) {
      el.style.opacity = '0'
      el.style.setProperty('--op', '0')
      continue
    }
    const isCard = el.classList.contains('ecard')
    const width = el.offsetWidth
    const height = el.offsetHeight
    // On the brief, names stay out of the pitch sheet.
    const rightLimit = phase.value === 'brief' && !metrics.portrait && sheetEl.value
      ? sheetEl.value.getBoundingClientRect().left - 12
      : metrics.w - 8
    const fitsRight = n.sx + 16 + width <= rightLimit
    const fitsLeft = n.sx - 16 - width >= 8
    const centreX = metrics.w / 2 + (fieldShift.x / (2 * metrics.halfW)) * metrics.w
    // Side with hysteresis, and frozen entirely while the name is under the
    // pointer, so hovering can never make it jump.
    const prev = sides.get(key)
    let side: Side
    const stackedNames = (phase.value === 'patterns' || phase.value === 'combine') && (metrics.portrait || metrics.h < 520) && el.classList.contains('is-cand')
    if (key === EVIDENCE_BASE + FUTURE_SLOT && phase.value === 'brief') side = 'below'
    else if (stackedNames) side = fitsRight ? 'right' : 'left'
    else if (prev && (hovered.value === key || armed.value === key || readKey.value === key)) side = prev
    else {
      const wantRight = n.sx >= centreX + (prev === 'left' ? 40 : prev === 'right' ? -40 : 0)
      if (prev && ((prev === 'right' && fitsRight) || (prev === 'left' && fitsLeft)) && (prev === 'right') === wantRight) side = prev
      else if (wantRight) side = fitsRight ? 'right' : fitsLeft ? 'left' : 'below'
      else side = fitsLeft ? 'left' : fitsRight ? 'right' : 'below'
    }
    sides.set(key, side)
    let x = n.sx
    if (side === 'below') x = Math.min(metrics.w - 8 - width / 2, Math.max(8 + width / 2, n.sx))
    else if (!isCard) {
      // a name never runs off the screen: it slides in, away from its dot
      const left = side === 'left' ? x - 16 - width : x + 16
      if (left < 6) x += 6 - left
      else if (left + width > metrics.w - 6) x -= left + width - (metrics.w - 6)
    }
    el.classList.toggle('is-left', side === 'left')
    el.classList.toggle('is-below', side === 'below')
    // A card grows when read; keep all of it on screen.
    const reach = isCard && side !== 'below' ? Math.max(24, height / 2 + 12) : 24
    const y = Math.min(metrics.h - reach, Math.max(reach, n.sy))
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`

    const pickable = el.classList.contains('is-pick')
    const interactive = pickable || el.classList.contains('is-cand')
    let opacity = Math.min(1, n.alpha * 1.2)
    if (pickable) {
      const h = hovered.value ?? armed.value
      opacity = h === key ? 1 : h !== null ? Math.min(0.9, n.alpha) : 0.55 + 0.45 * n.depth
    }
    // while one pattern is open, the others step back
    if (el.classList.contains('is-cand')) {
      const h = hovered.value ?? armed.value
      if (h !== null && h !== key) opacity *= 0.35
    }
    if (isCard) el.style.setProperty('--op', String(opacity))
    else pendingOp.set(el, opacity)

    const l = side === 'left' ? x - 16 - width : side === 'right' ? x + 16 : x - width / 2
    const t = side === 'below' ? y + 8 : y - height / 2
    // An open name owns the room its two options take up beneath it.
    const open = interactive && (hovered.value === key || armed.value === key)
    const opts = open ? el.querySelector<HTMLElement>('.nlabel__opts')?.getBoundingClientRect() : undefined
    const hasOpts = !!opts && opts.width > 0
    if (interactive) {
      labelRects.set(key, hasOpts
        ? { l: Math.min(l, opts!.left), r: Math.max(l + width, opts!.right), t, b: Math.max(t + height, opts!.bottom + 6) }
        : { l, r: l + width, t, b: t + height })
    }

    if (pickable) {
      const rect: Placed = { l, r: l + width, t: y - height / 2, b: y + height / 2, rank: n.depth + (open ? 10 : 0) + (shownLast.has(key) ? 0.35 : 0), el, key }
      if (side === 'below') {
        rect.t = y + 8
        rect.b = y + 8 + height
      }
      if (hasOpts) {
        rect.l = Math.min(rect.l, opts!.left)
        rect.r = Math.max(rect.r, opts!.right)
        rect.b = Math.max(rect.b, opts!.bottom + 4)
      }
      if (keepOut.valid && rect.l < keepOut.r && rect.r > keepOut.l && rect.t < keepOut.b && rect.b > keepOut.t) {
        pendingOp.set(el, 0)
        labelRects.delete(key)
        continue
      }
      placed.push(rect)
    }
  }
  placed.sort((a, b) => b.rank - a.rank)
  const kept: Placed[] = []
  const shown = new Set<number>()
  for (const rect of placed) {
    const hit = kept.some((k) => rect.l < k.r + 10 && rect.r > k.l - 10 && rect.t < k.b && rect.b > k.t)
    if (hit) {
      // Out of the way, and out of reach: a hidden name must never take a tap.
      pendingOp.set(rect.el, 0)
      rect.el.classList.add('is-culled')
      labelRects.delete(rect.key)
    } else {
      kept.push(rect)
      rect.el.classList.remove('is-culled')
      shown.add(rect.key)
    }
  }
  shownLast = shown
  for (const [el, op] of pendingOp) {
    const value = String(Math.round(op * 1000) / 1000)
    if (el.style.opacity !== value) el.style.opacity = value
  }
}

/* --------------------------------------------------------- pointer */

const pointer = { x: -1, y: -1, touch: false, downKey: null as number | null }
const drag = { active: false, moved: false, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0 }

function onPointerMove(e: PointerEvent) {
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.touch = e.pointerType !== 'mouse'
  if (drag.active) {
    const dx = e.clientX - drag.lx
    const dy = e.clientY - drag.ly
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true
    if (drag.moved) {
      const dt = Math.max(0.008, (e.timeStamp - drag.lt) / 1000)
      rot.y += dx * 0.0055
      rot.x += dy * 0.0055
      rot.vy = (dx * 0.0055) / dt
      rot.vx = (dy * 0.0055) / dt
      rot.settle = false
      rot.lastDrag = performance.now()
    }
    drag.lx = e.clientX
    drag.ly = e.clientY
    drag.lt = e.timeStamp
    return
  }
  if (!pointer.touch) {
    cam.px = (e.clientX / metrics.w - 0.5) * 2
    cam.py = -(e.clientY / metrics.h - 0.5) * 2
  }
}
function onPointerDown(e: PointerEvent) {
  const target = e.target as Element | null
  const card = target?.closest('.ecard')
  if (card) cardPointer = e.pointerType
  else if (cardOpen.value !== null) cardOpen.value = null
  if (target?.closest('.ui, .ecard, .nlabel__opts, .intro')) return
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.touch = e.pointerType !== 'mouse'
  Object.assign(drag, { active: true, moved: false, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: e.timeStamp })
  rot.vx = 0
  rot.vy = 0
  pick()
  pointer.downKey = hovered.value
}
function onPointerUp(e: PointerEvent) {
  if (!drag.active) return
  const wasDrag = drag.moved
  drag.active = false
  if (wasDrag) {
    if (e.timeStamp - drag.lt > 80) {
      rot.vx = 0
      rot.vy = 0
    }
    pointer.downKey = null
    return
  }
  pointer.x = e.clientX
  pointer.y = e.clientY
  pick()
  const key = hovered.value ?? pointer.downKey
  pointer.downKey = null
  if (key !== null) activate(key, pointer.touch)
  else if (pointer.touch) armed.value = null
}
function onPointerLeave() {
  pointer.x = -1
  pointer.y = -1
  cam.px = 0
  cam.py = 0
  drag.active = false
}

/** The node under the pointer: by its name's box first, then by distance. */
function pick() {
  const p = phase.value
  if (props.mode !== 'game' || intro.value || pointer.x < 0 || (p !== 'problem' && p !== 'patterns') || drag.moved || ideasOpen.value) {
    if (hovered.value !== null) hovered.value = null
    return
  }
  const reach = pointer.touch ? 44 : 30
  let best: number | null = null
  let bestD = reach
  const keys = p === 'problem' ? allChallenges.map((c) => problemKey(c.id)) : candidateIds.value
  const inside = (r: { l: number; r: number; t: number; b: number }) =>
    pointer.x >= r.l && pointer.x <= r.r && pointer.y >= r.t && pointer.y <= r.b
  // The open name keeps the pointer while it travels down to the options.
  const cur = hovered.value
  const curRect = cur !== null ? labelRects.get(cur) : undefined
  if (cur !== null && keys.includes(cur) && curRect && inside(curRect)) best = cur
  else {
    for (const [key, r] of labelRects) {
      if (keys.includes(key) && inside(r)) {
        best = key
        break
      }
    }
  }
  if (best === null) {
    for (const key of keys) {
      const n = nodes[nodeIndex.get(key)!]!
      if (!n.onScreen) continue
      const d = Math.hypot(n.sx - pointer.x, n.sy - pointer.y)
      if (d < bestD) {
        bestD = d
        best = key
      }
    }
  }
  labelHover.value = best
  if (best !== hovered.value) hovered.value = best
}

let lastActivate = 0
function activate(key: number, touch = false) {
  const now = performance.now()
  if (now - lastActivate < 350) return
  lastActivate = now
  // On touch there is no hover: the first tap shows the options.
  if (touch && armed.value !== key) {
    armed.value = key
    return
  }
  armed.value = null
  if (phase.value === 'problem' && isProblemKey(key)) {
    const c = challengeById.get(key - PROBLEM_BASE)
    if (c) reviewProblem(c)
  } else if (phase.value === 'patterns' && !isProblemKey(key)) {
    openPattern(key)
  }
}

/** The two ways out of a hovered name: read it first, or take it now. */
function learnMore(key: number) {
  lastActivate = 0
  armed.value = null
  activate(key)
}
function quickSelect(key: number) {
  if (phase.value === 'problem' && isProblemKey(key)) {
    const c = challengeById.get(key - PROBLEM_BASE)
    if (!c) return
    armed.value = null
    hovered.value = null
    labelHover.value = null
    challenge.value = c
    confirmProblem()
  } else if (phase.value === 'patterns' && !isProblemKey(key)) {
    togglePattern(key)
  }
}
function selectWord(key: number) {
  if (isProblemKey(key)) return 'Select'
  if (selected.value.includes(key)) return 'Remove'
  return selected.value.length >= 3 ? 'Three chosen' : 'Select'
}
watch(phase, () => {
  armed.value = null
  cardHover.value = null
  cardOpen.value = null
  briefScroll.value = 0
})

/* --------------------------------------------------------- the game */

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

const shown = new Set<number>()

function draw(count: number, keep: number[]): number[] {
  const c = challenge.value
  const related = c ? allPatterns.filter((p) => c.relatedPatterns.includes(p.title) && !keep.includes(p.id)) : []
  const fresh = allPatterns.filter((p) => !keep.includes(p.id) && !shown.has(p.id) && !related.includes(p))
  const rest = allPatterns.filter((p) => !keep.includes(p.id) && !related.includes(p))
  const pool = [...shuffleArray(related), ...shuffleArray(fresh), ...shuffleArray(rest)]
  const out: number[] = []
  for (const p of pool) {
    if (out.length >= count) break
    if (!out.includes(p.id)) out.push(p.id)
  }
  out.forEach((id) => shown.add(id))
  return out
}

function resetEvidence() {
  const from = metrics.portrait ? metrics.halfW * 0.62 : 0
  for (let i = 0; i < EVIDENCE_SLOTS; i++) {
    const n = nodes[nodeIndex.get(EVIDENCE_BASE + i)!]!
    n.pos.set(from, 0, 1.2)
    n.alpha = 0
  }
}

function reviewProblem(c: Challenge) {
  challenge.value = c
  hovered.value = null
  labelHover.value = null
  rot.settle = true
  resetEvidence()
  phase.value = 'review'
}

function confirmProblem() {
  if (!challenge.value) return
  shown.clear()
  selected.value = []
  candidateIds.value = draw(candidateCount(), [])
  rot.settle = true
  phase.value = 'patterns'
  beginPatternIntro()
}

function openPattern(id: number) {
  patternFocus.value = id
  hovered.value = null
  labelHover.value = null
  rot.settle = true
  resetEvidence()
  phase.value = 'pattern'
}

function closePattern() {
  patternFocus.value = null
  phase.value = 'patterns'
}

function togglePattern(id: number) {
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter((s) => s !== id)
    return
  }
  if (selected.value.length >= 3) return
  selected.value = [...selected.value, id]
}

function addFocused() {
  if (patternFocus.value === null) return
  togglePattern(patternFocus.value)
  closePattern()
}

function reshuffle() {
  const keep = selected.value
  candidateIds.value = [...keep, ...draw(candidateCount() - keep.length, keep)]
}

function changeProblem() {
  selected.value = []
  candidateIds.value = []
  challenge.value = null
  patternFocus.value = null
  hovered.value = null
  rot.settle = false
  phase.value = 'problem'
}

function playAgain() {
  brief.value = null
  briefScroll.value = 0
  changeProblem()
}

/* ---------------------------------------------------------------- PAL */

const clip = (s: string | undefined, n: number) => {
  const t = (s ?? '').replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`
}

const TOWN = 'Cañon City, Colorado'

function buildPrompt(c: Challenge, ps: Pattern[]) {
  const block = ps
    .map((p, i) => `${i + 1}. ${p.title} — ${clip(p.description, 160)} Solution: ${clip(p.solution, 240)}`)
    .join('\n')
  const count = ps.length === 1 ? 'the pattern' : `the ${ps.length} patterns`
  return [
    `You are helping a team at a one-day community solution sprint in ${TOWN}, a rural town of about 17,000 in Fremont County. Turn ${count} below into ONE project that answers the challenge for ${TOWN}, planned as its first 90 days.`,
    `CHALLENGE: ${c.title} — ${clip(c.description, 200)}`,
    ps.length === 1 ? 'PATTERN:' : 'PATTERNS:',
    block,
    '',
    'Reply in exactly this shape, plain text, no markdown, no preamble, under 170 words total:',
    'NAME: <a quiet two-or-three word project name, no puns>',
    'PITCH: <one sentence, what it is and who it is for>',
    'BUILD:',
    '- <days 1 to 30, get started: one concrete step, max 14 words>',
    '- <days 31 to 60, build it: one concrete step, max 14 words>',
    '- <days 61 to 90, show it: what people outside the team can see, max 14 words>',
    'ASK: <one sentence naming who in Cañon City to bring in first>',
    'HEADLINE: <the headline a local paper would run a year after this worked, max 12 words, no em dashes>',
    `LEDE: <the first two sentences of that article, max 45 words, datelined "CAÑON CITY, Colo." then the text>`
  ].join('\n')
}

const clean = (s: string) => s.replace(/\*\*|__|^["'“”]+|["'“”]+$/g, '').trim()

function parseBrief(text: string): Omit<Brief, 'source'> | null {
  const grab = (label: string, stop: string) =>
    new RegExp(`${label}:\\s*([\\s\\S]+?)(?:\\n\\s*(?:${stop}):|$)`, 'i').exec(text)?.[1]
  const name = /NAME:\s*(.+)/i.exec(text)?.[1]
  const pitch = grab('PITCH', 'BUILD|ASK|HEADLINE|LEDE')
  const buildBlock = grab('BUILD', 'ASK|HEADLINE|LEDE') ?? ''
  const ask = grab('ASK', 'HEADLINE|LEDE')
  const headline = /HEADLINE:\s*(.+)/i.exec(text)?.[1]
  const lede = grab('LEDE', 'NAME|PITCH|BUILD|ASK|HEADLINE')
  const build = buildBlock
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3)
  if (!name || !pitch || build.length < 2) return null
  return {
    name: clean(name),
    pitch: clean(pitch.replace(/\n/g, ' ')),
    build: build.map(clean),
    ask: clean((ask ?? '').replace(/\n/g, ' ')),
    headline: clean((headline ?? '').replace(/—/g, ',')),
    lede: clean((lede ?? '').replace(/\n/g, ' ').replace(/—/g, ','))
  }
}

const firstWord = (t: string) => t.split(/[\s-]+/)[0] ?? t
const lastWord = (t: string) => t.split(/[\s-]+/).pop() ?? t

function localBrief(c: Challenge, ps: Pattern[]): Brief {
  const a = ps[0]!
  const b = ps[1] ?? ps[0]!
  const d = ps[2] ?? b
  let name = `${firstWord(a.title)} ${lastWord(b.title)}`
  if (firstWord(a.title).toLowerCase() === lastWord(b.title).toLowerCase()) name = `${firstWord(a.title)} ${lastWord(d.title)}`
  const list = ps.map((p) => p.title)
  const joined = list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0]!
  return {
    name,
    pitch: `${joined}, folded into one thing ${TOWN.split(',')[0]} could start on against ${c.title.toLowerCase()}.`,
    build: [a, b, d].map((p) => clip(p.implementation?.[0] ?? p.solution ?? p.description, 96)),
    ask: `Begin with the people already inside the problem, the ones who notice “${clip(c.manifestations[0], 70).toLowerCase()}” every week.`,
    headline: `A year on, ${name} has changed how Cañon City handles ${c.title.toLowerCase()}`,
    lede: `CAÑON CITY, Colo. A project that began as a pitch at a community solution sprint now shapes how the town answers ${c.title.toLowerCase()}. Residents say the difference is who is in the room.`,
    source: 'local'
  }
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function combine() {
  const c = challenge.value
  const ps = selectedPatterns.value
  if (!c || ps.length < 1 || phase.value !== 'patterns') return
  phase.value = 'combine'
  hovered.value = null

  const lines = [...ps.map((p) => `Reading ${p.title}`), 'Writing the pitch', 'Writing next year’s front page']
  let li = 0
  combineLine.value = lines[0]!
  const lineTimer = setInterval(() => {
    li = Math.min(li + 1, lines.length - 1)
    combineLine.value = lines[li]!
  }, 1100)

  const fallback = localBrief(c, ps)
  const minimum = wait(3500 + ps.length * 1100)
  let result: Brief = fallback
  try {
    const timeout = wait(24000).then(() => {
      throw new Error('PAL took too long')
    })
    const response = await Promise.race([demoApi.sendMessage([], buildPrompt(c, ps), 'Cañon City', 'Colorado'), timeout])
    const parsed = parseBrief(response.content)
    if (parsed) {
      result = {
        ...parsed,
        headline: parsed.headline || fallback.headline,
        lede: parsed.lede || fallback.lede,
        source: 'pal'
      }
    }
  } catch {
    result = fallback
  }
  await minimum
  clearInterval(lineTimer)
  brief.value = result
  resetEvidence()
  rot.settle = true
  phase.value = 'brief'
  void keepIdea(c, ps, result)
}

function bringIt() {
  const b = brief.value
  if (!b) return
  emit('close', 'register', { name: b.name, pitch: b.pitch })
}

/* ------------------------------------------------- ideas: yours and everyone's */

const ANON_KEY = 'plh.anon'
const IDEAS_KEY = 'plh.ideas'

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode; the session still works */
  }
}

/** A random per-browser token: the anonymous profile. */
function anonId(): string {
  let id = readStore<string>(ANON_KEY, '')
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')
    writeStore(ANON_KEY, id)
  }
  return id
}

const savedIdeas = ref<SavedIdea[]>(readStore<SavedIdea[]>(IDEAS_KEY, []))
const currentIdeaId = ref<string | null>(null)

async function keepIdea(c: Challenge, ps: Pattern[], b: Brief) {
  const idea: SavedIdea = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    challengeId: c.id,
    problem: c.title,
    patternIds: ps.map((p) => p.id),
    patterns: ps.map((p) => p.title),
    brief: b
  }
  savedIdeas.value = [idea, ...savedIdeas.value].slice(0, 40)
  writeStore(IDEAS_KEY, savedIdeas.value)
  currentIdeaId.value = idea.id
  try {
    const { id } = await hackathonApi.postIdea({
      eventSlug: HACKATHON_SLUG,
      anonId: anonId(),
      problem: idea.problem,
      patterns: idea.patterns,
      name: b.name,
      pitch: b.pitch,
      build: b.build,
      ask: b.ask,
      headline: b.headline,
      lede: b.lede
    })
    idea.remoteId = id
    writeStore(IDEAS_KEY, savedIdeas.value)
    void loadBoard()
  } catch {
    /* offline or the board is down; the idea is still kept here */
  }
}

function forgetIdea(id: string) {
  savedIdeas.value = savedIdeas.value.filter((i) => i.id !== id)
  writeStore(IDEAS_KEY, savedIdeas.value)
}

/** Reopen a kept idea on the brief. */
function openIdea(idea: SavedIdea) {
  const c = challengeById.get(idea.challengeId)
  if (!c) return
  challenge.value = c
  selected.value = idea.patternIds.filter((id) => byId.has(id))
  candidateIds.value = selected.value
  patternFocus.value = null
  brief.value = idea.brief
  currentIdeaId.value = idea.id
  ideasOpen.value = false
  resetEvidence()
  rot.settle = true
  phase.value = 'brief'
}

function handoff(idea?: SavedIdea) {
  const target = idea ?? savedIdeas.value.find((i) => i.id === currentIdeaId.value)
  if (target) emit('handoff', target)
}

const board = ref<HackathonIdea[]>([])
const boardTotal = ref(0)
let boardTimer = 0

async function loadBoard() {
  try {
    const { ideas, total } = await hackathonApi.listIdeas(HACKATHON_SLUG, anonId(), 40)
    board.value = ideas
    boardTotal.value = total
  } catch {
    /* no board without the service; the brief still stands */
  }
}

watch(phase, (p) => {
  window.clearInterval(boardTimer)
  if (p === 'brief') {
    void loadBoard()
    boardTimer = window.setInterval(loadBoard, 20000)
  }
})

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

/* ------------------------------------------------------------ intro */

const INTRO_KEY = 'plh.intro'
let introTimers: number[] = []
function clearIntroTimers() {
  introTimers.forEach((t) => window.clearTimeout(t))
  introTimers = []
}
function beginIntro() {
  let seen = false
  try {
    seen = window.sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    /* storage blocked: show it */
  }
  if (seen || phase.value !== 'problem') return
  playIntro('wicked', [500, 1500, 4300, 7500, 10500, 12600])
}
/** After a problem is chosen: what that says about you, then what a pattern is. */
function beginPatternIntro() {
  if (props.mode !== 'game') return
  playIntro('pattern', [400, 1300, 3000, 7400, 8600, 9600, 11800, 14600, 16800])
}
function playIntro(kind: 'wicked' | 'pattern', at: number[]) {
  clearIntroTimers()
  introStep.value = 0
  intro.value = kind
  const times = reduceMotion ? at.map((_, i) => i * 120) : at
  introTimers = times.map((ms, i) => window.setTimeout(() => (introStep.value = i + 1), ms))
}
function endIntro() {
  const kind = intro.value
  clearIntroTimers()
  intro.value = null
  if (kind !== 'wicked') return
  try {
    window.sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    /* fine */
  }
}
watch(
  () => props.mode,
  (m) => {
    if (m === 'game') requestAnimationFrame(measureCards)
    if (m === 'game') beginIntro()
    else {
      clearIntroTimers()
      intro.value = null
    }
  }
)

/* --------------------------------------------------------- lifecycle */

function onKey(e: KeyboardEvent) {
  if (props.mode !== 'game') return
  if (intro.value) {
    if (e.key === 'Escape' || e.key === 'Enter') endIntro()
    return
  }
  if (e.key === 'Escape') {
    if (ideasOpen.value) ideasOpen.value = false
    else if (phase.value === 'review') changeProblem()
    else if (phase.value === 'pattern') closePattern()
    else emit('close', 'about')
  }
}

function onVisibility() {
  if (document.visibilityState === 'visible') start()
  else stop()
}

onMounted(() => {
  reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  buildGraph()
  initThree()
  layoutTargets()
  if (props.mode === 'site') {
    cam.z = cam.tz
    fade.v = fade.t
  }
  start()
  if (props.mode === 'game') beginIntro()
  document.fonts?.ready.then(measureCards).catch(() => {})
  if (host.value) {
    resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(host.value)
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  stop()
  clearIntroTimers()
  window.clearInterval(boardTimer)
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('keydown', onKey)
  resizeObserver?.disconnect()
  disposables.forEach((d) => d.dispose())
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
})
</script>

<template>
  <div
    class="field"
    :class="[`is-${phase}`, `mode-${mode}`, { 'has-hover': hovered !== null, 'is-dragging': drag.active && drag.moved, 'is-ideas': ideasOpen, 'is-intro': intro !== null }]"
    :style="washStyle"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerLeave"
    @pointerleave="onPointerLeave"
  >
    <div class="field__wash" aria-hidden="true">
      <i class="wash wash--1" /><i class="wash wash--2" /><i class="wash wash--3" />
      <i class="vignette" />
    </div>
    <div ref="host" class="field__canvas" />

    <!-- names, projected from the field -->
    <div v-show="mode === 'game'" class="field__labels">
      <div
        v-for="item in labelItems"
        :key="item.key"
        :ref="(el) => setLabelEl(item.key, el)"
        class="nlabel"
        :class="{
          'is-pick': item.slot === -4,
          'is-cand': item.slot >= -1 && phase === 'patterns',
          'is-chosen': item.slot >= 0,
          'is-static': phase === 'brief',
          'is-hover': hovered === item.key || armed === item.key
        }"
        :style="item.slot >= 0 ? { '--c': ACCENT_HEX[item.slot] } : undefined"
        :data-key="item.key"
      >
        <button
          class="nlabel__btn"
          type="button"
          :data-cursor="phase === 'problem' || phase === 'patterns' ? 'More' : undefined"
          :tabindex="phase === 'patterns' || phase === 'problem' ? 0 : -1"
          :disabled="phase === 'brief'"
          :aria-label="`Learn more about ${item.title}`"
          @click="activate(item.key)"
          @keydown.enter.prevent="learnMore(item.key)"
          @keydown.space.prevent="learnMore(item.key)"
        >
          <span v-if="item.slot >= 0" class="nlabel__n">0{{ item.slot + 1 }}</span>
          <span class="nlabel__t">{{ item.title }}</span>
        </button>
        <span v-if="phase === 'problem' || phase === 'patterns'" class="nlabel__opts">
          <button class="nopt" type="button" data-cursor="Read" @click="learnMore(item.key)">Learn more</button>
          <button
            class="nopt nopt--go"
            type="button"
            data-cursor="Go"
            :disabled="selectWord(item.key) === 'Three chosen'"
            @click="quickSelect(item.key)"
          >{{ selectWord(item.key) }}</button>
        </span>
      </div>
    </div>

    <!-- evidence: real stories around whatever is in focus -->
    <div v-show="mode === 'game'" class="field__evidence" :class="{ 'has-read': readKey !== null }">
      <component
        :is="e.url ? 'a' : 'div'"
        v-for="(e, i) in evidenceItems"
        :key="`${phase}-${challenge?.id}-${patternFocus}-${i}`"
        :ref="(el: unknown) => setLabelEl(EVIDENCE_BASE + i, el)"
        class="ecard ecard--story"
        :class="{ 'ecard--pattern': phase === 'pattern', 'ecard--book': !e.url, 'is-read': readKey === EVIDENCE_BASE + i }"
        :style="{ '--i': i }"
        :href="e.url || undefined"
        :target="e.url ? '_blank' : undefined"
        :rel="e.url ? 'noopener noreferrer' : undefined"
        :data-cursor="e.url ? 'Read' : undefined"
        @pointerenter="onCardEnter(EVIDENCE_BASE + i, $event)"
        @pointerleave="onCardLeave"
        @click="onCardClick(EVIDENCE_BASE + i, $event, !!e.url)"
      >
        <span class="ecard__in">
          <!-- at rest -->
          <span class="ecard__face ecard__face--s">
            <span class="ecard__img" :class="{ 'is-empty': !e.image }">
              <img v-if="e.image" :src="e.image" alt="" loading="eager" decoding="async" referrerpolicy="no-referrer" @error="onImgError" />
              <span v-else class="ecard__glyph" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            </span>
            <span class="ecard__body">
              <span class="ecard__meta"><span>{{ e.outlet }}</span><template v-if="e.place"><span class="ecard__dot" />{{ e.place }}</template><template v-if="e.date"><span class="ecard__dot" />{{ yearOf(e.date) }}</template></span>
              <span class="ecard__title">{{ e.title }}</span>
            </span>
          </span>
          <!-- being read -->
          <span class="ecard__face ecard__face--l" aria-hidden="true">
            <span class="ecard__img" :class="{ 'is-empty': !e.image }">
              <img v-if="e.image" :src="e.image" alt="" loading="eager" decoding="async" referrerpolicy="no-referrer" @error="onImgError" />
              <span v-else class="ecard__glyph" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            </span>
            <span class="ecard__body">
              <span class="ecard__meta"><span>{{ e.outlet }}</span><template v-if="e.place"><span class="ecard__dot" />{{ e.place }}</template><template v-if="e.date"><span class="ecard__dot" />{{ yearOf(e.date) }}</template></span>
              <span class="ecard__title">{{ e.title }}</span>
              <span class="ecard__sum">{{ e.summary }}</span>
            </span>
          </span>
        </span>
      </component>

      <!-- the front page, a year on -->
      <div
        v-if="phase === 'brief' && brief?.headline"
        :key="`front-${currentIdeaId}`"
        :ref="(el) => setLabelEl(EVIDENCE_BASE + FUTURE_SLOT, el)"
        class="ecard fcard"
        :class="{ 'is-read': readKey === EVIDENCE_BASE + FUTURE_SLOT }"
        @pointerenter="onCardEnter(EVIDENCE_BASE + FUTURE_SLOT, $event)"
        @pointerleave="onCardLeave"
        @click="onCardClick(EVIDENCE_BASE + FUTURE_SLOT, $event, false)"
      >
        <span class="ecard__in fcard__in">
          <span class="fcard__mast"><span>Cañon City</span><span class="ecard__dot" /><span>A year on</span><span class="ecard__dot" /><span>Front page</span></span>
          <span class="fcard__head">{{ brief.headline }}</span>
          <span class="fcard__lede">{{ brief.lede }}</span>
        </span>
      </div>
    </div>

    <!-- the HUD -->
    <Transition name="ui">
      <div v-if="mode === 'game'" class="ui">
        <div ref="headEl" class="hud">
          <Transition name="swap" mode="out-in">
            <div :key="STEP.n + STEP.name" class="hud__step">
              <span class="eyebrow"><span class="eyebrow__n">{{ STEP.n }}</span><span class="eyebrow__sep">/</span>{{ STEP.name }}</span>
              <span v-if="STEP.hint" class="hint">{{ STEP.hint }}</span>
            </div>
          </Transition>
          <Transition name="swap">
            <p v-if="challenge && (phase === 'patterns' || phase === 'combine')" class="hud__problem">{{ challenge.title }}</p>
          </Transition>
          <button
            v-if="savedIdeas.length && (phase === 'problem' || phase === 'patterns' || phase === 'brief')"
            class="hud__ideas"
            type="button"
            data-cursor="Open"
            :aria-expanded="ideasOpen"
            @click="ideasOpen = !ideasOpen"
          >
            <i class="hud__tick" />Your ideas<span class="hud__count">{{ savedIdeas.length }}</span>
          </button>
        </div>

        <!-- your ideas: kept in this browser -->
        <Transition name="act">
          <section v-if="ideasOpen" key="ideas" class="act act--ideas">
            <div class="panel panel--ideas">
              <i class="panel__corner panel__corner--tl" /><i class="panel__corner panel__corner--tr" />
              <i class="panel__corner panel__corner--bl" /><i class="panel__corner panel__corner--br" />
              <div class="panel__head">
                <p class="eyebrow">Your ideas<span class="eyebrow__sep">/</span>kept in this browser</p>
                <button class="link" type="button" @click="ideasOpen = false">Close</button>
              </div>
              <ol class="ideas">
                <li v-for="idea in savedIdeas" :key="idea.id" class="idea">
                  <div class="idea__main">
                    <span class="idea__name">{{ idea.brief.name }}</span>
                    <span class="idea__meta">{{ idea.problem }}<span class="ecard__dot" />{{ idea.patterns.length }} {{ idea.patterns.length === 1 ? 'pattern' : 'patterns' }}<span class="ecard__dot" />{{ ago(idea.createdAt) }}</span>
                  </div>
                  <div class="idea__actions">
                    <button class="link" type="button" @click="openIdea(idea)">Open</button>
                    <button class="link" type="button" data-cursor="PAL" @click="handoff(idea)">Make it a playbook</button>
                    <button class="link link--dim" type="button" @click="forgetIdea(idea.id)">Forget</button>
                  </div>
                </li>
              </ol>
              <p class="panel__fine">Ideas are kept here anonymously and shared to the board without your name. Make one a playbook to carry it into PAL on the day.</p>
            </div>
          </section>
        </Transition>

        <Transition name="act" mode="out-in">
          <!-- review: the shape of the problem -->
          <section v-if="phase === 'review' && review" key="review" class="act act--review">
            <div class="panel" :key="review.n">
              <i class="panel__corner panel__corner--tl" /><i class="panel__corner panel__corner--tr" />
              <i class="panel__corner panel__corner--bl" /><i class="panel__corner panel__corner--br" />
              <i class="panel__scan" aria-hidden="true" />
              <div class="panel__body">
              <p class="eyebrow eyebrow--warm"><span class="eyebrow__n">{{ review.n }}</span><span class="eyebrow__sep">/</span>{{ review.of }} wicked problems</p>
              <h2 class="panel__title">{{ review.title }}</h2>
              <p class="panel__desc">{{ review.description }}</p>
              <dl class="panel__shape">
                <div>
                  <dt>Shows up as</dt>
                  <dd><span v-for="s in review.signs" :key="s">{{ s }}</span></dd>
                </div>
                <div>
                  <dt>Answered by</dt>
                  <dd><span><strong>{{ review.answers.length }}</strong> patterns in the library</span></dd>
                </div>
                <div v-if="review.neighbours.length">
                  <dt>Shares ground with</dt>
                  <dd>{{ review.neighbours.slice(0, 3).join(', ') }}<template v-if="review.neighbours.length > 3"> and {{ review.neighbours.length - 3 }} more</template></dd>
                </div>
                <div v-if="review.evidence.length">
                  <dt>In the news</dt>
                  <dd><span>{{ review.evidence.length }} {{ review.evidence.length === 1 ? 'story' : 'stories' }} from rural America, around the node</span></dd>
                </div>
              </dl>
              </div>
              <div class="actions">
                <button class="btn-line btn-line--warm" type="button" data-cursor="Go" @click="confirmProblem">Work on this</button>
                <button class="link" type="button" @click="changeProblem">Choose another</button>
              </div>
            </div>
          </section>

          <!-- pattern: the shape of a pattern -->
          <section v-else-if="phase === 'pattern' && patternReview" key="pattern" class="act act--review">
            <div class="panel" :key="patternReview.n">
              <i class="panel__corner panel__corner--tl" /><i class="panel__corner panel__corner--tr" />
              <i class="panel__corner panel__corner--bl" /><i class="panel__corner panel__corner--br" />
              <i class="panel__scan panel__scan--ink" aria-hidden="true" />
              <div class="panel__body">
              <p class="eyebrow"><span class="eyebrow__n">{{ patternReview.n }}</span><span class="eyebrow__sep">/</span>{{ patternReview.of }} patterns<template v-if="patternReview.category"><span class="eyebrow__sep">/</span>{{ patternReview.category }}</template></p>
              <h2 class="panel__title">{{ patternReview.title }}</h2>
              <p class="panel__desc">{{ patternReview.description }}</p>
              <dl class="panel__shape">
                <div v-if="patternReview.solution">
                  <dt>The move</dt>
                  <dd>{{ patternReview.solution }}</dd>
                </div>
                <div v-if="patternReview.examples.length">
                  <dt>In use</dt>
                  <dd><span>{{ patternReview.examples.length }} {{ patternReview.examples.length === 1 ? 'place' : 'places' }} doing it, around the node</span></dd>
                </div>
              </dl>
              </div>
              <div class="actions">
                <button class="btn-line" type="button" data-cursor="Go" :disabled="!patternReview.chosen && selected.length >= 3" @click="addFocused">
                  {{ patternReview.chosen ? 'Remove from the solution' : selected.length >= 3 ? 'Three already chosen' : 'Add to the solution' }}
                </button>
                <button class="link" type="button" @click="closePattern">Back to the patterns</button>
              </div>
            </div>
          </section>

          <!-- patterns: controls only -->
          <section v-else-if="phase === 'patterns'" key="patterns" class="act act--patterns">
            <div ref="footEl" class="act__foot">
              <button class="link" type="button" @click="reshuffle">Show me others</button>
              <button class="btn-line" type="button" :disabled="!canCombine" data-cursor="Go" @click="combine">Combine</button>
              <button class="link" type="button" @click="changeProblem">Change the problem</button>
            </div>
          </section>

          <!-- combining -->
          <section v-else-if="phase === 'combine'" key="combine" class="act act--combine">
            <div class="combine">
              <p class="eyebrow">PAL</p>
              <p class="combine-line" role="status">{{ combineLine }}<span class="dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p>
            </div>
          </section>

          <!-- the pitch, beside the distilled constellation -->
          <section v-else-if="phase === 'brief' && brief" key="brief" class="act act--brief" @scroll.passive="onBriefScroll">
            <div ref="sheetEl" class="sheet">
              <p class="eyebrow">Your pitch<template v-if="brief.source === 'local'"><span class="eyebrow__sep">/</span>drafted from the library</template></p>
              <h2 class="display">{{ brief.name }}</h2>
              <p class="sheet__pitch">{{ brief.pitch }}</p>
              <div v-if="brief.headline" class="fcard__in fcard--inline">
                <span class="fcard__mast"><span>Cañon City</span><span class="ecard__dot" /><span>A year on</span><span class="ecard__dot" /><span>Front page</span></span>
                <span class="fcard__head">{{ brief.headline }}</span>
                <span class="fcard__lede">{{ brief.lede }}</span>
              </div>
              <ol class="sheet__build">
                <li v-for="(step, i) in brief.build" :key="i">
                  <span class="eyebrow eyebrow--dim">{{ ['Days 1–30', 'Days 31–60', 'Days 61–90'][i] ?? '' }}</span>
                  <span>{{ step }}</span>
                </li>
              </ol>
              <p v-if="brief.ask" class="sheet__ask">{{ brief.ask }}</p>
              <div class="actions">
                <button class="btn-line" type="button" data-cursor="Go" @click="bringIt">Bring it to the sprint</button>
                <button class="link" type="button" data-cursor="PAL" @click="handoff()">Make it a playbook</button>
                <button class="link" type="button" @click="playAgain">Play again</button>
              </div>
            </div>

            <!-- the board: everyone's ideas, newest first -->
            <div v-if="board.length" class="board">
              <p class="eyebrow eyebrow--dim board__label"><i class="hud__tick" />On the board<span class="eyebrow__sep">/</span>{{ boardTotal }} {{ boardTotal === 1 ? 'idea' : 'ideas' }} so far</p>
              <ol class="board__row">
                <li v-for="idea in board" :key="idea.id" class="bcard" :class="{ 'is-mine': idea.mine }">
                  <span class="bcard__name">{{ idea.name }}</span>
                  <span class="bcard__meta">{{ idea.problem }}<span class="ecard__dot" />{{ idea.patterns.length }}<span class="ecard__dot" />{{ ago(idea.createdAt) }}<template v-if="idea.mine"><span class="ecard__dot" />yours</template></span>
                </li>
              </ol>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>

    <!-- the opening: what a wicked problem is -->
    <Transition name="intro">
      <section v-if="intro === 'wicked' && mode === 'game'" class="intro" role="dialog" aria-modal="true" aria-label="What is a wicked problem?">
        <button class="intro__skip" type="button" @click="endIntro">Skip</button>
        <div class="intro__in">
          <p class="intro__eyebrow" :class="{ 'is-on': introStep >= 1 }"><span>00</span><span class="intro__sep">/</span>Before you play</p>
          <h2 class="intro__head" :class="{ 'is-on': introStep >= 2 }">Some problems have no single cause.</h2>
          <p class="intro__line" :class="{ 'is-on': introStep >= 3 }">They are called <span class="intro__term">wicked problems</span>. Pull on one and the rest move. Housing tugs on jobs, jobs on who stays, who stays on the schools.</p>
          <p class="intro__line" :class="{ 'is-on': introStep >= 4 }">No one solves a wicked problem in a day. You can shift one, with patterns: moves other rural towns have already made.</p>
          <p class="intro__line" :class="{ 'is-on': introStep >= 5 }">Choose a problem. Add up to three patterns. PAL turns them into a pitch for Cañon City.</p>
          <div class="intro__cta" :class="{ 'is-on': introStep >= 6 }">
            <button class="btn-line btn-line--bone" type="button" data-cursor="Go" @click="endIntro">Begin</button>
          </div>
        </div>
        <i class="intro__rule" :class="{ 'is-on': introStep >= 1 }" aria-hidden="true" />
      </section>
    </Transition>

    <!-- the second opening: what your choice says, then what a pattern is -->
    <Transition name="intro">
      <section
        v-if="intro === 'pattern' && mode === 'game' && challenge"
        class="intro intro--pattern"
        role="dialog"
        aria-modal="true"
        aria-label="What is a pattern?"
      >
        <button class="intro__skip" type="button" @click="endIntro">Skip</button>
        <div class="intro__stage">
          <div class="intro__in intro__scene" :class="{ 'is-gone': introStep >= 4 }">
            <p class="intro__eyebrow" :class="{ 'is-on': introStep >= 1 }"><span>01</span><span class="intro__sep">/</span>{{ challenge.title }}</p>
            <h2 class="intro__head" :class="{ 'is-on': introStep >= 2 }">{{ chose?.head ?? `You chose ${challenge.title}.` }}</h2>
            <p class="intro__line intro__line--you" :class="{ 'is-on': introStep >= 3 }">{{ chose?.body ?? 'That says something about what you will not let go of.' }}</p>
          </div>
          <div class="intro__in intro__scene">
            <p class="intro__eyebrow" :class="{ 'is-on': introStep >= 5 }"><span>02</span><span class="intro__sep">/</span>Patterns</p>
            <h2 class="intro__head" :class="{ 'is-on': introStep >= 6 }">A pattern is a move that has worked before.</h2>
            <p class="intro__line" :class="{ 'is-on': introStep >= 7 }">Each one is a named, repeatable way a town has met a problem like yours. Small enough to start on a Monday.</p>
            <p class="intro__line" :class="{ 'is-on': introStep >= 8 }">One pattern alone is a feature. Stacked so each feeds the next, they become a system. On the day, teams stack three to five. The ones closest to <span class="intro__term">{{ challenge.title }}</span> wait on the ring.</p>
            <div class="intro__cta" :class="{ 'is-on': introStep >= 9 }">
              <button class="btn-line btn-line--bone" type="button" data-cursor="Go" @click="endIntro">Show me the patterns</button>
            </div>
          </div>
        </div>
        <i class="intro__rule intro__rule--long" :class="{ 'is-on': introStep >= 1 }" aria-hidden="true" />
      </section>
    </Transition>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------ backdrop */
.field {
  --paper: #f7f2e9;
  --ink: #1b1b1b;
  --ink-2: #454545;
  --ink-3: #7a7a7a;
  --warm: #c4572f;
  --warm-deep: #9a3f1f;
  --hair: rgba(27, 27, 27, 0.16);
  --hair-strong: rgba(27, 27, 27, 0.34);
  --ease-slow: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-calm: cubic-bezier(0.45, 0.05, 0.2, 1);
  color: var(--ink);
  font-weight: 300;
  letter-spacing: -0.01em;
}

.field__wash,
.field__canvas,
.field__labels,
.field__evidence,
.ui {
  position: fixed;
  inset: 0;
}
.field__wash {
  z-index: 0;
  overflow: hidden;
  background: var(--paper);
  pointer-events: none;
}
.wash {
  position: absolute;
  width: 72vmax;
  height: 72vmax;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.72;
  will-change: transform;
  transition: opacity 1.2s ease, background-color 3.2s var(--ease-calm);
}
.wash--1 { background-color: var(--w1, #efb496); left: -22vmax; top: -26vmax; animation: wash1 38s ease-in-out infinite alternate; }
.wash--2 { background-color: var(--w2, #a6d0bd); right: -26vmax; top: 8vmax; animation: wash2 46s ease-in-out infinite alternate; }
.wash--3 { background-color: var(--w3, #bda7ea); left: 18vmax; bottom: -36vmax; animation: wash3 52s ease-in-out infinite alternate; }
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(27, 27, 27, 0.14) 100%);
}
@keyframes wash1 { to { transform: translate(14vmax, 10vmax); } }
@keyframes wash2 { to { transform: translate(-12vmax, 16vmax); } }
@keyframes wash3 { to { transform: translate(-18vmax, -8vmax); } }
.mode-site .wash { opacity: 0.5; }

.field__canvas {
  z-index: 1;
  touch-action: pan-y;
  transition: opacity 0.7s ease, filter 0.7s ease;
}
.field__labels,
.field__evidence {
  transition: opacity 1.4s var(--ease-calm);
}
/* the opening screen holds the stage */
.is-intro .field__labels,
.is-intro .ui {
  opacity: 0;
  pointer-events: none;
}
.ui {
  transition: opacity 1.6s var(--ease-calm);
}
/* your ideas take the stage: the web steps back behind them */
.is-ideas .field__canvas {
  opacity: 0.25;
  filter: blur(3px);
}
.is-ideas .field__labels,
.is-ideas .field__evidence,
.is-ideas .act:not(.act--ideas) {
  opacity: 0;
  pointer-events: none;
}
.mode-game .field__canvas {
  touch-action: none;
}
.field__canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
.mode-site .field__canvas {
  pointer-events: none;
}
.has-hover .field__canvas {
  cursor: pointer;
}
.is-dragging .field__canvas {
  cursor: grabbing;
}

/* ------------------------------------------------------------- labels */
.field__labels {
  z-index: 2;
  pointer-events: none;
}
.nlabel {
  position: absolute;
  left: 0;
  top: 0;
  margin-left: 16px;
  color: var(--ink);
  font-size: 0.76rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: auto;
  translate: -0.5rem -50%;
  will-change: transform;
  transition: opacity 0.9s ease, color 0.5s ease;
}
.nlabel__btn {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  padding: 0.5rem 0.5rem;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
}
.nlabel__btn:disabled {
  cursor: default;
}
/* two options fade in beneath a hovered name */
.nlabel__opts {
  position: absolute;
  top: calc(100% - 0.35rem);
  left: 0.5rem;
  display: flex;
  gap: 1.1rem;
  opacity: 0;
  translate: 0 -6px;
  pointer-events: none;
  transition: opacity 0.7s var(--ease-calm), translate 0.9s var(--ease-calm);
}
.nlabel.is-left .nlabel__opts {
  left: auto;
  right: 0.5rem;
}
.nlabel.is-below .nlabel__opts {
  left: 50%;
  transform: translateX(-50%);
}
.nlabel.is-hover .nlabel__opts,
.nlabel:has(:focus-visible) .nlabel__opts {
  opacity: 1;
  translate: 0 0;
  pointer-events: auto;
  transition: opacity 1.1s var(--ease-calm) 0.15s, translate 1.3s var(--ease-calm) 0.15s;
}
.nopt {
  padding: 0.3rem 0 0.25rem;
  border: 0;
  border-bottom: 1px solid var(--hair-strong);
  background: none;
  color: var(--ink-2);
  font: inherit;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.4s ease, border-color 0.4s ease;
}
.nopt:hover {
  color: var(--ink);
  border-color: var(--ink);
}
.nopt--go {
  color: var(--ink);
  border-color: var(--ink);
}
.nlabel.is-pick .nopt--go {
  color: var(--warm-deep);
  border-color: var(--warm);
}
.nopt:disabled {
  opacity: 0.35;
  cursor: default;
}
.nlabel.is-left {
  margin-left: -16px;
  translate: calc(-100% + 0.5rem) -50%;
}
.nlabel.is-below {
  margin-left: 0;
  translate: -50% 10px;
}
.nlabel__t {
  position: relative;
}
.nlabel__t::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.22em;
  height: 1.5px;
  background: var(--c, currentColor);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--ease-slow);
}
.nlabel.is-hover .nlabel__t::after,
.nlabel.is-chosen .nlabel__t::after {
  transform: scaleX(1);
}
.nlabel__n {
  font-size: 0.64rem;
  color: var(--ink-3);
}
.nlabel.is-pick {
  color: var(--warm);
  font-size: 0.92rem;
  font-weight: 500;
  letter-spacing: 0.12em;
}
.nlabel.is-pick .nlabel__btn {
  padding: 0.65rem 0.6rem;
}
.nlabel.is-pick.is-hover {
  color: var(--warm-deep);
}
.nlabel.is-static {
  pointer-events: none;
  cursor: default;
}
.is-dragging .nlabel {
  pointer-events: none;
}
/* a name hidden to make room: gone quickly, and never under a finger */
.nlabel.is-culled {
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* ----------------------------------------------------------- evidence */
.field__evidence {
  z-index: 2;
  pointer-events: none;
}
.ecard {
  --op: 0;
  position: absolute;
  left: 0;
  top: 0;
  width: 19.5rem;
  margin-left: 22px;
  opacity: var(--op);
  pointer-events: auto;
  color: var(--ink);
  text-decoration: none;
  translate: 0 -50%;
  will-change: transform;
  transition: opacity 1.6s var(--ease-calm);
}
.ecard.is-left {
  margin-left: -22px;
  translate: -100% -50%;
}
.ecard.is-below {
  margin-left: 0;
  translate: -50% 14px;
}
/* a card being read rises above the HUD panel */
.field__evidence.has-read {
  z-index: 4;
}
/* the others step back down the z axis, smaller and out of focus */
.field__evidence.has-read .ecard:not(.is-read) {
  opacity: calc(var(--op) * 0.5);
}
.field__evidence.has-read .ecard:not(.is-read) .ecard__in {
  transform: perspective(1000px) translateZ(-220px) scale(0.94);
  filter: blur(5px);
}
.ecard__in {
  position: relative;
  display: block;
  box-sizing: border-box;
  border: 1px solid var(--hair-strong);
  background: rgba(247, 242, 233, 0.28);
  transform-origin: left center;
  /* backwards fill: once in, the card is free to move on hover */
  animation: ecardIn 2.4s var(--ease-calm) backwards;
  animation-delay: calc(0.9s + var(--i, 0) * 0.4s);
  transition:
    transform 1.8s var(--ease-calm),
    filter 1.8s var(--ease-calm),
    border-color 1.2s ease,
    background-color 1.4s ease,
    box-shadow 1.8s var(--ease-calm);
}
.ecard.is-left .ecard__in {
  transform-origin: right center;
  animation-name: ecardInLeft;
}
.ecard.is-read .ecard__in {
  border-color: var(--warm);
  background: rgba(247, 242, 233, 0.94);
  box-shadow: 0 40px 80px -50px rgba(27, 27, 27, 0.55);
}
.ecard--pattern.is-read .ecard__in {
  border-color: var(--ink);
}
@keyframes ecardIn {
  from { transform: perspective(900px) rotateY(-26deg) translateZ(-90px) scale(0.94); filter: blur(6px); }
  to { transform: none; filter: none; }
}
@keyframes ecardInLeft {
  from { transform: perspective(900px) rotateY(26deg) translateZ(-90px) scale(0.94); filter: blur(6px); }
  to { transform: none; filter: none; }
}

/*
 * A story card: one frame that grows in width and height together, on one
 * curve. Inside it two faces are laid out at their final sizes, so no text
 * reflows: the frame opens over the full face like a window.
 */
.ecard--story {
  --w0: 19.5rem;
  --w1: min(34rem, 46vw);
  --t: 1.7s;
  width: var(--w0);
  transition: opacity 1.6s var(--ease-calm), width var(--t) var(--ease-calm);
}
.ecard--story.is-read {
  width: var(--w1);
  z-index: 2;
}
.ecard--story .ecard__in {
  height: var(--h0, auto);
  overflow: hidden;
  transition:
    width var(--t) var(--ease-calm),
    height var(--t) var(--ease-calm),
    transform 1.8s var(--ease-calm),
    filter 1.8s var(--ease-calm),
    border-color 1.2s ease,
    background-color 1.4s ease,
    box-shadow var(--t) var(--ease-calm);
}
.ecard--story.is-read .ecard__in {
  height: var(--h1, auto);
}
.ecard__face {
  top: 0;
  left: 0;
  display: grid;
  align-items: start;
  box-sizing: border-box;
}
.ecard__face--s {
  position: relative;
  width: calc(var(--w0) - 2px);
  grid-template-columns: 6.75rem 1fr;
  gap: 0.8rem;
  padding: 0.65rem;
  transition: opacity 1s var(--ease-calm) 0.6s;
}
.ecard__face--l {
  position: absolute;
  width: calc(var(--w1) - 2px);
  grid-template-columns: 13rem 1fr;
  gap: 1.4rem;
  padding: 1.1rem;
  opacity: 0;
  transition: opacity 0.7s var(--ease-calm);
}
.ecard--story.is-read .ecard__face--s {
  opacity: 0;
  transition: opacity 0.6s var(--ease-calm);
}
.ecard--story.is-read .ecard__face--l {
  opacity: 1;
  transition: opacity 1.4s var(--ease-calm) 0.3s;
}

.ecard__img {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(196, 87, 47, 0.35), rgba(196, 87, 47, 0.08));
  outline: 1px solid rgba(27, 27, 27, 0.2);
  outline-offset: -1px;
}
.ecard__face--l .ecard__img {
  aspect-ratio: 4 / 5;
}
.ecard--pattern .ecard__img {
  background: linear-gradient(135deg, rgba(27, 27, 27, 0.3), rgba(27, 27, 27, 0.06));
}
.ecard__img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.85) contrast(1.05);
}
.ecard__img.is-empty img {
  display: none;
}
/* a book example: no photograph, a numbered plate instead */
.ecard__glyph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: 200;
  font-size: 1.6rem;
  letter-spacing: -0.03em;
  color: var(--ink-2);
}
.ecard__face--l .ecard__glyph {
  font-size: 3rem;
}
.ecard--book .ecard__img {
  background: repeating-linear-gradient(135deg, rgba(27, 27, 27, 0.05) 0 6px, transparent 6px 12px), rgba(247, 242, 233, 0.4);
}
.ecard__body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}
.ecard__face--l .ecard__body {
  gap: 0.55rem;
}
.ecard__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--warm);
}
.ecard__face--l .ecard__meta {
  color: var(--warm-deep);
}
.ecard--pattern .ecard__meta,
.ecard--pattern .ecard__face--l .ecard__meta {
  color: var(--ink-2);
}
.ecard__dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  margin: 0 0.35rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
  vertical-align: middle;
}
.ecard__meta .ecard__dot {
  margin: 0;
}
.ecard__title {
  font-size: 0.86rem;
  font-weight: 400;
  line-height: 1.32;
  letter-spacing: -0.01em;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ecard__face--l .ecard__title {
  font-size: 1.3rem;
  font-weight: 300;
  line-height: 1.18;
  letter-spacing: -0.02em;
  -webkit-line-clamp: 6;
}
.ecard__sum {
  display: block;
  margin-top: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--hair);
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--ink-2);
}

/* the front page, a year on */
.fcard {
  width: 21rem;
}
.fcard__in {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.9rem 1rem 1rem;
  background: rgba(247, 242, 233, 0.5);
  border-color: var(--ink);
  animation-name: ecardIn;
}
.fcard__mast {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--ink);
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-2);
}
.fcard__mast .ecard__dot {
  margin: 0;
}
.fcard__head {
  font-weight: 200;
  font-size: 1.25rem;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--ink);
  text-wrap: balance;
}
.fcard--inline {
  display: none;
  position: relative;
  border: 1px solid var(--ink);
}
.fcard__lede {
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--ink-2);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fcard.is-read .fcard__lede {
  -webkit-line-clamp: 12;
}

/* ------------------------------------------------------------- the UI */
.ui {
  z-index: 3;
  pointer-events: none;
}
.hud,
.act > * {
  pointer-events: auto;
}
.ui-enter-active {
  transition: opacity 1.8s var(--ease-calm) 0.6s, transform 2.2s var(--ease-calm) 0.6s;
}
.ui-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.ui-enter-from,
.ui-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.eyebrow {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.55rem;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-2);
}
.eyebrow__n {
  font-variant-numeric: tabular-nums;
}
.eyebrow__sep {
  color: var(--ink-3);
  font-weight: 300;
}
.eyebrow--dim {
  color: var(--ink-3);
}
.eyebrow--warm {
  color: var(--warm);
}
.hint {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-2);
}

.hud {
  position: absolute;
  left: var(--hk-pad, 2.5rem);
  /* the page brand steps aside in the game; the step takes its line */
  top: calc(var(--hk-chrome, 64px) / 2 - 0.55rem);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 24rem;
}
.hud__problem {
  font-weight: 200;
  font-size: clamp(1.5rem, 1rem + 1.8vw, 2.4rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--ink);
}
.hud__ideas {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  padding: 0.45rem 0.7rem 0.45rem 0.55rem;
  border: 1px solid var(--hair-strong);
  background: rgba(247, 242, 233, 0.25);
  color: var(--ink);
  font: inherit;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}
.hud__ideas:hover {
  border-color: var(--ink);
  background: rgba(247, 242, 233, 0.5);
}
.hud__tick {
  display: inline-block;
  width: 6px;
  height: 6px;
  border: 1.5px solid currentColor;
  transform: rotate(45deg);
}
.hud__count {
  font-variant-numeric: tabular-nums;
  color: var(--warm);
}
.swap-enter-active {
  transition: opacity 1.6s var(--ease-calm) 0.3s, transform 1.9s var(--ease-calm) 0.3s;
}
.swap-leave-active {
  transition: opacity 0.8s var(--ease-calm), transform 0.8s var(--ease-calm);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.display {
  font-weight: 200;
  font-size: clamp(2.1rem, 1rem + 3.4vw, 4.2rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
}
.btn-line {
  position: relative;
  padding: 0.8rem 1.7rem;
  border: 1.5px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.45s ease, border-color 0.45s ease, opacity 0.3s ease;
  z-index: 0;
}
.btn-line::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.55s var(--ease-slow);
  z-index: -1;
}
.btn-line:hover:not(:disabled) {
  color: var(--paper);
}
.btn-line:hover:not(:disabled)::before {
  transform: scaleX(1);
}
.btn-line:disabled {
  opacity: 0.3;
  cursor: default;
}
.btn-line--warm {
  border-color: var(--warm);
  color: var(--warm-deep);
}
.btn-line--warm::before {
  background: var(--warm);
}
.link {
  padding: 0.5rem 0;
  border: 0;
  background: none;
  color: var(--ink-2);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  cursor: pointer;
  border-bottom: 1px solid var(--hair-strong);
  transition: color 0.3s ease, border-color 0.3s ease;
}
.link:hover {
  color: var(--ink);
  border-color: var(--ink);
}
.link--dim {
  color: var(--ink-3);
  border-color: transparent;
}

/* acts */
.act {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: calc(var(--hk-chrome, 64px) + 1.5rem) var(--hk-pad, 2.5rem) var(--hk-pad, 2.5rem);
}
.act-enter-active {
  transition: opacity 2.2s var(--ease-calm) 0.2s, transform 2.6s var(--ease-calm) 0.2s, filter 2.2s var(--ease-calm) 0.2s;
}
.act-leave-active {
  transition: opacity 1s var(--ease-calm), transform 1.1s var(--ease-calm), filter 1s var(--ease-calm);
}
.act-enter-from {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(8px);
}
.act-leave-to {
  opacity: 0;
  transform: translateY(-14px);
  filter: blur(8px);
}

/* review panel: transparent, bracket corners, turns in out of depth */
.act--review {
  justify-content: center;
  align-items: flex-end;
}
.panel {
  position: relative;
  width: min(100%, 26rem);
  padding: 1.75rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: transparent;
  border: 1px solid var(--hair-strong);
  transform-origin: right center;
  animation: panelIn 2.6s var(--ease-calm) both;
  animation-delay: 0.3s;
  overflow: hidden;
  max-height: calc(100vh - var(--hk-chrome, 64px) - 1.5rem - var(--hk-pad, 2.5rem));
  max-height: calc(100svh - var(--hk-chrome, 64px) - 1.5rem - var(--hk-pad, 2.5rem));
}
/* the text scrolls if it must; the actions never leave the panel */
.panel__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  scrollbar-width: none;
  padding-bottom: 1.1rem;
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 1.1rem), transparent);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 1.1rem), transparent);
}
.panel__body::-webkit-scrollbar {
  display: none;
}
.panel > .actions {
  flex: none;
}
@keyframes panelIn {
  from {
    transform: perspective(1100px) rotateY(18deg) rotateX(-4deg) translateX(48px) translateZ(-60px);
    opacity: 0;
    filter: blur(8px);
  }
  to {
    transform: none;
    opacity: 1;
    filter: none;
  }
}
.panel__scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: var(--warm);
  opacity: 0;
  animation: scan 2.6s var(--ease-calm) 0.8s both;
  pointer-events: none;
}
.panel__scan--ink {
  background: var(--ink);
}
@keyframes scan {
  0% { transform: translateY(0); opacity: 0.9; }
  100% { transform: translateY(calc(100% + 100cqh)); opacity: 0; }
}
.panel__corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--warm);
}
.act--review .panel:has(.panel__scan--ink) .panel__corner,
.panel--ideas .panel__corner {
  border-color: var(--ink);
}
.panel__corner--tl { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
.panel__corner--tr { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
.panel__corner--bl { bottom: -1px; left: -1px; border-right: 0; border-top: 0; }
.panel__corner--br { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }
.panel__title {
  font-weight: 200;
  font-size: clamp(1.8rem, 1rem + 2.2vw, 3rem);
  line-height: 1.04;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.panel__desc {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--ink);
}
.panel__shape {
  margin: 0.25rem 0 0;
  display: grid;
  gap: 0.7rem;
  border-top: 1px solid var(--hair);
  padding-top: 0.9rem;
}
.panel__shape div {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 0.75rem;
}
.panel__shape dt {
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-3);
  padding-top: 0.2rem;
}
.panel__shape dd {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--ink-2);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.panel__shape strong {
  font-weight: 500;
  color: var(--ink);
}
.panel .actions {
  margin-top: 0.5rem;
}
.panel__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.panel__fine {
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--ink-3);
}

/* your ideas */
.act--ideas {
  justify-content: center;
  align-items: flex-end;
  z-index: 2;
}
.panel--ideas {
  width: min(100%, 30rem);
  max-height: calc(100vh - var(--hk-chrome, 64px) - 4rem);
  overflow-y: auto;
  scrollbar-width: none;
  animation-name: panelIn;
}
.ideas {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hair);
}
.idea {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--hair);
}
.idea__main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.idea__name {
  font-weight: 200;
  font-size: 1.4rem;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.idea__meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.idea__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
}
.idea__actions .link {
  font-size: 0.8rem;
}

/* patterns: controls at the foot */
.act--patterns {
  justify-content: flex-end;
}
.act__foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem 2rem;
}

/* combining */
.act--combine {
  justify-content: flex-end;
  align-items: center;
  text-align: center;
}
.combine {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.combine-line {
  font-weight: 200;
  font-size: clamp(1.4rem, 1rem + 1.6vw, 2.4rem);
  letter-spacing: -0.02em;
}
.dots i {
  display: inline-block;
  animation: dot 1.4s ease-in-out infinite;
  font-style: normal;
}
.dots i:nth-child(2) { animation-delay: 0.2s; }
.dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot {
  0%, 60%, 100% { opacity: 0.2; }
  30% { opacity: 1; }
}

/* the pitch: right of the distilled constellation; the board along the foot */
.act--brief {
  justify-content: flex-start;
  align-items: flex-end;
  overflow-y: auto;
  scrollbar-width: none;
}
.act--brief::-webkit-scrollbar { display: none; }
.sheet {
  width: min(100%, 36rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: auto 0;
  padding-bottom: 1rem;
}
/* wide screens: the board runs along the foot of the left column */
@media (min-aspect-ratio: 1/1) {
  .act--brief .board {
    position: fixed;
    left: var(--hk-pad, 2.5rem);
    bottom: var(--hk-pad, 2.5rem);
    width: calc(100% - 36rem - 3 * var(--hk-pad, 2.5rem));
    min-width: 18rem;
    border-top: 1px solid var(--hair);
  }
}
.sheet__pitch {
  max-width: 40ch;
  font-size: clamp(1.05rem, 0.95rem + 0.6vw, 1.4rem);
  line-height: 1.45;
  letter-spacing: -0.015em;
}
.sheet__build {
  list-style: none;
  margin: 0.5rem 0;
  padding: 0;
  border-top: 1px solid var(--hair-strong);
}
.sheet__build li {
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--hair);
  font-size: 0.98rem;
  line-height: 1.45;
}
.sheet__ask {
  max-width: 44ch;
  color: var(--ink-2);
  line-height: 1.5;
}

.board {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 1rem;
  border-top: 1px solid var(--hair);
  pointer-events: auto;
}
.board__label {
  gap: 0.5rem;
  align-items: center;
}
.board__row {
  list-style: none;
  margin: 0;
  padding: 2px 2px 0.5rem;
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.board__row::-webkit-scrollbar { display: none; }
.bcard {
  position: relative;
  flex: none;
  width: 13.5rem;
  padding: 0.65rem 0.8rem 0.7rem;
  border: 1px solid var(--hair);
  background: rgba(247, 242, 233, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.bcard.is-mine {
  border-color: var(--warm);
}
.bcard__name {
  font-weight: 200;
  font-size: 1.1rem;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bcard__meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-3);
}

/* ----------------------------------------------------------- mobile */
@media (max-aspect-ratio: 1/1) {
  .act--review,
  .act--ideas {
    justify-content: flex-end;
    align-items: stretch;
  }
  .panel {
    width: 100%;
    transform-origin: center bottom;
    max-height: 50vh;
    max-height: 50svh;
  }
  .panel--ideas {
    overflow-y: auto;
    scrollbar-width: none;
  }
  .act--review .panel__shape div:nth-child(3) {
    display: none;
  }
  .ecard--story {
    --w0: min(15rem, 58vw);
    --w1: min(24rem, 88vw);
  }
  .ecard__face--s {
    grid-template-columns: 4rem 1fr;
    gap: 0.5rem;
    padding: 0.45rem;
  }
  .ecard__face--s .ecard__title {
    font-size: 0.74rem;
    -webkit-line-clamp: 2;
  }
  .ecard__face--s .ecard__body {
    gap: 0.2rem;
  }
  .ecard__face--s .ecard__meta {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ecard__face--s .ecard__meta .ecard__dot {
    margin: 0 0.3rem;
  }
  .ecard__face--l {
    grid-template-columns: 7.5rem 1fr;
    gap: 0.9rem;
    padding: 0.75rem;
  }
  .ecard__face--l .ecard__img {
    aspect-ratio: 3 / 4;
  }
  .ecard__face--l .ecard__title {
    font-size: 1rem;
    -webkit-line-clamp: 5;
  }
  .ecard__face--l .ecard__sum {
    font-size: 0.82rem;
  }
  .ecard__meta {
    font-size: 0.54rem;
  }
  .fcard {
    display: none;
  }
  .fcard--inline {
    display: flex;
    animation: none;
  }
  .act--brief {
    justify-content: flex-start;
    align-items: stretch;
  }
  .sheet {
    width: 100%;
    margin: 44vh 0 1rem;
  }
  /* as the pitch scrolls up, the constellation recedes and the text fades
     out before it reaches the HUD */
  .is-brief .field__labels,
  .is-brief .field__canvas {
    opacity: calc(1 - var(--bs, 0));
    transition: none;
  }
  .act--brief {
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, transparent 6.4rem, #000 8.6rem);
    mask-image: linear-gradient(to bottom, transparent 0, transparent 6.4rem, #000 8.6rem);
  }
}
/* short screens: the openings read from the top and scroll, never clip */
@media (max-height: 560px) {
  .intro {
    align-items: flex-start;
    overflow-y: auto;
    padding-top: 3.75rem;
    padding-bottom: 2.5rem;
  }
  .intro__in {
    gap: 1rem;
  }
  .intro__head {
    font-size: clamp(1.9rem, 1rem + 5vh, 2.7rem);
  }
  .intro__line {
    font-size: 0.98rem;
    max-width: 52ch;
  }
  .intro__line--you {
    font-size: 1.15rem;
  }
  .intro__rule {
    display: none;
  }
}
/* phones held sideways: everything at once, nothing on top of anything */
@media (min-aspect-ratio: 1/1) and (max-height: 520px) {
  .act {
    padding-top: 3.6rem;
    padding-bottom: 0.75rem;
  }
  .act--review {
    justify-content: flex-start;
  }
  .panel {
    width: min(100%, 23rem);
    max-height: calc(100vh - 4.4rem);
    max-height: calc(100svh - 4.4rem);
    padding: 1.1rem 1.2rem 1rem;
    gap: 0.6rem;
  }
  .panel__body {
    gap: 0.6rem;
  }
  .panel__title {
    font-size: 1.55rem;
  }
  .panel__desc {
    font-size: 0.9rem;
  }
  .panel__shape div {
    grid-template-columns: 5.5rem 1fr;
  }
  .ecard--story {
    --w0: 15rem;
    --w1: min(26rem, 52vw);
  }
  .ecard__face--s {
    grid-template-columns: 4.25rem 1fr;
    gap: 0.55rem;
    padding: 0.45rem;
  }
  .ecard__face--s .ecard__title {
    font-size: 0.76rem;
    -webkit-line-clamp: 2;
  }
  .ecard__face--s .ecard__meta {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.55rem;
  }
  .ecard__face--l {
    grid-template-columns: 7rem 1fr;
    gap: 0.9rem;
    padding: 0.75rem;
  }
  .ecard__face--l .ecard__img {
    aspect-ratio: 3 / 4;
  }
  .ecard__face--l .ecard__title {
    font-size: 1rem;
    -webkit-line-clamp: 4;
  }
  .ecard__face--l .ecard__sum {
    font-size: 0.8rem;
    line-height: 1.45;
  }
  .nlabel {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
  }
  .nlabel.is-pick {
    font-size: 0.76rem;
    letter-spacing: 0.08em;
  }
  .act__foot {
    gap: 0.5rem 1.5rem;
  }
}
@media (max-width: 760px) {
  .hud {
    max-width: calc(100% - 2 * var(--hk-pad, 1.25rem));
  }
  .hud__problem {
    font-size: 1.35rem;
  }
  .act__foot {
    justify-content: flex-start;
    gap: 0.75rem 1.5rem;
  }
  .act__foot .btn-line {
    order: -1;
    width: 100%;
    text-align: center;
  }
  .sheet__build li {
    grid-template-columns: 5rem 1fr;
  }
  /* phones: tighter names, so the longest fits the narrowest screen */
  .nlabel {
    font-size: 0.66rem;
    letter-spacing: 0.1em;
  }
  .nlabel.is-pick {
    font-size: 0.74rem;
    letter-spacing: 0.08em;
  }
  .nlabel.is-pick .nlabel__btn {
    padding: 0.55rem 0.45rem;
  }
  .panel__title {
    font-size: clamp(1.6rem, 1.1rem + 2.4vw, 2.1rem);
  }
  .panel {
    padding: 1.25rem;
    gap: 0.75rem;
  }
  .panel__shape div {
    grid-template-columns: 6rem 1fr;
  }
}

/* ------------------------------------------------------------ intro */
.intro {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: flex;
  align-items: center;
  padding: calc(var(--hk-chrome, 64px) + 1rem) var(--hk-pad, 2.5rem);
  background: radial-gradient(120% 100% at 28% 40%, #24211f 0%, #141414 68%);
  color: #efe9df;
  cursor: default;
}
.intro__in {
  max-width: 50rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.intro__eyebrow,
.intro__head,
.intro__line,
.intro__cta {
  opacity: 0;
  transform: translateY(22px);
  filter: blur(12px);
  transition: opacity 2.2s var(--ease-calm), transform 2.8s var(--ease-calm), filter 2.4s var(--ease-calm);
}
.intro .is-on {
  opacity: 1;
  transform: none;
  filter: none;
}
.intro__eyebrow {
  display: flex;
  gap: 0.55rem;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(239, 233, 223, 0.6);
}
.intro__sep {
  opacity: 0.5;
  font-weight: 300;
}
.intro__head {
  font-weight: 200;
  font-size: clamp(2.6rem, 1.2rem + 4.8vw, 6rem);
  line-height: 0.98;
  letter-spacing: -0.045em;
  text-wrap: balance;
}
.intro__line {
  max-width: 38ch;
  font-size: clamp(1.05rem, 0.9rem + 0.6vw, 1.45rem);
  line-height: 1.5;
  letter-spacing: -0.015em;
  color: rgba(239, 233, 223, 0.74);
}
.intro__term {
  color: #f0b39a;
}
.intro__cta {
  margin-top: 0.75rem;
}
.btn-line--bone {
  border-color: #efe9df;
  color: #efe9df;
}
.btn-line--bone::before {
  background: #efe9df;
}
.btn-line--bone:hover:not(:disabled) {
  color: #141414;
}
.intro__skip {
  position: absolute;
  z-index: 2; /* above the opening's lines, which carry their own layers */
  top: calc(var(--hk-chrome, 64px) / 2);
  right: var(--hk-pad, 2.5rem);
  translate: 0 -50%;
  padding: 0.4rem 0;
  border: 0;
  border-bottom: 1px solid rgba(239, 233, 223, 0.35);
  background: none;
  color: rgba(239, 233, 223, 0.8);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 0.4s ease, border-color 0.4s ease;
}
.intro__skip:hover {
  color: #efe9df;
  border-color: #efe9df;
}
/* a hairline runs the length of the opening */
.intro__rule {
  position: absolute;
  left: var(--hk-pad, 2.5rem);
  right: var(--hk-pad, 2.5rem);
  bottom: var(--hk-pad, 2.5rem);
  height: 1px;
  background: rgba(239, 233, 223, 0.3);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 12s linear;
}
.intro__rule.is-on {
  transform: scaleX(1);
}
/* the second opening: two scenes in one place, the first giving way */
.intro--pattern {
  background: radial-gradient(110% 95% at 74% 62%, color-mix(in srgb, var(--w1, #efb496) 24%, #141414) 0%, #141414 68%);
}
.intro__stage {
  display: grid;
}
.intro__scene {
  grid-area: 1 / 1;
  align-self: center;
  transition: opacity 2s var(--ease-calm), filter 2.2s var(--ease-calm), transform 2.4s var(--ease-calm);
}
.intro__scene.is-gone {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(-18px);
  pointer-events: none;
}
.intro__line--you {
  max-width: 34ch;
  font-size: clamp(1.25rem, 1rem + 1vw, 1.9rem);
  font-weight: 200;
  line-height: 1.4;
  color: rgba(239, 233, 223, 0.86);
}
.intro__rule--long {
  transition-duration: 17s;
}
.intro-enter-active {
  transition: opacity 1.4s var(--ease-calm);
}
.intro-leave-active {
  transition: opacity 2.4s var(--ease-calm), filter 2.4s var(--ease-calm);
}
.intro-enter-from,
.intro-leave-to {
  opacity: 0;
}
.intro-leave-to {
  filter: blur(8px);
}

@media (prefers-reduced-motion: reduce) {
  .intro__eyebrow, .intro__head, .intro__line, .intro__cta { transition: opacity 0.4s ease; transform: none; filter: none; }
  .wash { animation: none; }
  .ecard__in, .panel, .panel__scan { animation: none; opacity: 1; }
  .act-enter-active, .act-leave-active, .ui-enter-active, .ui-leave-active, .swap-enter-active, .swap-leave-active { transition: opacity 0.3s ease; }
}
</style>
