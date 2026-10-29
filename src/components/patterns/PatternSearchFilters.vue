<template>
  <section class="section search-section">
    <div class="container">
      <SearchBar
        :model-value="searchQuery"
        placeholder="Search patterns by name or challenge..."
        class="search"
        @update:model-value="(v: string) => (v ? $emit('update:searchQuery', v) : $emit('clear'))"
      />

      <div v-if="activeFilters.length > 0" class="active-filters">
        <span class="text-xs text-tertiary">Filtering by:</span>
        <button
          v-for="filter in activeFilters"
          :key="filter"
          @click="$emit('remove', filter)"
          class="filter-tag text-xs"
        >
          {{ filter }} ×
        </button>
      </div>

      <div class="filter-section">
        <span class="text-xs text-tertiary">Common Challenges:</span>
        <div class="filter-buttons">
          <button
            v-for="challenge in commonChallenges"
            :key="challenge"
            @click="$emit('toggle', challenge)"
            class="filter-btn text-xs"
            :class="{ active: activeFilters.includes(challenge) }"
          >
            {{ challenge }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SearchBar from '@/components/SearchBar.vue'

defineProps<{
  searchQuery: string
  activeFilters: string[]
  commonChallenges: string[]
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  clear: []
  toggle: [filter: string]
  remove: [filter: string]
}>()
</script>

<style scoped>
.search-section {
  padding-bottom: 4rem;
  background: var(--color-bg-primary);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.search {
  margin-bottom: 2rem;
}

.active-filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 0.5rem 1rem;
  background: var(--color-accent-1);
  color: var(--color-bg-primary);
  border: none;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
}

.filter-tag:hover { background: var(--color-accent-warm); }

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
}

.filter-btn:hover {
  border-color: var(--color-accent-1);
  color: var(--color-text-primary);
}

.filter-btn.active {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .filter-buttons {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
