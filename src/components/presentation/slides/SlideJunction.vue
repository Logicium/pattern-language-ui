<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.junction
const stack = s.stack
const functions = s.functions
const funding = s.funding
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">{{ s.eyebrow }}</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">{{ s.heading }}</h2>
      <div class="stack rise" style="--d: 0.4s">
        <template v-for="(p, i) in stack" :key="p.name">
          <span class="stack__chip" :style="{ '--accent': p.swatch }">{{ p.name }}</span>
          <span v-if="i < stack.length - 1" class="stack__plus" aria-hidden="true">+</span>
        </template>
        <span class="stack__note">{{ s.stackNote }}</span>
      </div>
      <p class="pld-body rise" style="--d: 0.55s">
        <span>{{ s.body }}</span> <em>{{ s.bodyEmphasis }}</em>
      </p>
    </header>

    <div class="functions">
      <article
        v-for="(f, i) in functions"
        :key="f.title"
        class="fn rise"
        :style="{ '--d': `${0.65 + i * 0.12}s` }"
      >
        <span class="fn__num">{{ i + 1 }}</span>
        <div>
          <h3 class="fn__title">{{ f.title }}</h3>
          <p class="fn__desc">{{ f.desc }}</p>
        </div>
      </article>
    </div>

    <div class="funding rise" style="--d: 1.2s">
      <span class="funding__label">{{ s.fundingLabel }}</span>
      <div class="funding__bar">
        <span
          v-for="f in funding"
          :key="f.label"
          class="funding__seg"
          :style="{ flexGrow: f.amount, background: f.swatch }"
          :title="`${f.label} $${f.amount}K`"
        />
      </div>
      <span class="funding__legend">
        <template v-for="(f, i) in funding" :key="f.label">
          <span>{{ f.label }}</span> ${{ f.amount }}K<template v-if="i < funding.length - 1"> · </template>
        </template>
        &nbsp;<span>{{ s.fundingSuffix }}</span>
      </span>
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
  gap: clamp(0.7rem, 1.8vh, 1.2rem);
}

.head .pld-body em {
  font-style: normal;
  color: var(--color-text-primary);
  font-weight: 400;
}

.stack {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.stack__chip {
  padding: 0.45rem 0.85rem;
  font-size: clamp(0.65rem, 0.95vw, 0.8rem);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--accent) 24%, transparent);
}

.stack__plus {
  color: var(--color-text-tertiary);
  font-weight: 200;
  font-size: 1.2rem;
}

.stack__note {
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  color: var(--color-text-tertiary);
  font-weight: 300;
}

.functions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.9rem, 2vw, 1.75rem);
}

.fn {
  display: flex;
  gap: clamp(0.8rem, 1.5vw, 1.25rem);
  border-top: 1px solid var(--hairline);
  padding-top: clamp(0.7rem, 1.6vh, 1.1rem);
}

.fn__num {
  font-weight: 200;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  color: var(--color-text-tertiary);
  line-height: 1;
}

.fn__title {
  margin: 0 0 0.35rem;
  font-weight: 400;
  font-size: clamp(0.95rem, 1.5vw, 1.25rem);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.fn__desc {
  margin: 0;
  font-weight: 300;
  font-size: clamp(0.78rem, 1.1vw, 0.95rem);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.funding {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.funding__label {
  font-size: clamp(0.7rem, 1vw, 0.8rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.funding__bar {
  display: flex;
  height: 10px;
  gap: 2px;
}

.funding__seg {
  display: block;
}

.funding__legend {
  font-size: clamp(0.68rem, 1vw, 0.82rem);
  font-weight: 300;
  color: var(--color-text-secondary);
}
</style>
