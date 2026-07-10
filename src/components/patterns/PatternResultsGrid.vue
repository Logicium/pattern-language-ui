<template>
  <div v-if="patterns.length > 0" class="patterns-grid">
    <router-link
      v-for="(pattern, index) in patterns"
      :key="pattern.id"
      :to="`/patterns/${pattern.id}`"
      class="pattern-card"
      :data-accent="(index % 3) + 1"
    >
      <!-- Unique constellation of related-pattern nodes, seeded by pattern id -->
      <svg
        class="card-constellation"
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <line
          v-for="(edge, i) in constellationFor(pattern.id).edges"
          :key="`e${i}`"
          :x1="edge.x1" :y1="edge.y1" :x2="edge.x2" :y2="edge.y2"
          class="constellation-edge"
        />
        <circle
          v-for="(node, i) in constellationFor(pattern.id).nodes"
          :key="`n${i}`"
          :cx="node.x" :cy="node.y" :r="node.r"
          class="constellation-node"
          :data-accent="node.accent"
          :style="{ opacity: node.opacity }"
        />
      </svg>

      <div class="label-row">
        <span class="label-id">
          <span class="accent-mark" aria-hidden="true"></span>
          Pattern {{ String(pattern.id).padStart(2, '0') }}
        </span>
        <span class="label-meta">{{ constellationFor(pattern.id).nodes.length }} nodes</span>
      </div>

      <h3 class="card-title">{{ pattern.title }}</h3>

      <p class="card-description">{{ pattern.description }}</p>

      <div class="card-tags">
        <button
          v-for="addr in pattern.addresses.slice(0, 3)"
          :key="addr"
          type="button"
          class="tag-chip"
          @click.prevent.stop="$emit('toggleFilter', addr)"
        >
          {{ addr }}
        </button>
        <span v-if="pattern.addresses.length > 3" class="tag-more">
          +{{ pattern.addresses.length - 3 }}
        </span>
      </div>

      <div class="card-foot">
        <span class="foot-note">Addresses {{ pattern.addresses.length }} {{ pattern.addresses.length === 1 ? 'challenge' : 'challenges' }}</span>
        <span class="view-note">View Pattern</span>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  patterns: any[]
}>()

defineEmits<{
  toggleFilter: [filter: string]
}>()

interface ConstellationNode {
  x: number
  y: number
  r: number
  accent: number
  opacity: number
}

interface ConstellationEdge {
  x1: number
  y1: number
  x2: number
  y2: number
}

// Deterministic PRNG so every pattern always draws the same constellation
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const buildConstellation = (pattern: any) => {
  const rand = mulberry32(pattern.id * 7919 + 13)
  const count = 5 + (pattern.addresses?.length ?? 0) % 5 + Math.floor(rand() * 3)

  const nodes: ConstellationNode[] = []
  for (let i = 0; i < count; i++) {
    // Bias nodes toward the upper-right so text stays clean lower-left
    const x = 90 + rand() * 300
    const y = 12 + rand() * 160
    nodes.push({
      x: Math.round(x),
      y: Math.round(y),
      r: i === 0 ? 5 : 2 + Math.round(rand() * 2),
      accent: (i % 3) + 1,
      opacity: i === 0 ? 0.9 : 0.4 + rand() * 0.4,
    })
  }

  // Thread each node to its nearest previous node, plus one long cross-link
  const edges: ConstellationEdge[] = []
  for (let i = 1; i < nodes.length; i++) {
    let nearest = 0
    let best = Infinity
    for (let j = 0; j < i; j++) {
      const a = nodes[i]!, b = nodes[j]!
      const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
      if (d < best) { best = d; nearest = j }
    }
    const a = nodes[i]!, b = nodes[nearest]!
    edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
  }
  if (nodes.length > 3) {
    const a = nodes[0]!, b = nodes[nodes.length - 1]!
    edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
  }

  return { nodes, edges }
}

const EMPTY_CONSTELLATION = { nodes: [] as ConstellationNode[], edges: [] as ConstellationEdge[] }

const constellations = computed<Record<number, ReturnType<typeof buildConstellation>>>(() =>
  Object.fromEntries(props.patterns.map(p => [p.id, buildConstellation(p)]))
)

const constellationFor = (id: number) => constellations.value[id] ?? EMPTY_CONSTELLATION
</script>

<style scoped>
.patterns-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.pattern-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  padding: 2.75rem 2.5rem 2.25rem;
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.pattern-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

/* ── Constellation backdrop ── */
.card-constellation {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Fade toward the lower-left where the type sits */
  mask-image: linear-gradient(215deg, black 0%, rgba(0, 0, 0, 0.5) 45%, transparent 80%);
  -webkit-mask-image: linear-gradient(215deg, black 0%, rgba(0, 0, 0, 0.5) 45%, transparent 80%);
}

.constellation-edge {
  stroke: rgba(42, 42, 42, 0.1);
  stroke-width: 1;
}

.constellation-node[data-accent="1"] { fill: var(--color-accent-1); }
.constellation-node[data-accent="2"] { fill: var(--color-accent-2); }
.constellation-node[data-accent="3"] { fill: var(--color-accent-3); }

/* ── Card content (above the constellation) ── */
.label-row,
.card-title,
.card-description,
.card-tags,
.card-foot {
  position: relative;
  z-index: 1;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 1.75rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.pattern-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.pattern-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.pattern-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.label-meta { white-space: nowrap; }

.card-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 0.85rem;
}

.card-description {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 1.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.tag-chip {
  padding: 0.45rem 0.85rem;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  transition: background-color var(--transition-fast);
}

.pattern-card[data-accent="1"] .tag-chip { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.pattern-card[data-accent="2"] .tag-chip { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.pattern-card[data-accent="3"] .tag-chip { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

.pattern-card[data-accent="1"] .tag-chip:hover { background: color-mix(in srgb, var(--color-accent-1) 42%, transparent); }
.pattern-card[data-accent="2"] .tag-chip:hover { background: color-mix(in srgb, var(--color-accent-2) 50%, transparent); }
.pattern-card[data-accent="3"] .tag-chip:hover { background: color-mix(in srgb, var(--color-accent-3) 42%, transparent); }

.tag-more {
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.card-foot {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--hairline);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.foot-note { color: var(--color-text-tertiary); }

.view-note {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--hairline-strong);
  padding-bottom: 2px;
  white-space: nowrap;
  transition: border-color var(--transition-fast);
}

.pattern-card:hover .view-note { border-bottom-color: var(--color-text-primary); }

@media (max-width: 1024px) {
  .patterns-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .patterns-grid { grid-template-columns: 1fr; }
  .pattern-card { padding: 2.25rem 1.75rem 2rem; }
}
</style>
