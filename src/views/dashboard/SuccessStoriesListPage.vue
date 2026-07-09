<template>
  <div class="success-stories-page">
    <div class="page-header">
      <h1 class="page-title">Success Stories</h1>
      <p class="page-description text-secondary">
        Your community transformation stories, ready to inspire others.
      </p>
    </div>

    <LoadingState v-if="loading" message="Loading stories..." />

    <div v-else-if="stories.length === 0" class="empty-state">
      <p class="text-secondary">No success stories yet.</p>
      <p class="text-xs text-tertiary" style="margin-top: 1rem;">
        Complete a playbook and generate your first success story!
      </p>
      <router-link to="/dashboard/playbooks" class="btn" style="margin-top: 2rem;">
        View Playbooks
      </router-link>
    </div>

    <div v-else class="stories-grid">
      <router-link
        v-for="story in stories"
        :key="story.id"
        :to="`/dashboard/success-stories/${story.id}`"
        class="story-card"
        :style="{ backgroundColor: story.color || '#b8d4c8' }"
      >
        <div class="story-overlay"></div>
        <div class="story-content">
          <div class="story-meta">
            <span class="story-location text-xs">{{ story.location }}</span>
            <span 
              class="story-status text-xs" 
              :class="story.published ? 'status-published' : 'status-draft'"
            >
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
            <span v-if="story.patterns.length > 2" class="pattern-pill text-xs">
              +{{ story.patterns.length - 2 }} more
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LoadingState } from '@/components'
import { userStoriesApi } from '@/services/api'

const stories = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    stories.value = await userStoriesApi.getAll()
  } catch (error) {
    console.error('Failed to fetch success stories:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.success-stories-page {
  padding: 2rem;
}

.page-header {
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1.125rem;
  line-height: 1.7;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 6rem 2rem;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.story-card {
  position: relative;
  padding: 3rem 2.75rem;
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

/* Static inner hairline mat, museum-frame style */
.story-card::after {
  content: '';
  position: absolute;
  inset: 0.85rem;
  border: 1px solid rgba(42, 42, 42, 0.14);
  pointer-events: none;
}

.story-card:hover {
  box-shadow: 0 10px 28px rgba(42, 42, 42, 0.08);
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
}

.story-status {
  padding: 0.375rem 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
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
  font-size: 1.875rem;
  font-weight: var(--font-weight-light);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.story-problem {
  line-height: 1.6;
  color: var(--color-text-secondary);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>
