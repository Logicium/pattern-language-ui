<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.anatomy
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">{{ s.num }}</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">
        {{ s.heading }}
      </h2>
    </header>

    <div class="formula rise" style="--d: 0.45s">
      <span class="term" style="--accent: var(--color-accent-1)">{{ s.term1 }}</span>
      <span class="op">+</span>
      <span class="term" style="--accent: var(--color-accent-2)">{{ s.term2 }}</span>
      <span class="op">+</span>
      <span class="term" style="--accent: var(--color-accent-3)">{{ s.term3 }}</span>
      <span class="op op--neq">≠</span>
      <span class="term term--fixed">{{ s.termFixed }}</span>
    </div>

    <p class="pld-body travel rise" style="--d: 0.75s">
      <span>{{ s.travelLead }}</span> <em>{{ s.travelEmphasis }}</em>
    </p>

    <p class="kicker rise" style="--d: 1.05s">
      {{ s.kicker }}
    </p>
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

.formula {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(0.75rem, 1.8vw, 1.5rem);
}

.term {
  padding: clamp(0.8rem, 1.8vh, 1.2rem) clamp(1rem, 2vw, 1.75rem);
  border: 1px solid var(--hairline-strong);
  border-top: 3px solid var(--accent, var(--hairline-strong));
  font-weight: 300;
  font-size: clamp(1rem, 1.8vw, 1.5rem);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.term--fixed {
  border-style: dashed;
  color: var(--color-text-tertiary);
  text-decoration: line-through;
  text-decoration-color: var(--color-accent-warm);
  text-decoration-thickness: 2px;
}

.op {
  font-weight: 200;
  font-size: clamp(1.4rem, 2.6vw, 2.25rem);
  color: var(--color-text-tertiary);
}

.op--neq {
  color: var(--color-accent-warm);
}

.travel {
  font-size: clamp(1.15rem, 2vw, 1.6rem);
}

.travel em {
  font-style: normal;
  color: var(--color-text-primary);
  font-weight: 400;
}

.kicker {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.4rem, 2.8vw, 2.5rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  border-left: 3px solid var(--color-accent-2);
  padding-left: clamp(1rem, 2vw, 1.75rem);
}
</style>
