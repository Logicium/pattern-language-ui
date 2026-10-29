<template>
  <section class="panel how" aria-labelledby="how-title">
    <div class="panel__in">
      <h2 id="how-title" class="panel__title">From a problem to a plan in one sitting.</h2>
      <ol class="steps">
        <li v-for="s in steps" :key="s.num" class="step">
          <span class="step__num">{{ s.num }}</span>
          <h3 class="step__name">{{ s.name }}</h3>
          <p class="step__text">{{ s.text }}</p>
        </li>
      </ol>
      <router-link to="/demo" class="how__go">
        Try it with your town
        <span class="how__arrow" aria-hidden="true">→</span>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
/** The home page's third panel: the method, in three moves. */
const steps = [
  {
    num: '01',
    name: 'Name what must stay true.',
    text: 'Start with the wicked problem your town can’t stop talking about: the young people leaving, the main street going dark, the clinic that closed.'
  },
  {
    num: '02',
    name: 'Stack the patterns.',
    text: 'Choose the three that fit. For each one, PAL shows what it did in a town like yours, and what it took to get there.'
  },
  {
    num: '03',
    name: 'Leave with the first 90 days.',
    text: 'A playbook with a date and a name on every line, and the people to do it with. Then come back and tell us what happened.'
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
  max-width: 14ch;
  margin: 0 0 4rem;
  font-size: clamp(2.4rem, 1rem + 3.8vw, 4.6rem);
  font-weight: var(--font-weight-light);
  line-height: 1.02;
  letter-spacing: -0.04em;
}
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 3rem;
  border-top: 1px solid var(--hairline-strong);
}
.step {
  padding-top: 1.6rem;
}
.step__num {
  display: block;
  margin-bottom: 2.2rem;
  font-size: 2.6rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}
.step__name {
  margin: 0 0 0.7rem;
  font-size: 1.45rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.step__text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-text-secondary);
}
.how__go {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 4rem;
  padding: 0.95rem 1.5rem;
  border: 1px solid var(--color-text-primary);
  font-size: 0.86rem;
  letter-spacing: 0.03em;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background 0.35s ease, color 0.35s ease;
}
.how__go:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}
.how__arrow {
  display: inline-block;
  transition: transform 0.35s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.how__go:hover .how__arrow {
  transform: translateX(4px);
}
@media (max-width: 900px) {
  .steps {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
  .step {
    padding: 1.6rem 0;
    border-bottom: 1px solid var(--hairline-strong);
  }
  .step__num {
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }
}
@media (max-width: 767px) {
  .panel {
    min-height: 0;
    padding: 6rem var(--container-padding);
  }
  .panel__title {
    margin-bottom: 2.5rem;
  }
  .how__go {
    margin-top: 2.5rem;
  }
}
</style>
