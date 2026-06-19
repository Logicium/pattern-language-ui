<template>
  <aside class="sidebar">
    <div v-if="pattern.relatedPatterns && pattern.relatedPatterns.length > 0" class="sidebar-block">
      <h3 class="sidebar-title text-sm">Related Patterns</h3>
      <div class="related-list">
        <router-link
          v-for="relatedTitle in pattern.relatedPatterns"
          :key="relatedTitle"
          :to="getPatternRoute(relatedTitle)"
          class="related-link text-sm"
        >
          {{ relatedTitle }}
        </router-link>
      </div>
    </div>

    <div v-if="!isAuthenticated" class="sidebar-block">
      <h3 class="sidebar-title text-sm">Start Here</h3>
      <p class="text-xs text-tertiary" style="line-height: 1.7; margin-bottom: 1rem;">
        Ready to implement this pattern in your community?
      </p>
      <router-link to="/signup" class="btn" style="width: 100%;">Create Profile</router-link>
    </div>

    <div v-if="prevPattern || nextPattern" class="sidebar-block">
      <h3 class="sidebar-title text-sm">Explore More</h3>
      <div class="explore-links">
        <router-link
          v-if="prevPattern"
          :to="`/patterns/${prevPattern.id}`"
          class="explore-link"
        >
          <span class="explore-dir text-xs text-tertiary"><span class="chevron chevron--back"></span> Previous</span>
          <span class="explore-title text-sm">{{ prevPattern.title }}</span>
        </router-link>
        <router-link
          v-if="nextPattern"
          :to="`/patterns/${nextPattern.id}`"
          class="explore-link explore-link--next"
        >
          <span class="explore-dir text-xs text-tertiary">Next <span class="chevron"></span></span>
          <span class="explore-title text-sm">{{ nextPattern.title }}</span>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  pattern: any
  getPatternRoute: (title: string) => string
  prevPattern?: any | null
  nextPattern?: any | null
}>()

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-self: start;
  position: sticky;
  top: 6rem;
}

.sidebar-block {
  background: var(--color-bg-primary);
  padding: 2rem;
}

.sidebar-block .btn { text-decoration: none; }

.sidebar-title {
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.related-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.75rem;
  transition: all var(--transition-base);
  border-left: 2px solid transparent;
}

.related-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border-left-color: var(--color-accent-1);
  padding-left: 1rem;
}

.explore-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.explore-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-left: 2px solid transparent;
  transition: all var(--transition-base);
}

.explore-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border-left-color: var(--color-accent-1);
}

.explore-link--next {
  align-items: flex-end;
  text-align: right;
  border-left: none;
  border-right: 2px solid transparent;
}

.explore-link--next:hover {
  border-right-color: var(--color-accent-2);
  border-left-color: transparent;
}

.explore-dir {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.explore-title {
  font-weight: var(--font-weight-medium);
  line-height: 1.3;
}

@media (max-width: 1024px) {
  .sidebar { position: static; }
}

@media (max-width: 768px) {
  .sidebar-block { padding: 1.5rem; }
}
</style>
