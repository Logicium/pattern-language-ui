<template>
  <router-link
    :to="`/dashboard/success-stories/${story.id}`"
    :class="['story-card', story.published ? 'published-card' : 'draft-card']"
    :style="{ backgroundColor: story.color || '#b8d4c8' }"
  >
    <div class="story-overlay"></div>
    <div class="story-content">
      <div class="story-meta">
        <span class="story-location text-xs">{{ story.location }}</span>
        <span :class="['story-status text-xs', story.published ? 'status-published' : 'status-draft']">
          {{ story.published ? 'Published' : 'Draft' }}
        </span>
      </div>
      <h2 class="story-title">{{ story.title }}</h2>
      <p class="story-problem text-sm">{{ story.problem }}</p>
      <div v-if="story.patterns && story.patterns.length > 0" class="story-patterns">
        <span
          v-for="pattern in story.patterns.slice(0, 2)"
          :key="pattern"
          class="pattern-pill text-xs"
        >
          {{ pattern }}
        </span>
      </div>
      <div v-if="story.published && story.publishedDate" class="publish-date text-xs text-tertiary">
        Published {{ formatDate(story.publishedDate) }}
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  story: any
  formatDate: (dateString: string) => string
}>()
</script>

<style scoped>
.story-card {
  position: relative;
  padding: 3rem 2rem;
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
  transition: transform var(--transition-base);
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-overlay {
  position: absolute;
  inset: 0;
  background: rgba(42, 42, 42, 0.05);
  mix-blend-mode: multiply;
}

.story-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.story-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.story-location {
  padding: 0.375rem 0.75rem;
  background: rgba(253, 251, 247, 0.95);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.story-status {
  padding: 0.375rem 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  font-size: 0.75rem;
}

.status-published {
  background: rgba(184, 212, 200, 0.95);
  color: var(--color-text-primary);
}

.status-draft {
  background: rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
}

.story-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
  color: #2a2a2a;
}

.story-problem {
  line-height: 1.6;
  color: #2a2a2a;
  flex: 1;
}

.story-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pattern-pill {
  padding: 0.375rem 0.75rem;
  background: rgba(253, 251, 247, 0.9);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  color: #2a2a2a;
}

.publish-date {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(42, 42, 42, 0.1);
  color: #2a2a2a;
}
</style>
