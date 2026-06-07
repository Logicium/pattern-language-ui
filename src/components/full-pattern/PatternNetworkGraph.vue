<template>
  <div ref="wrapperRef" class="pattern-network">
    <canvas
      ref="canvasRef"
      class="network-canvas"
      @click="handleClick"
      @mousemove="handleMouseMove"
      @mouseleave="hoveredId = null"
    ></canvas>
    <div v-if="hoveredNode" class="network-tooltip" :style="tooltipStyle">
      <p class="tooltip-title">{{ hoveredNode.title }}</p>
      <p v-if="hoveredNode.category" class="tooltip-meta text-xs text-tertiary">
        {{ hoveredNode.category }}
      </p>
    </div>
    <div class="network-legend text-xs text-tertiary">
      <span class="legend-item"><span class="dot dot--center"></span>Current</span>
      <span class="legend-item"><span class="dot dot--related"></span>Related</span>
      <span class="legend-item"><span class="dot dot--secondary"></span>Two steps away</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Pattern } from '@/types'

const props = defineProps<{
  pattern: Pattern
  allPatterns: Pattern[]
}>()

const router = useRouter()

const wrapperRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

interface GraphNode {
  id: number
  title: string
  category?: string
  level: 0 | 1 | 2
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

interface GraphEdge {
  a: number
  b: number
  level: 1 | 2
}

const palette = {
  center: '#d47b5f',
  related: '#e8b4a0',
  secondary: '#b8d4c8',
  edge: 'rgba(42, 42, 42, 0.18)',
  edgeFar: 'rgba(42, 42, 42, 0.08)',
}

const findByTitle = (title: string): Pattern | undefined => {
  const lower = title.toLowerCase()
  return props.allPatterns.find((p) => p.title.toLowerCase() === lower)
}

const graph = computed<{ nodes: GraphNode[]; edges: GraphEdge[] }>(() => {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const seen = new Set<number>()

  // Level 0: center.
  nodes.push({
    id: props.pattern.id,
    title: props.pattern.title,
    category: props.pattern.category,
    level: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 18,
    color: palette.center,
  })
  seen.add(props.pattern.id)

  // Level 1: direct related.
  const level1: Pattern[] = []
  for (const title of props.pattern.relatedPatterns || []) {
    const found = findByTitle(title)
    if (!found || seen.has(found.id)) continue
    level1.push(found)
    seen.add(found.id)
    nodes.push({
      id: found.id,
      title: found.title,
      category: found.category,
      level: 1,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0,
      radius: 12,
      color: palette.related,
    })
    edges.push({ a: props.pattern.id, b: found.id, level: 1 })
  }

  // Level 2: related to related (max 2 per level-1 to keep readable).
  for (const p of level1) {
    let added = 0
    for (const title of p.relatedPatterns || []) {
      if (added >= 2) break
      const found = findByTitle(title)
      if (!found || seen.has(found.id)) continue
      seen.add(found.id)
      added += 1
      nodes.push({
        id: found.id,
        title: found.title,
        category: found.category,
        level: 2,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        radius: 7,
        color: palette.secondary,
      })
      edges.push({ a: p.id, b: found.id, level: 2 })
    }
  }

  return { nodes, edges }
})

const hoveredId = ref<number | null>(null)
const hoveredNode = computed(() =>
  hoveredId.value !== null ? graph.value.nodes.find((n) => n.id === hoveredId.value) || null : null,
)
const tooltipPos = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const tooltipStyle = computed(() => ({
  left: `${tooltipPos.value.x}px`,
  top: `${tooltipPos.value.y}px`,
}))

let animationFrameId: number | null = null
let nodesState: GraphNode[] = []
let edgesState: GraphEdge[] = []
let width = 0
let height = 0
let dpr = 1
let cleanupResize: (() => void) | null = null

const stepSimulation = () => {
  const centerX = width / 2
  const centerY = height / 2

  // Repulsion between every pair.
  for (let i = 0; i < nodesState.length; i++) {
    const a = nodesState[i]!
    for (let j = i + 1; j < nodesState.length; j++) {
      const b = nodesState[j]!
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distSq = Math.max(80, dx * dx + dy * dy)
      const force = 1800 / distSq
      const dist = Math.sqrt(distSq)
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      if (a.level !== 0) {
        a.vx -= fx
        a.vy -= fy
      }
      if (b.level !== 0) {
        b.vx += fx
        b.vy += fy
      }
    }
  }

  // Edge spring force.
  for (const edge of edgesState) {
    const a = nodesState.find((n) => n.id === edge.a)
    const b = nodesState.find((n) => n.id === edge.b)
    if (!a || !b) continue
    const targetDist = edge.level === 1 ? 130 : 90
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const diff = dist - targetDist
    const k = 0.02
    const fx = (dx / dist) * diff * k
    const fy = (dy / dist) * diff * k
    if (a.level !== 0) {
      a.vx += fx
      a.vy += fy
    }
    if (b.level !== 0) {
      b.vx -= fx
      b.vy -= fy
    }
  }

  // Pull center node fixed at (0,0).
  for (const n of nodesState) {
    if (n.level === 0) {
      n.x = 0
      n.y = 0
      n.vx = 0
      n.vy = 0
      continue
    }
    // Light gravity toward center.
    n.vx += -n.x * 0.0008
    n.vy += -n.y * 0.0008
    // Damping.
    n.vx *= 0.85
    n.vy *= 0.85
    n.x += n.vx
    n.y += n.vy
  }

  // Translate into canvas coords during draw using centerX/centerY.
  void centerX
  void centerY
}

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, width, height)
  const centerX = width / 2
  const centerY = height / 2

  // Edges.
  ctx.lineWidth = 1
  for (const edge of edgesState) {
    const a = nodesState.find((n) => n.id === edge.a)
    const b = nodesState.find((n) => n.id === edge.b)
    if (!a || !b) continue
    ctx.strokeStyle = edge.level === 1 ? palette.edge : palette.edgeFar
    ctx.beginPath()
    ctx.moveTo(centerX + a.x, centerY + a.y)
    ctx.lineTo(centerX + b.x, centerY + b.y)
    ctx.stroke()
  }

  // Nodes (back-to-front by level so center sits on top).
  const ordered = [...nodesState].sort((m, n) => n.level - m.level)
  for (const n of ordered) {
    const isHover = n.id === hoveredId.value
    const x = centerX + n.x
    const y = centerY + n.y

    // Soft halo.
    if (n.level === 0 || isHover) {
      ctx.beginPath()
      ctx.arc(x, y, n.radius * 2.2, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(x, y, n.radius * 0.4, x, y, n.radius * 2.2)
      grad.addColorStop(0, hexWithAlpha(n.color, 0.4))
      grad.addColorStop(1, hexWithAlpha(n.color, 0))
      ctx.fillStyle = grad
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(x, y, n.radius, 0, Math.PI * 2)
    ctx.fillStyle = n.color
    ctx.fill()

    if (n.level === 0) {
      ctx.strokeStyle = '#fdfbf7'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Labels for center + level-1 (skip level-2 to stay clean).
    if (n.level <= 1) {
      ctx.fillStyle = '#2a2a2a'
      ctx.font = `${n.level === 0 ? '500 13px' : '400 11px'} Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const label = n.title.length > 28 ? n.title.slice(0, 26) + '…' : n.title
      ctx.fillText(label, x, y + n.radius + 8)
    }
  }
}

const hexWithAlpha = (hex: string, alpha: number) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const tick = () => {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  stepSimulation()
  draw(ctx)
  animationFrameId = requestAnimationFrame(tick)
}

const sizeCanvas = () => {
  if (!canvasRef.value || !wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  width = rect.width
  height = rect.height
  dpr = window.devicePixelRatio || 1
  canvasRef.value.width = width * dpr
  canvasRef.value.height = height * dpr
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`
  const ctx = canvasRef.value.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const resetSimulation = () => {
  const data = graph.value
  nodesState = data.nodes.map((n) => ({ ...n }))
  edgesState = data.edges.map((e) => ({ ...e }))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const mx = event.clientX - rect.left - width / 2
  const my = event.clientY - rect.top - height / 2
  let found: number | null = null
  for (const n of nodesState) {
    const dx = n.x - mx
    const dy = n.y - my
    if (dx * dx + dy * dy <= n.radius * n.radius * 2.2) {
      found = n.id
      break
    }
  }
  hoveredId.value = found
  if (found !== null) {
    tooltipPos.value = {
      x: event.clientX - rect.left + 12,
      y: event.clientY - rect.top + 12,
    }
  }
}

const handleClick = (event: MouseEvent) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const mx = event.clientX - rect.left - width / 2
  const my = event.clientY - rect.top - height / 2
  for (const n of nodesState) {
    const dx = n.x - mx
    const dy = n.y - my
    if (dx * dx + dy * dy <= n.radius * n.radius * 2.2) {
      if (n.id !== props.pattern.id) router.push(`/patterns/${n.id}`)
      return
    }
  }
}

onMounted(() => {
  resetSimulation()
  sizeCanvas()
  const onResize = () => sizeCanvas()
  window.addEventListener('resize', onResize)
  cleanupResize = () => window.removeEventListener('resize', onResize)
  tick()
})

watch(
  () => props.pattern.id,
  () => {
    resetSimulation()
  },
)

onUnmounted(() => {
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
  if (cleanupResize) cleanupResize()
})
</script>

<style scoped>
.pattern-network {
  position: relative;
  width: 100%;
  height: 600px;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  overflow: hidden;
}

.network-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.network-tooltip {
  position: absolute;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  padding: 0.625rem 0.875rem;
  pointer-events: none;
  max-width: 240px;
  z-index: 2;
  transform: translateZ(0);
}

.tooltip-title {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  margin: 0 0 0.25rem;
  line-height: 1.3;
}

.tooltip-meta {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(253, 251, 247, 0.6);
}

.network-legend {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(253, 251, 247, 0.85);
  padding: 0.5rem 0.875rem;
  pointer-events: none;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot--center { background: #d47b5f; }
.dot--related { background: #e8b4a0; }
.dot--secondary { background: #b8d4c8; }

@media (max-width: 768px) {
  .pattern-network { height: 420px; }
  .network-legend { font-size: 0.625rem; gap: 0.75rem; padding: 0.4rem 0.6rem; }
}
</style>
