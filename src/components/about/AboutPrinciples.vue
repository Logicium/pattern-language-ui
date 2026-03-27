<template>
  <section class="section principles-section">
    <div class="container">
      <h2 class="section-title mb-md">How We Work</h2>
      <div class="principles-grid">
        <div v-for="principle in principles" :key="principle.id" class="principle-card">
          <div class="principle-number text-xs text-tertiary">
            {{ String(principle.id).padStart(2, '0') }}
          </div>
          <h3>{{ principle.title }}</h3>
          <p class="text-sm text-secondary">{{ principle.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { principles } from '@/utils/data'
</script>

<style scoped>
.principles-section {
  background: var(--color-bg-secondary);
}

.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
}

.principle-card {
  padding: 3rem;
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-1);
  transition: all var(--transition-base);
}

.principle-card:nth-child(2) { border-left-color: var(--color-accent-2); }
.principle-card:nth-child(3) { border-left-color: var(--color-accent-3); }
.principle-card:nth-child(4) { border-left-color: var(--color-accent-1); }

.principle-card:hover {
  transform: translateX(8px);
}

.principle-number {
  display: block;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.principle-card h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.principle-card p { line-height: 1.7; }

@media (max-width: 1024px) {
  .principles-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
