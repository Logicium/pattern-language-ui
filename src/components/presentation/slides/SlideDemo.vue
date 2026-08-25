<script setup lang="ts">
import { content } from '@/data/site'

/* `d`, not `s`: the steps v-for already binds `s` as its item */
const d = content.presentation.demo
const steps = d.steps
</script>

<template>
  <div class="slide">
    <p class="pld-number rise" style="--d: 0.1s">{{ d.eyebrow }}</p>
    <h2 class="pld-display pld-display--xl rise" style="--d: 0.2s">
      <span>{{ d.headLead }}</span> <em>{{ d.headEmphasis }}</em> <span>{{ d.headTrail }}</span><br /><span>{{ d.headLine2 }}</span>
    </h2>

    <ol class="steps">
      <li
        v-for="(s, i) in steps"
        :key="s.title"
        class="step rise"
        :style="{ '--d': `${0.45 + i * 0.15}s` }"
      >
        <span class="step__num">{{ i + 1 }}</span>
        <span class="step__title">{{ s.title }}</span>
        <span class="step__desc">{{ s.desc }}</span>
      </li>
    </ol>

    <div class="launch rise" style="--d: 1.1s">
      <img src="/presentation/demo-qr.png" alt="" class="launch__qr" />
      <p class="url">
        <span>{{ d.web }}</span><span class="url__path">{{ d.webPath }}</span>
      </p>
    </div>
    <p class="kicker rise" style="--d: 1.3s">{{ d.kicker }}</p>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(1.2rem, 3vh, 2rem);
}

.pld-display em {
  font-style: normal;
  border-bottom: 4px solid var(--color-accent-2);
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 2.5rem);
  max-width: 72rem;
  text-align: left;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border-top: 1px solid var(--hairline-strong);
  padding-top: clamp(0.8rem, 1.8vh, 1.2rem);
}

.step__num {
  font-weight: 200;
  font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  line-height: 1;
  color: var(--color-text-tertiary);
}

.step__title {
  font-weight: 400;
  font-size: clamp(0.95rem, 1.5vw, 1.2rem);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.step__desc {
  font-weight: 300;
  font-size: clamp(0.75rem, 1.1vw, 0.95rem);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.launch {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2.5vw, 2.25rem);
}

/* Sized to the URL's cap height so the pair reads as one lockup. */
.launch__qr {
  width: clamp(4.5rem, 8vw, 7.5rem);
  aspect-ratio: 1;
  display: block;
}

.url {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.8rem, 4.5vw, 4rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.url__path {
  background: linear-gradient(
    90deg,
    var(--color-accent-warm),
    var(--color-accent-1),
    var(--color-accent-3)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 300;
}

.kicker {
  margin: 0;
  font-weight: 300;
  font-size: clamp(1rem, 1.7vw, 1.4rem);
  color: var(--color-text-secondary);
}

@media (max-aspect-ratio: 1/1) {
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
