<template>
  <div class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Summary</h2>
    </div>
    <!-- New format: structured summary -->
    <div v-if="playbook.summary" class="summary-content">
      <div class="summary-item">
        <h3 class="summary-label text-xs text-tertiary">THE PROBLEM</h3>
        <p class="text-secondary">{{ playbook.summary.problem }}</p>
      </div>
      <div class="summary-item">
        <h3 class="summary-label text-xs text-tertiary">OUR APPROACH</h3>
        <p class="text-secondary">{{ playbook.summary.approach }}</p>
      </div>
      <div class="summary-item">
        <h3 class="summary-label text-xs text-tertiary">SUCCESS IN 90 DAYS</h3>
        <p class="text-secondary">{{ playbook.summary.success90Days }}</p>
      </div>
    </div>
    <!-- Old format: simple solution text -->
    <div v-else class="solution-display">
      <p class="text-secondary">{{ playbook.solution }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playbook: any
}>()
</script>

<style scoped>
.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.solution-display {
  padding-top: 2.5rem;
}

.solution-display p {
  line-height: 1.8;
  font-size: 1rem;
}
</style>
