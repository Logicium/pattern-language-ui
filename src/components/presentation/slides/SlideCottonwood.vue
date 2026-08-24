<script setup lang="ts">
const stats = [
  { value: '11,200', label: 'city population' },
  { value: '51', label: 'median age' },
  { value: '$53K', label: 'median household income' },
  { value: '24%', label: 'downtown vacancy' },
  { value: '68%', label: 'of seniors expect to leave' },
  { value: '70%', label: "of employers can't hire" }
]
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">
        05 &nbsp;·&nbsp; <span class="demo-tag">a fictional town, built for this workshop</span>
      </p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">
        Meet Cottonwood Springs, Colorado
      </h2>
    </header>

    <div class="body">
      <div class="left">
        <div class="stats">
          <div
            v-for="(s, i) in stats"
            :key="s.label"
            class="stat rise"
            :style="{ '--d': `${0.4 + i * 0.08}s` }"
          >
            <span class="stat__value">{{ s.value }}</span>
            <span class="stat__label">{{ s.label }}</span>
          </div>
        </div>

        <blockquote class="quote rise" style="--d: 1s">
          "We have ideas. We just don't seem to get them across the finish line."
        </blockquote>
      </div>

      <div class="right rise" style="--d: 0.6s">
        <img src="/demo/cottonwood-springs.svg" alt="" class="illustration" />
        <p class="kicker rise" style="--d: 1.25s">
          Question to the room: what is Cottonwood Springs'
          <em>real</em> problem?
        </p>
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
  gap: clamp(1.75rem, 4vh, 3rem);
}

.head {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vh, 1.4rem);
}

.demo-tag {
  border: 1px solid var(--color-accent-3);
  background: color-mix(in srgb, var(--color-accent-3) 18%, transparent);
  color: var(--color-text-secondary);
  padding: 0.2rem 0.6rem;
  letter-spacing: 0.14em;
}

.body {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--hairline-strong);
  border-left: 1px solid var(--hairline-strong);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: clamp(0.9rem, 2.2vh, 1.5rem) clamp(0.9rem, 1.8vw, 1.5rem);
  border-right: 1px solid var(--hairline-strong);
  border-bottom: 1px solid var(--hairline-strong);
}

.stat__value {
  font-weight: 200;
  font-size: clamp(1.6rem, 3.2vw, 2.9rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.stat__label {
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  color: var(--color-text-secondary);
  font-weight: 300;
}

.quote {
  margin: clamp(1.25rem, 3vh, 2rem) 0 0;
  font-weight: 300;
  font-style: italic;
  font-size: clamp(1.1rem, 1.9vw, 1.55rem);
  color: var(--color-text-secondary);
  border-left: 3px solid var(--color-accent-1);
  padding-left: clamp(1rem, 2vw, 1.5rem);
  max-width: 46ch;
}

.right {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vh, 1.75rem);
}

.illustration {
  width: 100%;
  border: 1px solid var(--hairline);
  display: block;
}

.kicker {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.2rem, 2.2vw, 1.9rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.kicker em {
  font-style: normal;
  border-bottom: 3px solid var(--color-accent-warm);
}

@media (max-aspect-ratio: 1/1) {
  .body {
    grid-template-columns: 1fr;
  }
}
</style>
