<template>
  <div ref="containerEl" class="playbook-timeline">
    <div class="timeline-track" aria-hidden="true">
      <span class="track-fill" :style="{ width: `${elapsedPct}%` }"></span>
    </div>

    <div
      v-for="node in layout"
      :key="node.key"
      class="timeline-node"
      :class="[`node--${node.kind}`, `node--${node.lane}`]"
      :style="{ '--pos': `${node.pct}%`, '--shift': `${node.shiftPx}px` }"
    >
      <span class="node-marker" :data-accent="node.accent"></span>
      <span class="node-text">
        <span class="node-label">{{ node.label }}</span>
        <span class="node-date">{{ node.dateLabel }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { playbooksApi } from '@/services/api'

const props = defineProps<{
  playbook: any
}>()

interface TimelineNode {
  key: string
  kind: 'start' | 'end' | 'today' | 'highlight'
  label: string
  dateLabel: string
  pct: number
  accent: number
}

const activities = ref<any[]>([])
const containerEl = ref<HTMLElement | null>(null)
const containerWidth = ref(0)

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  loadActivities()
  if (containerEl.value) {
    containerWidth.value = containerEl.value.clientWidth
    resizeObserver = new ResizeObserver(entries => {
      containerWidth.value = entries[0]?.contentRect.width ?? containerWidth.value
    })
    resizeObserver.observe(containerEl.value)
  }
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const loadActivities = async () => {
  if (!props.playbook || typeof props.playbook.id !== 'number') return
  try {
    activities.value = await playbooksApi.getActivities(props.playbook.id)
  } catch {
    activities.value = []
  }
}

watch(() => props.playbook?.id, loadActivities)

const shortDate = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)

const startDate = computed(() => new Date(props.playbook.startDate))
const endDate = computed(() =>
  new Date(props.playbook.completedDate || props.playbook.targetCompletionDate)
)

const span = computed(() =>
  Math.max(endDate.value.getTime() - startDate.value.getTime(), 1)
)

const pctFor = (date: Date, min = 6, max = 94) => {
  const raw = ((date.getTime() - startDate.value.getTime()) / span.value) * 100
  return Math.min(Math.max(raw, min), max)
}

const elapsedPct = computed(() => {
  if (props.playbook.completedDate) return 100
  const raw = ((Date.now() - startDate.value.getTime()) / span.value) * 100
  return Math.min(Math.max(raw, 0), 100)
})

// Only milestone-grade activity makes the timeline; chatter stays in the feed.
const HIGHLIGHT_LABELS: Record<string, string> = {
  playbook_published: 'Published',
  member_joined: 'Member joined',
  task_completed: 'Task done',
  event_created: 'Meetup set',
  playbook_completed: 'Completed',
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

const nodes = computed<TimelineNode[]>(() => {
  const result: TimelineNode[] = []

  result.push({
    key: 'start',
    kind: 'start',
    label: 'Started',
    dateLabel: shortDate(startDate.value),
    pct: 0,
    accent: 1,
  })

  const inWindow = (d: Date) =>
    d.getTime() >= startDate.value.getTime() && d.getTime() <= endDate.value.getTime()

  const seen = new Set<string>()
  const highlights = activities.value
    .filter(a => HIGHLIGHT_LABELS[a.action])
    .map(a => ({ ...a, date: new Date(a.createdAt) }))
    .filter(a => inWindow(a.date))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter(a => {
      // One node per action per day keeps the line breathable
      const key = `${a.action}-${a.date.toDateString()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(-4)

  highlights.forEach((a, i) => {
    result.push({
      key: `hl-${a.id}`,
      kind: 'highlight',
      label: a.action === 'task_completed' && a.targetTitle
        ? truncate(a.targetTitle, 22)
        : HIGHLIGHT_LABELS[a.action] ?? 'Milestone',
      dateLabel: shortDate(a.date),
      pct: pctFor(a.date),
      accent: (i % 3) + 1,
    })
  })

  if (!props.playbook.completedDate && elapsedPct.value > 4 && elapsedPct.value < 96) {
    result.push({
      key: 'today',
      kind: 'today',
      label: 'Today',
      dateLabel: shortDate(new Date()),
      pct: elapsedPct.value,
      accent: 0,
    })
  }

  result.push({
    key: 'end',
    kind: 'end',
    label: props.playbook.completedDate ? 'Completed' : 'Target',
    dateLabel: shortDate(endDate.value),
    pct: 100,
    accent: 3,
  })

  return result.sort((a, b) => a.pct - b.pct)
})

/**
 * Collision-free label layout. Markers never move; each label keeps its
 * natural anchor (centered on the marker, or edge-aligned for start/end)
 * and is assigned to the above/below lane, sliding sideways only when a
 * lane-mate would overlap it.
 */
const layout = computed(() => {
  const W = containerWidth.value

  // Approximate rendered label width: caps label at ~8.5px/char (10px + tracking),
  // date at ~7px/char, whichever is wider.
  const widthOf = (n: TimelineNode) =>
    Math.max(n.label.length * 8.5, n.dateLabel.length * 7) + 4

  const GAP = 14
  const lanes: Record<'above' | 'below', number> = { above: -Infinity, below: -Infinity }

  return nodes.value.map((node, i) => {
    if (!W) return { ...node, lane: 'above' as const, shiftPx: 0 }

    const w = widthOf(node)
    const markerX = (node.pct / 100) * W
    const base =
      node.kind === 'start' ? markerX :
      node.kind === 'end' ? markerX - w :
      markerX - w / 2

    const fits = (lane: 'above' | 'below') => base >= lanes[lane] + GAP

    // Preference: anchors and Today read best on top; highlights alternate.
    const preferred: 'above' | 'below' =
      node.kind === 'highlight' ? (i % 2 === 0 ? 'above' : 'below') : 'above'
    const other: 'above' | 'below' = preferred === 'above' ? 'below' : 'above'

    let lane: 'above' | 'below'
    let left = base
    if (fits(preferred)) {
      lane = preferred
    } else if (fits(other)) {
      lane = other
    } else {
      // Neither lane is clear — take the one with more room and slide right,
      // never past the container edge.
      lane = lanes[preferred] <= lanes[other] ? preferred : other
      left = Math.min(lanes[lane] + GAP, W - w)
    }

    lanes[lane] = left + w
    return { ...node, lane, shiftPx: Math.round(left - base) }
  })
})
</script>

<style scoped>
/* ── Desktop: horizontal chart ─────────────────────────────────── */
.playbook-timeline {
  position: relative;
  height: 132px;
  font-variant-numeric: tabular-nums;
}

.timeline-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--hairline-strong);
}

.track-fill {
  display: block;
  height: 2px;
  margin-top: -0.5px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  transition: width var(--transition-base);
}

.timeline-node {
  position: absolute;
  top: 50%;
  /* Marker and label move together when the collision solver nudges a node */
  left: calc(var(--pos) + var(--shift, 0px));
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-marker {
  width: 8px;
  height: 8px;
  background: var(--color-text-primary);
  flex-shrink: 0;
}

.node-marker[data-accent="1"] { background: var(--color-accent-1); }
.node-marker[data-accent="2"] { background: var(--color-accent-2); }
.node-marker[data-accent="3"] { background: var(--color-accent-3); }

.node--today .node-marker {
  width: 1px;
  height: 16px;
  background: var(--color-text-primary);
}

.node-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  white-space: nowrap;
}

.node--above .node-text { bottom: calc(50% + 16px); }
.node--below .node-text { top: calc(50% + 16px); }

.node--start { transform: translate(0, -50%); }
.node--start .node-text { align-items: flex-start; left: 0; }
.node--end { transform: translate(-100%, -50%); }
.node--end .node-text { align-items: flex-end; right: 0; }

.node-label {
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.node-date {
  font-size: 0.75rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-tertiary);
}

/* ── Mobile: vertical rail ─────────────────────────────────────── */
@media (max-width: 768px) {
  .playbook-timeline {
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-left: 3px;
  }

  .timeline-track {
    top: 4px;
    bottom: 4px;
    left: 3.5px;
    right: auto;
    width: 1px;
    height: auto;
  }

  .track-fill { display: none; }

  .timeline-node,
  .node--start,
  .node--end {
    position: static;
    transform: none;
    flex-direction: row;
    align-items: center;
    gap: 1.25rem;
  }

  .node--today .node-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .node-text,
  .node--above .node-text,
  .node--below .node-text,
  .node--start .node-text,
  .node--end .node-text {
    position: static;
    flex-direction: row;
    align-items: baseline;
    gap: 0.85rem;
  }
}
</style>
