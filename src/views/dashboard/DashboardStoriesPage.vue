<template>
  <div class="stories-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Stories</h1>
        <p class="text-sm text-secondary">Your completed pattern implementations</p>
      </div>
    </div>

    <!-- Content -->
    <div class="page-content">
      <div class="container">
        <div v-if="completedPlaybooks.length > 0" class="stories-grid">
          <div
            v-for="playbook in completedPlaybooks"
            :key="playbook.id"
            class="story-card"
          >
            <!-- Pattern Number -->
            <div class="story-number text-xs text-tertiary">
              Pattern {{ playbook.patternId }}
            </div>

            <!-- Title -->
            <h3 class="story-title">{{ playbook.patternTitle }}</h3>
            <div class="story-location text-sm text-secondary">{{ playbook.location }}</div>

            <!-- Dates -->
            <div class="story-timeline">
              <div class="timeline-item">
                <div class="text-xs text-tertiary">Started</div>
                <div class="text-sm">{{ formatDate(playbook.startDate) }}</div>
              </div>
              <div class="timeline-divider"></div>
              <div class="timeline-item">
                <div class="text-xs text-tertiary">Completed</div>
                <div class="text-sm">{{ formatDate(playbook.completedDate!) }}</div>
              </div>
            </div>

            <!-- Stats -->
            <div class="story-stats">
              <div class="stat-item">
                <div class="stat-value">{{ playbook.tasks.length }}</div>
                <div class="stat-label text-xs text-tertiary">Tasks</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getDuration(playbook) }}</div>
                <div class="stat-label text-xs text-tertiary">Duration</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playbook.resources.length }}</div>
                <div class="stat-label text-xs text-tertiary">Resources</div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="playbook.notes" class="story-notes">
              <div class="text-xs text-tertiary">Outcomes</div>
              <p class="text-sm">{{ playbook.notes }}</p>
            </div>

            <!-- Actions -->
            <div class="story-actions">
              <button class="action-btn text-xs">View Details</button>
              <button class="action-btn text-xs">Share</button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <h3>No completed stories yet</h3>
          <p class="text-secondary">Complete a playbook to create your first story</p>
          <button class="btn" @click="$router.push('/dashboard/playbooks')">
            View Playbooks
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'

const playbooksStore = usePlaybooksStore()
const completedPlaybooks = computed(() => playbooksStore.completedPlaybooks)

const getDuration = (playbook: any) => {
  const start = new Date(playbook.startDate)
  const end = new Date(playbook.completedDate!)
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays}d`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
  return `${Math.floor(diffDays / 365)}y`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.stories-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.page-content {
  padding: var(--spacing-lg) var(--spacing-md);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-md);
}

.story-card {
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  padding: var(--spacing-md);
  transition: border-color var(--transition-fast);
}

.story-card:hover {
  border-color: rgba(42, 42, 42, 0.15);
}

.story-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.story-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.story-location {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.story-timeline {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.timeline-item {
  flex: 1;
}

.timeline-item div:first-child {
  margin-bottom: 0.25rem;
}

.timeline-divider {
  width: 2rem;
  height: 1px;
  background: rgba(42, 42, 42, 0.15);
}

.story-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-sm);
  background: var(--color-bg-primary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.story-notes {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-bg-primary);
  border-left: 2px solid rgba(42, 42, 42, 0.15);
}

.story-notes div:first-child {
  margin-bottom: 0.5rem;
}

.story-notes p {
  line-height: 1.6;
}

.story-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: var(--spacing-md);
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
