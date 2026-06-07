<template>
  <section class="dash-header gradient-bg">
    <div class="container">
      <div class="dash-header-row">
        <div class="dash-header-text">
          <h1 class="dash-title">{{ title }}</h1>
          <p v-if="subtitle" class="text-sm text-secondary dash-subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.actions" class="dash-header-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<style scoped>
.dash-header {
  padding: 3rem var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.dash-header .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.dash-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.dash-header-text { min-width: 0; }

.dash-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  color: var(--color-text-primary);
}

.dash-subtitle { margin: 0; }

.dash-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .dash-header { padding: 2.5rem var(--container-padding) 2rem; }
  .dash-title { font-size: 1.625rem; }

  .dash-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>
