<template>
  <div class="playbooks-page">
    <!-- Header -->
    <section class="page-header gradient-bg">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Playbooks</h1>
            <p class="text-sm text-secondary">Track your pattern implementation journey</p>
          </div>
          <button class="btn">New Playbook</button>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <section class="tabs-section">
      <div class="container">
        <div class="tabs">
          <button
            :class="['tab text-xs', { active: activeTab === 'active' }]"
            @click="activeTab = 'active'"
          >
            Active ({{ activePlaybooks.length }})
          </button>
          <button
            :class="['tab text-xs', { active: activeTab === 'completed' }]"
            @click="activeTab = 'completed'"
          >
            Completed ({{ completedPlaybooks.length }})
          </button>
          <button
            :class="['tab text-xs', { active: activeTab === 'paused' }]"
            @click="activeTab = 'paused'"
          >
            Paused ({{ pausedPlaybooks.length }})
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="section page-content">
      <div class="container">
        <div v-if="filteredPlaybooks.length > 0" class="playbooks-grid">
          <div
            v-for="(playbook, index) in filteredPlaybooks"
            :key="playbook.id"
            class="playbook-card"
            :data-accent="(index % 3) + 1"
          >
            <!-- Header -->
            <div class="card-header">
              <div class="pattern-number text-xs text-tertiary">
                Pattern {{ String(playbook.patternId).padStart(2, '0') }}
              </div>
              <div class="progress-badge text-xs">
                {{ playbook.progress }}%
              </div>
            </div>

            <h3 class="card-title">{{ playbook.patternTitle }}</h3>
            
            <div class="card-location text-sm text-secondary">
              {{ playbook.location }}
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${playbook.progress}%` }"
                  :data-accent="(index % 3) + 1"
                ></div>
              </div>
              <div class="progress-label text-xs text-tertiary">
                {{ completedTasksCount(playbook) }} of {{ playbook.tasks.length }} tasks complete
              </div>
            </div>

            <!-- Quick Info -->
            <div class="card-info">
              <div class="info-item">
                <span class="text-xs text-tertiary">Challenge</span>
                <span class="text-sm">{{ playbook.challenge }}</span>
              </div>
              <div class="info-item">
                <span class="text-xs text-tertiary">Target Date</span>
                <span class="text-sm">{{ formatDate(playbook.targetCompletionDate) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <router-link :to="`/dashboard/playbooks/${playbook.id}`" class="btn action-btn-primary">
                View Details
              </router-link>
              <button class="action-btn text-xs">
                {{ playbook.status === 'paused' ? 'Resume' : 'Pause' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">∅</div>
          <h3>No {{ activeTab }} playbooks</h3>
          <p class="text-secondary">Start tracking your pattern implementations</p>
          <button class="btn btn-lg">Create Playbook</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'

const playbooksStore = usePlaybooksStore()

const activeTab = ref<'active' | 'completed' | 'paused'>('active')
const expandedPlaybooks = ref(new Set<string>())

const activePlaybooks = computed(() => playbooksStore.activePlaybooks)
const completedPlaybooks = computed(() => playbooksStore.completedPlaybooks)
const pausedPlaybooks = computed(() => playbooksStore.pausedPlaybooks)

const filteredPlaybooks = computed(() => {
  switch (activeTab.value) {
    case 'active':
      return activePlaybooks.value
    case 'completed':
      return completedPlaybooks.value
    case 'paused':
      return pausedPlaybooks.value
    default:
      return []
  }
})

const completedTasksCount = (playbook: any) => {
  return playbook.tasks.filter((t: any) => t.completed).length
}

const toggleTasks = (playbookId: string) => {
  if (expandedPlaybooks.value.has(playbookId)) {
    expandedPlaybooks.value.delete(playbookId)
  } else {
    expandedPlaybooks.value.add(playbookId)
  }
}

const toggleTask = (playbookId: string, taskId: string) => {
  playbooksStore.toggleTaskCompletion(playbookId, taskId)
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
.playbooks-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Header */
.page-header {
  padding: 3rem var(--container-padding);
  background: linear-gradient(135deg,
    rgba(232, 180, 160, 0.05) 0%,
    rgba(184, 212, 200, 0.05) 50%,
    rgba(201, 184, 232, 0.05) 100%);
}

.page-header .container,
.page-content .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

/* Tabs */
.tabs-section {
  background: var(--color-bg-primary);
  padding: 0 var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.tabs-section .container {
  padding: 0;
}

.tabs {
  display: flex;
  gap: 3rem;
  max-width: var(--container-max);
  margin: 0 auto;
}

.tab {
  padding: 1.25rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent-1);
}

/* Content */
.page-content {
  padding: 3rem var(--container-padding);
  background: var(--color-bg-secondary);
}

.playbooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

/* Playbook Card */
.playbook-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.playbook-card[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.playbook-card[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.playbook-card[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.playbook-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.pattern-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.progress-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(42, 42, 42, 0.05);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-medium);
}

.card-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.card-location {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

/* Progress */
.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 3px;
  background: rgba(42, 42, 42, 0.08);
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width var(--transition-base);
}

.progress-fill[data-accent="1"] {
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-warm));
}

.progress-fill[data-accent="2"] {
  background: linear-gradient(90deg, var(--color-accent-2), #9dc4b5);
}

.progress-fill[data-accent="3"] {
  background: linear-gradient(90deg, var(--color-accent-3), #b5a0d8);
}

.progress-label {
  letter-spacing: 0.05em;
}

/* Card Info */
.card-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.info-item .text-xs {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn-primary {
  flex: 1;
  text-align: center;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1.25rem;
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

.action-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.02);
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
  .playbooks-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs {
    gap: 1.5rem;
  }

  .playbooks-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
