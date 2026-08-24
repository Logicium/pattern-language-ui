<script setup lang="ts">
const steps = [
  {
    title: 'Open the town',
    desc: 'ruralpatternlanguage.com → Cities → Cottonwood Springs.'
  },
  {
    title: 'Become a citizen',
    desc: 'Tap "Try it as a citizen" — no account, you\'ll get a citizen name like Willow Finch.'
  },
  {
    title: 'Choose your patterns',
    desc: 'Ask PAL for a three-pattern stack and let it merge them into one playbook.'
  },
  {
    title: 'Team up',
    desc: 'Trade citizen names with a neighbor and invite them onto your playbook.'
  }
]
</script>

<template>
  <div class="slide">
    <p class="pld-number rise" style="--d: 0.1s">09 &nbsp;·&nbsp; interactive — phones out</p>
    <h2 class="pld-display pld-display--xl rise" style="--d: 0.2s">
      Now <em>you</em> are the<br />Cottonwood Springs team.
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

    <p class="url rise" style="--d: 1.1s">
      ruralpatternlanguage.com<span class="url__path">/cities</span>
    </p>
    <p class="kicker rise" style="--d: 1.3s">Would you solve it the same way they did?</p>
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
