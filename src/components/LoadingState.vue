<template>
  <div class="loading-state" :class="{ compact }">
    <span class="loading-ring" aria-hidden="true"></span>
    <p v-if="message" class="loading-message text-xs text-tertiary">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
  compact?: boolean
}>(), {
  message: 'Loading...',
  compact: false
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 8rem 2rem;
  text-align: center;
}

.loading-state.compact {
  padding: 2.5rem 1rem;
}

.loading-ring {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(42, 42, 42, 0.08);
  border-top-color: var(--color-accent-1, #e8b4a0);
  animation: loading-spin 0.9s linear infinite;
}

.loading-state.compact .loading-ring {
  width: 24px;
  height: 24px;
}

.loading-message {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

@keyframes loading-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .loading-ring {
    animation-duration: 2s;
  }
}
</style>
