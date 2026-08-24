<script setup lang="ts">
const pairs = [
  { problem: 'Youth flight & talent drain', pattern: 'Youth Return Pathway', accent: 'var(--color-accent-1)' },
  { problem: 'Low civic trust', pattern: 'Community Anchor Point', accent: 'var(--color-accent-2)' },
  { problem: 'Isolation & disconnection', pattern: 'Shared Cultural Story', accent: 'var(--color-accent-3)' },
  { problem: 'Economic stagnation', pattern: 'Main Street Reawakening', accent: 'var(--color-accent-warm)' }
]
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">01</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">
        A language for community change
      </h2>
      <p class="pld-body rise" style="--d: 0.4s">
        In 1977, architect Christopher Alexander showed that good places are built from
        recurring, nameable patterns. The <em>Rural Pattern Language</em> applies that idea to
        the hardest problems small towns face — 50 proven patterns, each one a solution that
        has worked somewhere real.
      </p>
    </header>

    <div class="pairs">
      <div
        v-for="(p, i) in pairs"
        :key="p.pattern"
        class="pair rise"
        :style="{ '--d': `${0.55 + i * 0.15}s`, '--accent': p.accent }"
      >
        <span class="pair__problem">{{ p.problem }}</span>
        <span class="pair__arrow chevron" aria-hidden="true" />
        <span class="pair__pattern">{{ p.pattern }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(2rem, 5vh, 3.5rem);
}

.head {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vh, 1.4rem);
}

.pld-body em {
  font-style: normal;
  color: var(--color-text-primary);
  font-weight: 400;
}

.pairs {
  display: flex;
  flex-direction: column;
}

.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: clamp(1rem, 3vw, 3rem);
  padding: clamp(0.9rem, 2.2vh, 1.4rem) 0;
  border-bottom: 1px solid var(--hairline);
  border-left: 3px solid var(--accent);
  padding-left: clamp(1rem, 2vw, 1.75rem);
}

.pair:first-child {
  border-top: 1px solid var(--hairline);
}

.pair__problem {
  font-weight: 300;
  font-size: clamp(1rem, 1.8vw, 1.5rem);
  color: var(--color-text-secondary);
}

.pair__arrow {
  color: var(--color-text-tertiary);
}

.pair__pattern {
  font-weight: 400;
  font-size: clamp(1rem, 1.8vw, 1.5rem);
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}
</style>
