<template>
  <div class="main-content">
    <div v-if="pattern.problem" class="content-block">
      <h2 class="section-subtitle">Problem</h2>
      <p class="text-secondary">{{ pattern.problem }}</p>
    </div>

    <div v-if="pattern.context" class="content-block">
      <h2 class="section-subtitle">Context</h2>
      <p class="text-secondary">{{ pattern.context }}</p>
    </div>

    <div v-if="pattern.solution" class="content-block">
      <h2 class="section-subtitle">Solution</h2>
      <p class="text-secondary">{{ pattern.solution }}</p>
    </div>

    <div v-if="pattern.implementation && pattern.implementation.length > 0" class="content-block">
      <h2 class="section-subtitle">Implementation Suggestions</h2>
      <ul class="implementation-list">
        <li
          v-for="(item, index) in pattern.implementation"
          :key="index"
          class="text-sm text-secondary"
        >
          {{ item }}
        </li>
      </ul>
    </div>

    <div v-if="pattern.examples && pattern.examples.length > 0" class="content-block">
      <h2 class="section-subtitle">Real-World Examples</h2>
      <div class="examples-grid">
        <div
          v-for="(example, index) in pattern.examples"
          :key="index"
          class="example-card"
        >
          <p class="text-sm text-secondary">{{ example }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pattern: any
}>()
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.content-block {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.section-subtitle {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.content-block p { line-height: 1.8; }

.implementation-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.implementation-list li {
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.7;
}

.implementation-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-accent-1);
}

.examples-grid {
  display: grid;
  gap: 1.5rem;
}

.example-card {
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-2);
}

.example-card p { line-height: 1.7; }

@media (max-width: 768px) {
  .content-block { padding: 2rem; }
}
</style>
