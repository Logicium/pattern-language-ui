<template>
  <section class="section search-section">
    <div class="container">
      <div class="search-bar">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search patterns by name or challenge..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="$emit('clear')" class="clear-btn text-xs">Clear</button>
      </div>

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
  background: var(--color-bg-primary);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.search-bar {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent-1);
  background: var(--color-bg-primary);
}

.search-input::placeholder { color: var(--color-text-tertiary); }

.clear-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color var(--transition-base);
}

.clear-btn:hover { color: var(--color-text-primary); }

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
