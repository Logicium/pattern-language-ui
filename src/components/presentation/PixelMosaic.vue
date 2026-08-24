<script setup lang="ts">
import { computed } from 'vue'

/**
 * Decorative pixel-mosaic in the Hack Trinidad Forward poster style.
 * Deterministic (seeded) so a given slide always renders the same blocks.
 */
const props = withDefaults(
  defineProps<{
    rows?: number
    cols?: number
    seed?: number
    /** Cell size in CSS units, e.g. '4vw' */
    cell?: string
    /** Probability weights: [green, gray, transparent] */
    weights?: [number, number, number]
    /** Stagger the entrance animation */
    animate?: boolean
  }>(),
  {
    rows: 4,
    cols: 4,
    seed: 1,
    cell: 'clamp(2rem, 4.5vw, 4.5rem)',
    weights: () => [0.28, 0.22, 0.5],
    animate: true
  }
)

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

const cells = computed(() => {
  const rand = mulberry32(props.seed)
  const [g, gr] = props.weights
  return Array.from({ length: props.rows * props.cols }, (_, i) => {
    const r = rand()
    const color = r < g ? 'green' : r < g + gr ? 'gray' : 'none'
    return { i, color, delay: rand() * 0.5 }
  })
})
</script>

<template>
  <div
    class="mosaic"
    :style="{ gridTemplateColumns: `repeat(${cols}, ${cell})`, gridAutoRows: cell }"
    aria-hidden="true"
  >
    <div
      v-for="c in cells"
      :key="c.i"
      class="mosaic__cell"
      :class="[`mosaic__cell--${c.color}`, { 'mosaic__cell--animate': animate }]"
      :style="{ '--d': `${c.delay}s` }"
    />
  </div>
</template>

<style scoped>
.mosaic {
  display: grid;
  pointer-events: none;
}

.mosaic__cell--green {
  background: var(--htf-green, #00ff88);
}

.mosaic__cell--gray {
  background: var(--htf-gray, #d4d4d4);
}

.mosaic__cell--none {
  background: transparent;
}

.mosaic__cell--animate {
  opacity: 0;
  animation: mosaicIn 0.4s steps(2, jump-end) forwards;
  animation-delay: var(--d, 0s);
}

@keyframes mosaicIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
