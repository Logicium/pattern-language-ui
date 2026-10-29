<template>
  <section class="panel what" aria-labelledby="what-title">
    <div class="panel__in" v-reveal>
      <h2 id="what-title" class="panel__title">Fifty proven ways to bring a small town back to life.</h2>
      <div class="what__body">
        <p class="panel__lede fade" style="--i: 0">
          Pattern Language is a library of fifty patterns for rural places, each one drawn from a town where it worked,
          and an AI partner that helps your community put them together into a plan. Name the problem that keeps you up
          at night. Stack the patterns that answer it. Leave with a 90-day playbook that has your name on a line.
        </p>
        <ol class="facets">
          <li v-for="(f, i) in facets" :key="f.num" class="facet fade" :style="{ '--i': i + 1 }">
            <span class="facet__num">{{ f.num }}</span>
            <div>
              <h3 class="facet__name">{{ f.name }}</h3>
              <p class="facet__text">{{ f.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { vReveal } from '@/directives/reveal'

/** The home page's second panel: what Pattern Language is, in one breath. */
const facets = [
  {
    num: '01',
    name: 'The library',
    text: 'Fifty patterns, from Community Anchor Point to Climate Resilience Micro-Projects, each with the evidence of where it worked and what it took.'
  },
  {
    num: '02',
    name: 'PAL',
    text: 'An AI that knows all fifty, and your town, and writes the first pitch in three minutes so the conversation starts with something on the table.'
  },
  {
    num: '03',
    name: 'The playbook',
    text: 'The first 90 days as tasks, dates and people, built together and tracked together, so the plan outlives the meeting.'
  }
]
</script>

<style scoped>
.panel {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 9rem var(--container-padding);
}
.panel__in {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.panel__title {
  max-width: 13ch;
  margin: 0 0 3.5rem;
  font-size: clamp(2.4rem, 1rem + 3.8vw, 4.6rem);
  font-weight: var(--font-weight-light);
  line-height: 1.02;
  letter-spacing: -0.04em;
}
.what__body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 3rem 6rem;
  align-items: start;
}
.panel__lede {
  margin: 0;
  font-size: 1.2rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.facets {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hairline-strong);
}
.facet {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: 1rem;
  padding: 1.4rem 0;
  border-bottom: 1px solid var(--hairline-strong);
}
.facet__num {
  padding-top: 0.25rem;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}
.facet__name {
  margin: 0 0 0.4rem;
  font-size: 1.35rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.015em;
}
.facet__text {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
@media (max-width: 900px) {
  .what__body {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
}
@media (max-width: 767px) {
  .panel {
    min-height: 0;
    padding: 6rem var(--container-padding);
  }
  .panel__title {
    margin-bottom: 2rem;
  }
  .panel__lede {
    font-size: 1.05rem;
  }
}
</style>
