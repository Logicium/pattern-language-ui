<template>
  <div class="playbooks-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-top">
          <div>
            <h1 class="page-title">Playbooks</h1>
            <p class="text-sm text-secondary">Track your pattern implementation</p>
          </div>
          <button class="btn">New Playbook</button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
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
    </div>

    <!-- Content -->
    <div class="page-content">
      <div class="container">
        <div v-if="filteredPlaybooks.length > 0" class="playbooks-list">
          <div
            v-for="playbook in filteredPlaybooks"
            :key="playbook.id"
            class="playbook-card"
          >
            <!-- Header -->
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">{{ playbook.patternTitle }}</h3>
                <div class="card-meta text-xs text-tertiary">
                  {{ playbook.location }} · {{ playbook.challenge }}
                </div>
              </div>
              <div class="card-status text-xs text-tertiary">
                {{ playbook.progress }}%
              </div>
            </div>

            <!-- Progress -->
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${playbook.progress}%` }"></div>
            </div>

            <!-- Details -->
            <div class="card-details">
              <div class="detail-row">
                <span class="text-xs text-tertiary">Challenge</span>
                <span class="text-sm">{{ playbook.challenge }}</span>
              </div>
              <div class="detail-row">
                <span class="text-xs text-tertiary">Solution</span>
                <span class="text-sm">{{ playbook.solution }}</span>
              </div>
              <div class="detail-row">
                <span class="text-xs text-tertiary">Target Date</span>
                <span class="text-sm">{{ formatDate(playbook.targetCompletionDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="text-xs text-tertiary">Tasks</span>
                <span class="text-sm">{{ completedTasksCount(playbook) }} / {{ playbook.tasks.length }}</span>
              </div>
            </div>

            <!-- Tasks Toggle -->
            <button
              class="tasks-toggle text-xs"
              @click="toggleTasks(playbook.id)"
            >
              {{ expandedPlaybooks.has(playbook.id) ? 'Hide' : 'Show' }} Tasks
            </button>

            <!-- Tasks List (Expanded) -->
            <div v-if="expandedPlaybooks.has(playbook.id)" class="tasks-list">
              <div
                v-for="task in playbook.tasks"
                :key="task.id"
                class="task-item"
              >
                <label class="task-label">
                  <input
                    type="checkbox"
                    :checked="task.completed"
                    @change="toggleTask(playbook.id, task.id)"
                    class="task-checkbox"
                  />
                  <div class="task-content">
                    <div class="task-title text-sm" :class="{ completed: task.completed }">
                      {{ task.title }}
                    </div>
                    <div class="task-meta text-xs text-tertiary">
                      Due {{ formatDate(task.dueDate) }}
                      <span v-if="task.completedDate"> · Completed {{ formatDate(task.completedDate) }}</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <button class="action-btn text-xs">View Details</button>
              <button class="action-btn text-xs">Edit</button>
              <button class="action-btn text-xs">
                {{ playbook.status === 'paused' ? 'Resume' : 'Pause' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <h3>No {{ activeTab }} playbooks</h3>
          <p class="text-secondary">Start tracking your pattern implementations</p>
          <button class="btn">Create Playbook</button>
        </div>
      </div>
    </div>
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

.page-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

/* Tabs */
.tabs-section {
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.tabs {
  display: flex;
  gap: var(--spacing-md);
}

.tab {
  padding: var(--spacing-sm) 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

/* Content */
.page-content {
  padding: var(--spacing-lg) var(--spacing-md);
}

.playbooks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Playbook Card */
.playbook-card {
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  padding: var(--spacing-md);
  transition: border-color var(--transition-fast);
}

.playbook-card:hover {
  border-color: rgba(42, 42, 42, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
  gap: var(--spacing-sm);
}

.card-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.card-meta {
  letter-spacing: 0.02em;
}

/* Progress Bar */
.progress-bar {
  height: 2px;
  background: rgba(42, 42, 42, 0.08);
  margin-bottom: var(--spacing-md);
}

.progress-fill {
  height: 100%;
  background: var(--color-text-primary);
  transition: width var(--transition-base);
}

/* Details */
.card-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Tasks Toggle */
.tasks-toggle {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-sm);
}

.tasks-toggle:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

/* Tasks List */
.tasks-list {
  border: 1px solid rgba(42, 42, 42, 0.08);
  margin-bottom: var(--spacing-sm);
}

.task-item {
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.task-item:last-child {
  border-bottom: none;
}

.task-label {
  display: flex;
  gap: 1rem;
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.task-label:hover {
  background: var(--color-bg-primary);
}

.task-checkbox {
  margin-top: 0.125rem;
  accent-color: var(--color-text-primary);
}

.task-content {
  flex: 1;
}

.task-title {
  margin-bottom: 0.25rem;
}

.task-title.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.action-btn {
  padding: 0.5rem 1rem;
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

/* Empty State */
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

/* Responsive */
@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: stretch;
  }

  .card-details {
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
