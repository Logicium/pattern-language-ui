<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.hackathon
</script>

<template>
  <div class="slide">
    <h2 class="htf-display htf-display--lg htf-display--boxed rise" style="--d: 0.1s">
      <span>{{ s.headLead }}</span><br />
      <span class="htf-hl">{{ s.headHl }}</span>
    </h2>

    <p class="htf-body wide rise" style="--d: 0.3s">
      {{ s.lede }}
    </p>

    <div class="stats">
      <div class="stat rise" style="--d: 0.45s">
        <span class="stat__value">{{ s.stats.hours.value }}</span>
        <span class="htf-label stat__label">{{ s.stats.hours.label }}</span>
      </div>
      <div class="stat rise" style="--d: 0.55s">
        <span class="stat__value">{{ s.stats.sponsors.value }}</span>
        <span class="htf-label stat__label">{{ s.stats.sponsors.label }}</span>
      </div>
      <div class="stat rise" style="--d: 0.65s">
        <span class="stat__value">{{ s.stats.prizes.value }}</span>
        <span class="htf-label stat__label">{{ s.stats.prizes.label }}</span>
      </div>
      <div class="stat rise" style="--d: 0.75s">
        <span class="stat__value">{{ s.stats.projects.value }}</span>
        <span class="htf-label stat__label">{{ s.stats.projects.label }}</span>
      </div>
    </div>

    <p class="htf-label footer rise" style="--d: 0.9s">
      <span class="htf-hl htf-hl--yellow">{{ s.when }}</span
      >&nbsp;&nbsp;
      <span class="htf-hl htf-hl--gray">{{ s.where }}</span>
    </p>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 3rem);
}

.wide {
  max-width: 60ch;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: rgba(255, 255, 255, 0.18);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.stat {
  background: #000;
  padding: clamp(1.2rem, 3vh, 2.5rem) clamp(1rem, 2vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat__value {
  font-family: var(--htf-font);
  font-weight: 900;
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  line-height: 1;
  color: var(--htf-green);
}

.stat__label {
  color: rgba(255, 255, 255, 0.7);
}

.footer {
  line-height: 2.2;
}

@media (max-aspect-ratio: 1/1) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
  }
}
</style>
