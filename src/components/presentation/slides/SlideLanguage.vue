<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.language
const pairs = s.pairs
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">{{ s.num }}</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">
        {{ s.heading }}
      </h2>
      <p class="pld-body rise" style="--d: 0.4s">
        <span>{{ s.bodyLead }}</span> <em>{{ s.bodyEmphasis }}</em> <span>{{ s.bodyTrail }}</span>
      </p>
    </header>

    <div class="pairs">
      <div
        v-for="(p, i) in pairs"
        :key="p.pattern"
        class="pair rise"
        :style="{ '--d': `${0.55 + i * 0.15}s`, '--accent': p.swatch }"
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
