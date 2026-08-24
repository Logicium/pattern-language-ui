<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.offer
</script>

<template>
  <div class="slide">
    <h2 class="pld-display pld-display--xl rise" style="--d: 0.15s">
      {{ s.heading }}
    </h2>
    <p class="pld-body center rise" style="--d: 0.4s">
      <span>{{ s.bodyLead }}</span> <em>{{ s.bodyEmphasis }}</em> <span>{{ s.bodyTrail }}</span>
    </p>
    <p class="url rise" style="--d: 0.65s">
      <span>{{ s.web }}</span><span class="url__path">{{ s.webPath }}</span>
    </p>
    <div class="pld-accent-line rise" style="--d: 0.9s" />
    <p class="small rise" style="--d: 1.05s">{{ s.small }}</p>
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

.center {
  max-width: 52ch;
}

.pld-body em {
  font-style: normal;
  color: var(--color-text-primary);
  font-weight: 400;
  border-bottom: 3px solid var(--color-accent-2);
}

.url {
  margin: 0;
  font-weight: 200;
  font-size: clamp(2rem, 5vw, 4.5rem);
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

.small {
  margin: 0;
  font-size: clamp(0.8rem, 1.1vw, 0.95rem);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 300;
  color: var(--color-text-tertiary);
}
</style>
