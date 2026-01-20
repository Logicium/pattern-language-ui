<template>
  <section class="section patterns-section">
    <div class="container">
      <div class="section-header">
        <span class="section-number">01</span>
        <h2 class="section-title">Featured Patterns</h2>
      </div>

      <div class="patterns-grid">
        <router-link
          v-for="(pattern, index) in patterns"
          :key="pattern.id"
          :to="`/patterns/${pattern.id}`"
          class="pattern-item"
          :data-accent="(index % 3) + 1"
        >
          <div class="pattern-number text-sm text-secondary">
            {{ String(index + 1).padStart(2, '0') }}
          </div>
          <div class="pattern-content">
            <h3>{{ pattern.title }}</h3>
            <p class="text-sm text-secondary">{{ pattern.description }}</p>
            <div class="pattern-tags">
              <span v-for="addr in pattern.addresses" :key="addr" class="tag text-xs">
                {{ addr }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePatterns } from '@/composables/usePatterns'

const { patterns: allPatterns, loading } = usePatterns()
const patterns = computed(() => allPatterns.value.slice(0, 6))
</script>

<style scoped>
.patterns-section {
  background: var(--color-bg-primary);
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: rgba(42, 42, 42, 0.1);
  border: 1px solid rgba(42, 42, 42, 0.1);
}

.pattern-item {
  background: var(--color-bg-primary);
  padding: 3rem;
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 2rem;
  transition: all var(--transition-base);
  position: relative;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.pattern-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 0;
  transition: height var(--transition-base);
}

.pattern-item[data-accent="1"]::before { background: var(--color-accent-1); }
.pattern-item[data-accent="2"]::before { background: var(--color-accent-2); }
.pattern-item[data-accent="3"]::before { background: var(--color-accent-3); }

.pattern-item:hover {
  background: var(--color-bg-secondary);
}

.pattern-item:hover::before {
  height: 100%;
}

.pattern-number {
  padding-top: 0.25rem;
}

.pattern-content h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.pattern-content p {
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
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  transition: all var(--transition-fast);
}

.pattern-item[data-accent="1"] .tag {
  background: rgba(232, 180, 160, 0.1);
  border-color: var(--color-accent-1);
}

.pattern-item[data-accent="2"] .tag {
  background: rgba(184, 212, 200, 0.1);
  border-color: var(--color-accent-2);
}

.pattern-item[data-accent="3"] .tag {
  background: rgba(201, 184, 232, 0.1);
  border-color: var(--color-accent-3);
}

@media (max-width: 1024px) {
  .patterns-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pattern-item {
    padding: 2rem;
    grid-template-columns: 40px 1fr;
    gap: 1rem;
  }
}
</style>
