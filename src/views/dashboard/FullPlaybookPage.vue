<template>
  <div class="full-playbook-page">
    <div v-if="playbook">
      <!-- Hero -->
      <section class="playbook-hero gradient-bg">
        <div class="container">
          <div class="hero-meta">
            <span class="pattern-number text-xs text-tertiary">Pattern {{ String(playbook.patternId).padStart(2, '0') }}</span>
            <span 
              class="status-badge text-xs" 
              :class="`status-${playbook.status}`"
            >
              {{ playbook.status }}
            </span>
          </div>
          <h1 class="hero-title">{{ playbook.patternTitle }}</h1>
          <p class="hero-location text-secondary">
            {{ playbook.location }}
          </p>
          <div class="hero-progress">
            <div class="progress-info">
              <span class="progress-percentage">{{ playbook.progress }}%</span>
              <span class="text-xs text-tertiary">Complete</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${playbook.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <section class="section playbook-content">
        <div class="container">
          <div class="content-grid">
            <!-- Main Content -->
            <div class="main-content">
              <!-- Overview -->
              <div class="content-block">
                <h2 class="section-subtitle">Overview</h2>
                <div class="overview-grid">
                  <div class="overview-item">
                    <span class="text-xs text-tertiary">Challenge</span>
                    <p class="text-sm">{{ playbook.challenge }}</p>
                  </div>
                  <div class="overview-item">
                    <span class="text-xs text-tertiary">Solution</span>
                    <p class="text-sm">{{ playbook.solution }}</p>
                  </div>
                </div>
              </div>

              <!-- Timeline -->
              <div class="content-block">
                <h2 class="section-subtitle">Timeline</h2>
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-marker" data-accent="1"></div>
                    <div class="timeline-content">
                      <span class="text-xs text-tertiary">Started</span>
                      <p class="text-sm">{{ formatDate(playbook.startDate) }}</p>
                    </div>
                  </div>
                  <div class="timeline-item">
                    <div class="timeline-marker" data-accent="2"></div>
                    <div class="timeline-content">
                      <span class="text-xs text-tertiary">Target Completion</span>
                      <p class="text-sm">{{ formatDate(playbook.targetCompletionDate) }}</p>
                    </div>
                  </div>
                  <div v-if="playbook.completedDate" class="timeline-item">
                    <div class="timeline-marker" data-accent="3"></div>
                    <div class="timeline-content">
                      <span class="text-xs text-tertiary">Completed</span>
                      <p class="text-sm">{{ formatDate(playbook.completedDate) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tasks -->
              <div class="content-block">
                <div class="block-header">
                  <h2 class="section-subtitle">Tasks</h2>
                  <span class="text-xs text-tertiary">
                    {{ completedTasksCount }} of {{ playbook.tasks.length }} complete
                  </span>
                </div>
                <div class="tasks-list">
                  <div
                    v-for="(task, index) in playbook.tasks"
                    :key="task.id"
                    class="task-item"
                    :data-accent="((index % 3) + 1)"
                  >
                    <label class="task-label">
                      <input
                        type="checkbox"
                        :checked="task.completed"
                        @change="toggleTask(task.id)"
                        class="task-checkbox"
                      />
                      <div class="task-content">
                        <div class="task-title text-sm" :class="{ completed: task.completed }">
                          {{ task.title }}
                        </div>
                        <p class="task-description text-xs text-secondary">
                          {{ task.description }}
                        </p>
                        <div class="task-meta text-xs text-tertiary">
                          <span v-if="task.dueDate">Due {{ formatDate(task.dueDate) }}</span>
                          <span v-if="task.completedDate"> · Completed {{ formatDate(task.completedDate) }}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="playbook.notes" class="content-block">
                <h2 class="section-subtitle">Notes & Learnings</h2>
                <div class="notes-content">
                  <p class="text-secondary">{{ playbook.notes }}</p>
                </div>
                <button class="btn-text text-xs">Edit Notes</button>
              </div>
            </div>

            <!-- Sidebar -->
            <aside class="sidebar">
              <!-- Status Actions -->
              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Actions</h3>
                <div class="action-buttons">
                  <button 
                    v-if="playbook.status === 'active'"
                    class="btn" 
                    style="width: 100%; margin-bottom: 0.75rem;"
                  >
                    Mark Complete
                  </button>
                  <button 
                    class="action-btn text-xs"
                    style="width: 100%; margin-bottom: 0.75rem;"
                  >
                    {{ playbook.status === 'paused' ? 'Resume' : 'Pause' }} Playbook
                  </button>
                  <button class="action-btn text-xs" style="width: 100%;">
                    Delete Playbook
                  </button>
                </div>
              </div>

              <!-- Related Resources -->
              <div v-if="playbook.resources.length > 0" class="sidebar-block">
                <h3 class="sidebar-title text-sm">Related Resources</h3>
                <div class="resources-list">
                  <router-link
                    v-for="resource in playbook.resources"
                    :key="`${resource.type}-${resource.id}`"
                    :to="resource.type === 'pattern' ? `/patterns/${resource.id}` : `/stories`"
                    class="resource-link text-sm"
                  >
                    <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
                    <span>{{ resource.title }}</span>
                  </router-link>
                </div>
              </div>

              <!-- Original Pattern -->
              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Original Pattern</h3>
                <p class="text-xs text-tertiary" style="line-height: 1.7; margin-bottom: 1rem;">
                  Review the full pattern documentation
                </p>
                <router-link 
                  :to="`/patterns/${playbook.patternId}`" 
                  class="btn" 
                  style="width: 100%; text-align: center; text-decoration: none;"
                >
                  View Pattern
                </router-link>
              </div>

              <!-- Navigation -->
              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Navigate</h3>
                <div class="nav-links">
                  <router-link to="/dashboard/playbooks" class="nav-link text-xs">
                    ← All Playbooks
                  </router-link>
                  <router-link to="/dashboard/stories" class="nav-link text-xs">
                    Success Stories →
                  </router-link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>

    <!-- Not Found State -->
    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Playbook not found</p>
      <router-link to="/dashboard/playbooks" class="btn" style="margin-top: 2rem;">
        Back to Playbooks
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'

const route = useRoute()
const router = useRouter()
const playbooksStore = usePlaybooksStore()

const playbookId = computed(() => route.params.id as string)

const playbook = computed(() => 
  playbooksStore.playbooks.find(p => p.id === playbookId.value)
)

const completedTasksCount = computed(() => {
  if (!playbook.value) return 0
  return playbook.value.tasks.filter(t => t.completed).length
})

const toggleTask = (taskId: string) => {
  if (playbook.value) {
    playbooksStore.toggleTaskCompletion(playbook.value.id, taskId)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.full-playbook-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Hero */
.playbook-hero {
  padding: 12rem var(--container-padding) 6rem;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.hero-meta {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.pattern-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.status-badge {
  padding: 0.5rem 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  border: 1px solid;
}

.status-active {
  background: rgba(184, 212, 200, 0.1);
  border-color: var(--color-accent-2);
  color: var(--color-accent-2);
}

.status-completed {
  background: rgba(232, 180, 160, 0.1);
  border-color: var(--color-accent-1);
  color: var(--color-accent-warm);
}

.status-paused {
  background: rgba(42, 42, 42, 0.05);
  border-color: rgba(42, 42, 42, 0.2);
  color: var(--color-text-secondary);
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.hero-location {
  font-size: 1.25rem;
  line-height: 1.7;
  margin-bottom: 3rem;
}

.hero-progress {
  max-width: 600px;
}

.progress-info {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-percentage {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
}

.progress-bar {
  height: 6px;
  background: rgba(42, 42, 42, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  background-size: 200% 100%;
  animation: gradientFlow 3s ease infinite;
  transition: width var(--transition-base);
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Content */
.playbook-content {
  background: var(--color-bg-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.content-block {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 1.75rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
}

/* Overview */
.overview-grid {
  display: grid;
  gap: 2rem;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.overview-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.overview-item .text-xs {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-item p {
  line-height: 1.7;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.timeline-marker[data-accent="1"] {
  background: var(--color-accent-1);
}

.timeline-marker[data-accent="2"] {
  background: var(--color-accent-2);
}

.timeline-marker[data-accent="3"] {
  background: var(--color-accent-3);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.timeline-content .text-xs {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Tasks */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid rgba(42, 42, 42, 0.08);
}

.task-item {
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.task-item:last-child {
  border-bottom: none;
}

.task-item[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.task-item[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.task-item[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.task-item:hover {
  background: var(--color-bg-secondary);
}

.task-label {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  cursor: pointer;
}

.task-checkbox {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent-2);
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-title {
  font-weight: var(--font-weight-medium);
  line-height: 1.5;
  transition: opacity var(--transition-base);
}

.task-title.completed {
  text-decoration: line-through;
  opacity: 0.5;
}

.task-description {
  line-height: 1.6;
}

.task-meta {
  letter-spacing: 0.05em;
}

/* Notes */
.notes-content {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-3);
  margin-bottom: 1.5rem;
}

.notes-content p {
  line-height: 1.8;
}

.btn-text {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color var(--transition-base);
  padding: 0;
}

.btn-text:hover {
  color: var(--color-text-primary);
}

/* Sidebar */
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

.sidebar-title {
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

/* Actions */
.action-buttons {
  display: flex;
  flex-direction: column;
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

/* Resources */
.resources-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all var(--transition-base);
  border-left: 2px solid transparent;
}

.resource-link:hover {
  background: var(--color-bg-secondary);
  border-left-color: var(--color-accent-2);
  padding-left: 1.25rem;
}

.resource-type {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Navigation */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color var(--transition-base);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-link:hover {
  color: var(--color-text-primary);
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-location {
    font-size: 1rem;
  }

  .content-block {
    padding: 2rem;
  }

  .sidebar-block {
    padding: 1.5rem;
  }

  .task-label {
    padding: 1rem;
  }
}
</style>
