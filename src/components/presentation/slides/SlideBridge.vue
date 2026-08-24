<script setup lang="ts">
import { computed } from 'vue'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import { content } from '@/data/site'

const s = content.presentation.bridge

/**
 * The Act I → Act II transition. The deck background has already crossfaded to
 * the paper + ribbon canvas beneath us; this slide covers the screen with the
 * HTF pixel grid and dissolves it away in a diagonal wave, revealing the
 * Pattern Language wordmark.
 */
const COLS = 12
const ROWS = 7

const cells = computed(() =>
  Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    // Diagonal wave from top-left, with a deterministic per-cell jitter.
    const jitter = ((i * 2654435761) % 100) / 100
    const delay = (col + row) * 0.075 + jitter * 0.35
    const green = (i * 7919) % 23 === 0
    return { i, delay, green }
  })
)
</script>

<template>
  <div class="slide">
    <div class="reveal">
      <BrandLogo to="" mark-only :size="110" class="reveal__mark rise" style="--d: 1.6s" />
      <h2 class="pld-display pld-display--xl rise" style="--d: 1.9s">{{ s.wordmark }}</h2>
      <div class="pld-accent-line rise" style="--d: 2.3s" />
      <p class="pld-body rise" style="--d: 2.6s">
        {{ s.tagline }}
      </p>
    </div>

    <div class="grid" aria-hidden="true">
      <div
        v-for="c in cells"
        :key="c.i"
        class="grid__cell"
        :class="{ 'grid__cell--green': c.green }"
        :style="{ '--d': `${c.delay}s` }"
      />
    </div>
  </div>
</template>

<style scoped>
.slide {
  position: relative;
  height: 100%;
}

.reveal {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(1.2rem, 3vh, 2rem);
}

.reveal__mark {
  margin-bottom: 0.5rem;
}

.reveal .pld-body {
  font-size: clamp(1.1rem, 1.9vw, 1.5rem);
}

/* full-viewport pixel curtain that dissolves away */
.grid {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(7, 1fr);
  pointer-events: none;
}

.grid__cell {
  background: #000;
  animation: cellOut 0.55s steps(3, jump-end) forwards;
  animation-delay: var(--d, 0s);
}

.grid__cell--green {
  background: var(--htf-green);
}

@keyframes cellOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .grid {
    display: none;
  }
}
</style>
