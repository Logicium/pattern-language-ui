<template>
  <div class="stories-page">
    <!-- Header -->
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Stories</h1>
        <p class="text-sm text-secondary">Your completed pattern implementations and successes</p>
      </div>
    </section>

    <!-- Content -->
    <section class="page-content">
      <div class="container">
        <div v-if="completedPlaybooks.length > 0" class="stories-grid">
          <div
            v-for="(playbook, index) in completedPlaybooks"
            :key="playbook.id"
            class="story-card"
            :data-accent="(index % 3) + 1"
          >
            <!-- Pattern Number -->
            <div class="story-header">
              <div class="story-number text-xs text-tertiary">
                Pattern {{ String(playbook.patternId).padStart(2, '0') }}
              </div>
              <div class="completion-badge text-xs">
                ✓ Complete
              </div>
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
              <div class="timeline-arrow">→</div>
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
              <div class="notes-label text-xs text-tertiary">Outcomes & Learnings</div>
              <p class="text-sm">{{ playbook.notes }}</p>
            </div>

            <!-- Actions -->
            <div class="story-actions">
              <router-link :to="`/dashboard/playbooks/${playbook.id}`" class="action-btn-primary text-xs">
                View Details
              </router-link>
              <button class="action-btn-secondary text-xs">Share Story</button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">∅</div>
          <h3>No completed stories yet</h3>
          <p class="text-secondary">Complete a playbook to create your first success story</p>
          <button class="btn" @click="$router.push('/dashboard/playbooks')">
            View Active Playbooks
          </button>
        </div>
      </div>
    </section>
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

/* Header */
.page-header {
  padding: 3rem var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.page-header .container,
.page-content .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

/* Content */
.page-content {
  padding: 3rem var(--container-padding);
  background: var(--color-bg-secondary);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

/* Story Cards */
.story-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.story-card[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.story-card[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.story-card[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.story-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.completion-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(184, 212, 200, 0.15);
  color: var(--color-accent-2);
  border: 1px solid var(--color-accent-2);
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-medium);
}

.story-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.story-location {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

/* Timeline */
.story-timeline {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-item .text-xs {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline-arrow {
  color: var(--color-accent-2);
  font-size: 1.25rem;
  font-weight: var(--font-weight-light);
}

/* Stats */
.story-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.stat-item {
  text-align: center;
  padding: 1.25rem 0.75rem;
  background: var(--color-bg-secondary);
  transition: all var(--transition-base);
}

.stat-item:hover {
  background: rgba(184, 212, 200, 0.08);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
  color: var(--color-accent-2);
}

.stat-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Notes */
.story-notes {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-3);
}

.notes-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  display: block;
}

.story-notes p {
  line-height: 1.7;
}

/* Actions */
.story-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn-primary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.action-btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-text-primary);
  transform: translateY(100%);
  transition: transform var(--transition-base);
  z-index: -1;
}

.action-btn-primary:hover::before {
  transform: translateY(0);
}

.action-btn-primary:hover {
  color: var(--color-bg-primary);
}

.action-btn-secondary {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.action-btn-secondary:hover {
  border-color: var(--color-accent-3);
  color: var(--color-text-primary);
  background: rgba(201, 184, 232, 0.05);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 8rem 0;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-tertiary);
  margin-bottom: 2rem;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin-bottom: 2rem;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .stories-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem var(--container-padding);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stories-grid {
    grid-template-columns: 1fr;
  }

  .story-card {
    padding: 2rem;
  }

  .story-timeline {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .timeline-arrow {
    transform: rotate(90deg);
    align-self: center;
  }

  .story-actions {
    flex-direction: column;
  }
}
</style>
