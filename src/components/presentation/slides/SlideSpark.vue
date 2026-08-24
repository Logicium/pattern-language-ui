<script setup lang="ts">
const problems = [
  'Youth flight & talent drain',
  'Low civic trust',
  'Isolation & disconnection',
  'Economic stagnation',
  'Underused local assets',
  'Civic apathy'
]
</script>

<template>
  <div class="slide">
    <div class="text">
      <p class="htf-label eyebrow rise" style="--d: 0.1s">Finding the spark_</p>
      <h2 class="htf-display htf-display--lg rise" style="--d: 0.2s">
        Where did the<br />
        ideas come from?
      </h2>
      <p class="htf-body rise" style="--d: 0.4s">
        Before anyone wrote a line of code, we put an ideation framework on the table:
        Joze's <strong>Rural Pattern Language</strong> — the wicked problems rural
        communities face, each mapped to practical, proven patterns.
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
        The hackathon ended<br />
        Sunday at 2:30 PM.
      </p>
      <p class="htf-display htf-display--md htf-display--boxed rise" style="--d: 1.5s">
        <span class="htf-hl">The framework was</span><br />
        <span class="htf-hl">just getting started_</span>
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
