<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.spark
const problems = s.problems
</script>

<template>
  <div class="slide">
    <div class="text">
      <p class="htf-label eyebrow rise" style="--d: 0.1s">{{ s.eyebrow }}</p>
      <h2 class="htf-display htf-display--lg rise" style="--d: 0.2s">
        <span>{{ s.headLine1 }}</span><br />
        <span>{{ s.headLine2 }}</span>
      </h2>
      <p class="htf-body rise" style="--d: 0.4s">
        <span>{{ s.bodyLead }}</span> <strong>{{ s.bodyStrong }}</strong> <span>{{ s.bodyTrail }}</span>
      </p>
      <ul class="problems">
        <li
          v-for="(p, i) in problems"
          :key="p"
          class="htf-label rise"
          :style="{ '--d': `${0.5 + i * 0.08}s` }"
        >
          <span class="htf-hl htf-hl--gray">{{ p }}</span>
        </li>
      </ul>
    </div>

    <div class="pivot">
      <p class="htf-display htf-display--md rise" style="--d: 1.1s">
        <span>{{ s.pivotLine1 }}</span><br />
        <span>{{ s.pivotLine2 }}</span>
      </p>
      <p class="htf-display htf-display--md htf-display--boxed rise" style="--d: 1.5s">
        <span class="htf-hl">{{ s.pivotBoxed1 }}</span><br />
        <span class="htf-hl">{{ s.pivotBoxed2 }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 6rem);
}

.text {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vh, 1.75rem);
}

.eyebrow {
  color: var(--htf-green);
}

.htf-body strong {
  color: #fff;
  font-weight: 700;
}

.problems {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  max-width: 42ch;
}

.pivot {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vh, 2.5rem);
  border-left: 3px solid var(--htf-green);
  padding-left: clamp(1.5rem, 3vw, 3rem);
}
</style>
