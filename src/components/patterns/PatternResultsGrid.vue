<template>
  <div v-if="patterns.length > 0" class="patterns-grid">
    <div
      v-for="(pattern, index) in patterns"
      :key="pattern.id"
      class="pattern-card"
      :data-accent="(index % 3) + 1"
    >
      <div class="pattern-header">
        <span class="pattern-id text-xs text-tertiary">
          {{ String(pattern.id).padStart(2, '0') }}
        </span>
      </div>
      <h3>{{ pattern.title }}</h3>
      <p class="text-sm text-secondary">{{ pattern.description }}</p>
      <div class="pattern-tags">
        <span
          v-for="addr in pattern.addresses"
          :key="addr"
          class="tag text-xs"
          @click="$emit('toggleFilter', addr)"
        >
          {{ addr }}
        </span>
      </div>
      <router-link :to="`/patterns/${pattern.id}`" class="learn-more text-xs">
        Learn More
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  patterns: any[]
}>()

defineEmits<{
  toggleFilter: [filter: string]
}>()
</script>

<style scoped>
.patterns-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.pattern-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.pattern-card[data-accent="1"] { border-left-color: var(--color-accent-1); }
.pattern-card[data-accent="2"] { border-left-color: var(--color-accent-2); }
.pattern-card[data-accent="3"] { border-left-color: var(--color-accent-3); }

.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.pattern-header { margin-bottom: 1rem; }
.pattern-id { letter-spacing: 0.1em; }

.pattern-card h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.pattern-card p {
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.pattern-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: rgba(42, 42, 42, 0.05);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
}

.learn-more {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  padding-bottom: 3px;
  border-bottom: 2px solid var(--color-text-primary);
  transition: color var(--transition-base);
  position: relative;
}

.learn-more::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1));
  background-size: 300% 100%;
  transition: width var(--transition-base);
  animation: borderSwirl 3s linear infinite;
}

.learn-more:hover { color: var(--color-accent-1); }
.learn-more:hover::after { width: 100%; }

@media (max-width: 1024px) {
  .patterns-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .patterns-grid { grid-template-columns: 1fr; }
}
</style>
