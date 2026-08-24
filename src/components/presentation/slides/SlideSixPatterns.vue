<script setup lang="ts">
const patterns = [
  {
    name: 'Community Anchor Point',
    desc: 'A visible place where relationships and activity can gather.',
    accent: 'var(--color-accent-1)'
  },
  {
    name: 'Youth Stay Pathways',
    desc: 'Make local futures visible before young people decide they must leave.',
    accent: 'var(--color-accent-2)'
  },
  {
    name: 'Main Street Reawakening',
    desc: 'Bring activity and experimentation back into downtown.',
    accent: 'var(--color-accent-3)'
  },
  {
    name: 'Regenerative Micro-Enterprise',
    desc: 'Help small local ventures start, test, and grow.',
    accent: 'var(--color-accent-warm)'
  },
  {
    name: 'Local Capacity Backbone',
    desc: 'Give coordination, ownership, and implementation a home.',
    accent: 'var(--color-accent-2)'
  },
  {
    name: 'Trust Infrastructure',
    desc: 'Create routines and structures that build trust through action.',
    accent: 'var(--color-accent-1)'
  }
]
</script>

<template>
  <div class="slide">
    <header class="head">
      <p class="pld-number rise" style="--d: 0.1s">06</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">Where would you start?</h2>
      <p class="pld-body rise" style="--d: 0.35s">Six patterns go on the table.</p>
    </header>

    <div class="grid">
      <article
        v-for="(p, i) in patterns"
        :key="p.name"
        class="card rise"
        :style="{ '--d': `${0.45 + i * 0.1}s`, '--accent': p.accent }"
      >
        <span class="card__dot" aria-hidden="true" />
        <h3 class="card__name">{{ p.name }}</h3>
        <p class="card__desc">{{ p.desc }}</p>
      </article>
    </div>

    <p class="kicker rise" style="--d: 1.2s">
      If you could choose only <em>three</em> — which would you start with?
    </p>
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
  gap: clamp(0.6rem, 1.6vh, 1.1rem);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2.2vw, 2rem);
}

.card {
  border-top: 1px solid var(--hairline-strong);
  padding-top: clamp(0.9rem, 2vh, 1.4rem);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 2.5rem;
  height: 3px;
  background: var(--accent);
}

.card__dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: var(--accent);
}

.card__name {
  margin: 0;
  font-weight: 300;
  font-size: clamp(1.05rem, 1.8vw, 1.5rem);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.card__desc {
  margin: 0;
  font-weight: 300;
  font-size: clamp(0.8rem, 1.15vw, 1rem);
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.kicker {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.3rem, 2.6vw, 2.25rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  border-left: 3px solid var(--color-accent-3);
  padding-left: clamp(1rem, 2vw, 1.75rem);
}

.kicker em {
  font-style: normal;
  border-bottom: 3px solid var(--color-accent-3);
}

@media (max-aspect-ratio: 1/1) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
