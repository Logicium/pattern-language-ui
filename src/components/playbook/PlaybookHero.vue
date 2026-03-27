<template>
  <section class="playbook-hero gradient-bg">
    <div class="container">
      <div class="hero-meta">
        <span class="pattern-number text-xs text-tertiary">Pattern {{ String(playbook.patternId).padStart(2, '0') }}</span>
        <span 
          class="status-badge text-xs" 
          :class="`status-${playbook.status}`"
        >
          {{ playbook.status }}
        </span>
      </div>
      <h1 class="hero-title">{{ playbook.patternTitle }}</h1>
      <p class="hero-location text-secondary">
        {{ playbook.location }}
      </p>
      <div class="hero-progress">
        <div class="progress-info">
          <span class="progress-percentage">{{ playbook.progress }}%</span>
          <span class="text-xs text-tertiary">Complete</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="{ 'progress-complete': playbook.progress >= 100 }"
            :style="{ 
              width: `${playbook.progress}%`,
              backgroundSize: playbook.progress >= 100 ? '200% 100%' : `${100 / (playbook.progress || 1) * 100}% 100%`
            }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  playbook: any
}>()
</script>

<style scoped>
.playbook-hero {
  padding: 4rem 0;
}

.hero-meta {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.pattern-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.hero-location {
  font-size: 1.25rem;
  line-height: 1.7;
  margin-bottom: 3rem;
}

.hero-progress {
  max-width: 600px;
}

@media (max-width: 768px) {
  .playbook-hero {
    padding: 3rem 0;
  }
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-location {
    font-size: 1rem;
  }
}
</style>
