<script setup lang="ts">
import AiAvatar from '@/components/AiAvatar.vue'
import { content } from '@/data/site'

const s = content.presentation.pal
</script>

<template>
  <div class="slide">
    <div class="intro">
      <p class="pld-number rise" style="--d: 0.1s">{{ s.num }}</p>
      <h2 class="pld-display pld-display--lg rise" style="--d: 0.2s">{{ s.heading }}</h2>
      <p class="pld-body rise" style="--d: 0.4s">
        <span>{{ s.bodyLead }}</span> <strong>{{ s.bodyStrong }}</strong
        ><span>{{ s.bodyTrail }}</span>
      </p>
      <div class="avatar rise" style="--d: 0.55s">
        <AiAvatar state="idle" />
      </div>
    </div>

    <div class="demo">
      <div class="bubble bubble--user rise" style="--d: 0.7s">
        {{ s.userBubble }}
      </div>
      <div class="bubble bubble--pal rise" style="--d: 1.05s">
        <span>{{ s.palLead }}</span> <strong>{{ s.palStrong }}</strong
        ><span>{{ s.palTrail }}</span>
      </div>
      <div class="playbook rise" style="--d: 1.45s">
        <p class="playbook__label">{{ s.playbookLabel }}</p>
        <h3 class="playbook__title">{{ s.playbookTitle }}</h3>
        <ul class="playbook__meta">
          <li v-for="m in s.playbookMeta" :key="m">{{ m }}</li>
        </ul>
        <div class="playbook__progress">
          <div class="playbook__fill" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 6rem);
}

.intro {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vh, 1.4rem);
}

.pld-body strong {
  color: var(--color-text-primary);
  font-weight: 400;
}

.avatar {
  width: clamp(6rem, 9vw, 9rem);
  aspect-ratio: 1;
  margin-top: clamp(0.5rem, 2vh, 1.5rem);
}

.demo {
  display: flex;
  flex-direction: column;
  gap: clamp(0.9rem, 2vh, 1.4rem);
}

.bubble {
  padding: clamp(0.9rem, 2vh, 1.3rem) clamp(1rem, 2vw, 1.5rem);
  font-weight: 300;
  font-size: clamp(0.9rem, 1.35vw, 1.15rem);
  line-height: 1.55;
  max-width: 85%;
}

.bubble--user {
  align-self: flex-end;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
}

.bubble--pal {
  align-self: flex-start;
  background: var(--color-bg-secondary);
  border: 1px solid var(--hairline-strong);
  color: var(--color-text-primary);
}

.bubble--pal strong {
  font-weight: 400;
}

.playbook {
  border: 1px solid var(--hairline-strong);
  border-top: 3px solid transparent;
  border-image: linear-gradient(
      90deg,
      var(--color-accent-1),
      var(--color-accent-2),
      var(--color-accent-3)
    )
    1;
  padding: clamp(1rem, 2.5vh, 1.5rem) clamp(1rem, 2vw, 1.5rem);
  background: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.playbook__label {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-tertiary);
}

.playbook__title {
  margin: 0;
  font-weight: 300;
  font-size: clamp(1.05rem, 1.7vw, 1.4rem);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.playbook__meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  font-size: clamp(0.75rem, 1.1vw, 0.9rem);
  font-weight: 300;
  color: var(--color-text-secondary);
}

.playbook__progress {
  height: 6px;
  background: var(--hairline);
  margin-top: 0.4rem;
  overflow: hidden;
}

.playbook__fill {
  height: 100%;
  width: 0;
  background: linear-gradient(
    90deg,
    var(--color-accent-1),
    var(--color-accent-2),
    var(--color-accent-3)
  );
  animation: fillIn 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  animation-delay: 2s;
}

@keyframes fillIn {
  to {
    width: 35%;
  }
}
</style>
