<script setup lang="ts">
const pillars = [
  {
    title: 'Patterns',
    accent: 'var(--color-accent-1)',
    desc: '50 proven approaches to rural regeneration — each with the problem it solves, the solution, and concrete implementation steps.'
  },
  {
    title: 'Stories',
    accent: 'var(--color-accent-2)',
    desc: 'Real towns, real outcomes. What communities tried, what worked, and what changed — so nobody starts from zero.'
  },
  {
    title: 'Cities',
    accent: 'var(--color-accent-3)',
    desc: 'A living map of the towns using the language — their challenges, their active patterns, and their progress.'
  }
]
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">02</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">
        ruralpatternlanguage.com
      </h2>
      <p class="pld-body rise" style="--d: 0.4s">
        We took the framework off the whiteboard and made it a platform — the same one that
        sparked the hackathon ideas, now open to any community.
      </p>
    </header>

    <div class="pillars">
      <article
        v-for="(p, i) in pillars"
        :key="p.title"
        class="pillar rise"
        :style="{ '--d': `${0.55 + i * 0.15}s`, '--accent': p.accent }"
      >
        <span class="pillar__dot" aria-hidden="true" />
        <h3 class="pillar__title">{{ p.title }}</h3>
        <p class="pillar__desc">{{ p.desc }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(2rem, 6vh, 4rem);
}

.head {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vh, 1.4rem);
}

.pillars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 4rem);
}

.pillar {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  border-top: 1px solid var(--hairline-strong);
  padding-top: clamp(1rem, 2.5vh, 1.75rem);
  position: relative;
}

.pillar::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 3rem;
  height: 3px;
  background: var(--accent);
}

.pillar__dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--accent);
}

.pillar__title {
  font-weight: 200;
  font-size: clamp(1.5rem, 2.6vw, 2.25rem);
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-text-primary);
}

.pillar__desc {
  font-weight: 300;
  font-size: clamp(0.9rem, 1.3vw, 1.1rem);
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
