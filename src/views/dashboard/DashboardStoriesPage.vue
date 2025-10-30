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
              <h3 class="story-title">{{ playbook.patternTitle }}</h3>
              <div class="completion-badge text-xs">
                ✓ Complete
              </div>
            </div>

            <div class="story-location text-sm text-secondary">{{ playbook.location }}</div>

            <!-- Meta Info -->
            <div class="story-meta">
              <div class="meta-item text-xs text-tertiary">
                <span class="meta-label">Pattern</span>
                <span class="meta-value">{{ String(playbook.patternId).padStart(2, '0') }}</span>
              </div>
              <div class="meta-item text-xs text-tertiary">
                <span class="meta-label">Started</span>
                <span class="meta-value">{{ formatDate(playbook.startDate) }}</span>
              </div>
              <div class="meta-item text-xs text-tertiary">
                <span class="meta-label">Completed</span>
                <span class="meta-value">{{ formatDate(playbook.completedDate!) }}</span>
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
                VIEW DETAILS
              </router-link>
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
  background: var(--color-bg-secondary);
}

/* Header */
.page-header {
  padding: 3rem var(--container-padding);
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
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.story-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0;
  line-height: 1.3;
  flex: 1;
}

.completion-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(184, 212, 200, 0.15);
  color: var(--color-accent-2);
  border: 1px solid var(--color-accent-2);
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  flex-shrink: 0;
}

.story-location {
  margin-bottom: 1.5rem;
}

/* Meta */
.story-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  letter-spacing: 0.05em;
}

.meta-label {
  text-transform: uppercase;
  opacity: 0.6;
}

.meta-value {
  font-weight: var(--font-weight-medium);
}

/* Stats */
.story-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 0;
}

.stat-value {
  font-size: 2rem;
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
  border-left: 3px solid transparent;
  background-image: 
    linear-gradient(var(--color-bg-secondary), var(--color-bg-secondary)),
    linear-gradient(to bottom, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  background-origin: padding-box, border-box;
  background-clip: padding-box, border-box;
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
  display: inline-block;
  position: relative;
  z-index: 1;
}

.action-btn-primary::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1));
  background-size: 300% 100%;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: -1;
  animation: borderSwirl 3s linear infinite;
}

.action-btn-primary:hover::before {
  opacity: 1;
}

.action-btn-primary:hover {
  color: var(--color-bg-primary);
  border-color: transparent;
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
}
</style>
