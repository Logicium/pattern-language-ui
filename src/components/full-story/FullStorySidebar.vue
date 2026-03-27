<template>
  <aside class="sidebar">
    <div v-if="relatedStories.length > 0" class="sidebar-block">
      <h3 class="sidebar-title text-sm">Related Stories</h3>
      <div class="related-list">
        <router-link
          v-for="relatedStory in relatedStories"
          :key="relatedStory.id"
          :to="`/stories/${relatedStory.id}`"
          class="related-link text-sm"
        >
          {{ relatedStory.title }}
        </router-link>
      </div>
    </div>

    <div class="sidebar-block">
      <h3 class="sidebar-title text-sm">Get Started</h3>
      <p class="text-xs text-tertiary" style="line-height: 1.7; margin-bottom: 1rem;">
        Want to replicate this success in your community?
      </p>
      <router-link to="/signup" class="btn" style="width: 100%;">
        Join Community
      </router-link>
    </div>

    <div class="sidebar-block">
      <h3 class="sidebar-title text-sm">Explore</h3>
      <div class="explore-links">
        <router-link to="/stories" class="explore-link text-xs">← All Stories</router-link>
        <router-link to="/patterns" class="explore-link text-xs">Pattern Library →</router-link>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  relatedStories: any[]
}>()
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
  gap: 0.75rem;
}

.explore-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color var(--transition-base);
  letter-spacing: 0.05em;
}

.explore-link:hover { color: var(--color-text-primary); }

@media (max-width: 1024px) {
  .sidebar { position: static; }
}

@media (max-width: 768px) {
  .sidebar-block { padding: 1.5rem; }
}
</style>
