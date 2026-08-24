<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.learning
const wentWell = s.wentWell
const wentWrong = s.wentWrong
const loop = s.loop
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">{{ s.num }}</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">{{ s.heading }}</h2>
    </header>

    <div class="columns">
      <div class="col rise" style="--d: 0.4s">
        <h3 class="col__title col__title--well">{{ s.wellTitle }}</h3>
        <ul class="col__list">
          <li v-for="item in wentWell" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div class="col rise" style="--d: 0.55s">
        <h3 class="col__title col__title--wrong">{{ s.wrongTitle }}</h3>
        <ul class="col__list">
          <li v-for="item in wentWrong" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div class="pivot rise" style="--d: 0.85s">
      <p class="pivot__line">
        <span>{{ s.pivotLead }}</span> <em>{{ s.pivotEmphasis }}</em>
      </p>
      <p class="pivot__next">
        <span>{{ s.nextLead }}</span> <span class="pivot__chip">{{ s.nextChip }}</span> <span>{{ s.nextTrail }}</span>
      </p>
    </div>

    <div class="loop rise" style="--d: 1.1s">
      <template v-for="(step, i) in loop" :key="step">
        <span class="loop__step">{{ step }}</span>
        <span v-if="i < loop.length - 1" class="chevron loop__arrow" aria-hidden="true" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 3.5vh, 2.5rem);
}

.head {
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.6vh, 1rem);
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 4rem);
}

.col__title {
  margin: 0 0 0.75rem;
  font-size: clamp(0.75rem, 1.05vw, 0.9rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 400;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid transparent;
}

.col__title--well {
  color: var(--color-text-primary);
  border-color: var(--color-accent-2);
}

.col__title--wrong {
  color: var(--color-text-primary);
  border-color: var(--color-accent-warm);
}

.col__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.45rem, 1.2vh, 0.8rem);
}

.col__list li {
  font-weight: 300;
  font-size: clamp(0.8rem, 1.2vw, 1.02rem);
  line-height: 1.5;
  color: var(--color-text-secondary);
  padding-left: 1rem;
  position: relative;
}

.col__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 5px;
  height: 5px;
  background: var(--hairline-strong);
}

.pivot {
  border-left: 3px solid var(--color-accent-1);
  padding-left: clamp(1rem, 2vw, 1.75rem);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pivot__line {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.25rem, 2.4vw, 2rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.pivot__line em {
  font-style: normal;
  border-bottom: 3px solid var(--color-accent-warm);
}

.pivot__next {
  margin: 0;
  font-weight: 300;
  font-size: clamp(0.9rem, 1.4vw, 1.15rem);
  color: var(--color-text-secondary);
}

.pivot__chip {
  padding: 0.2rem 0.6rem;
  font-size: 0.85em;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-accent-2) 28%, transparent);
}

.loop {
  display: flex;
  align-items: center;
  gap: clamp(0.6rem, 1.5vw, 1.25rem);
  flex-wrap: wrap;
}

.loop__step {
  font-size: clamp(0.8rem, 1.3vw, 1.05rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-weight: 300;
  color: var(--color-text-primary);
}

.loop__arrow {
  color: var(--color-text-tertiary);
}
</style>
