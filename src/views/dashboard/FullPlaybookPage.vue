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
                :class="{ 'progress-complete': playbook.progress >= 100 }"
                :style="{ 
                  width: `${playbook.progress}%`,
                  backgroundSize: playbook.progress >= 100 ? '200% 100%' : `${100 / (playbook.progress || 1) * 100}% 100%`
                }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="section playbook-content">
        <div class="container">
          <div class="content-layout">
            <!-- Overview -->
            <div class="content-block">
              <h2 class="section-subtitle">Overview</h2>
              <div class="overview-content">
                <!-- Pattern & Challenge Grid -->
                <div class="overview-grid">
                  <div class="overview-item">
                    <span class="section-label text-xs text-tertiary">Original Pattern</span>
                    <router-link 
                      :to="`/patterns/${playbook.patternId}`" 
                      class="badge badge-pattern text-xs"
                    >
                      {{ playbook.patternTitle }}
                    </router-link>
                  </div>
                  <div class="overview-item">
                    <span class="section-label text-xs text-tertiary">Challenge</span>
                    <div class="badge badge-challenge text-xs">
                      {{ playbook.challenge }}
                    </div>
                  </div>
                </div>

                <!-- Timeline with dots -->
                <div class="overview-section">
                  <span class="section-label text-xs text-tertiary">Timeline</span>
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

                <!-- Actions -->
                <div class="overview-section">
                  <span class="section-label text-xs text-tertiary">Actions</span>
                  <div class="overview-actions">
                    <button 
                      v-if="playbook.status === 'active'"
                      @click="markComplete"
                      class="btn btn-sm"
                    >
                      Mark Complete
                    </button>
                    <button 
                      @click="togglePause"
                      class="btn-secondary btn-sm"
                    >
                      {{ playbook.status === 'paused' ? 'Resume' : 'Pause' }}
                    </button>
                    <button 
                      @click="showDeleteModal = true"
                      class="btn-secondary btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="content-block">
              <h2 class="section-subtitle">Summary</h2>
              <div class="solution-display">
                <p class="text-secondary">{{ playbook.solution }}</p>
              </div>
            </div>

            <!-- Tasks -->
            <div class="content-block">
              <div class="block-header">
                <h2 class="section-subtitle">Implementation Tasks</h2>
                <div class="header-actions">
                  <span class="text-xs text-tertiary">
                    {{ completedTasksCount }} of {{ playbook.tasks.length }} complete
                  </span>
                  <button @click="startAddingTask" class="btn-text text-xs">
                    + Add Task
                  </button>
                </div>
              </div>

              <!-- Add New Task Form -->
              <div v-if="isAddingTask" class="task-form">
                <div class="form-group">
                  <label class="text-xs text-tertiary">Task Title</label>
                  <input
                    v-model="newTask.title"
                    type="text"
                    class="form-input"
                    placeholder="Enter task title..."
                  />
                </div>
                <div class="form-group">
                  <label class="text-xs text-tertiary">Description</label>
                  <textarea
                    v-model="newTask.description"
                    class="form-textarea"
                    rows="2"
                    placeholder="Enter task description..."
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="text-xs text-tertiary">Due Date</label>
                  <input
                    v-model="newTask.dueDate"
                    type="date"
                    class="form-input"
                  />
                </div>
                <div class="form-actions">
                  <button @click="saveNewTask" class="btn btn-sm">Add Task</button>
                  <button @click="cancelAddingTask" class="btn-text text-xs">Cancel</button>
                </div>
              </div>

              <div class="tasks-list">
                <div
                  v-for="(task, index) in playbook.tasks"
                  :key="task.id"
                  class="task-item"
                  :data-accent="((index % 3) + 1)"
                >
                  <!-- Task Display Mode -->
                  <div v-if="editingTaskId !== task.id" class="task-main">
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
                    <div class="task-actions">
                      <button
                        @click="startEditingTask(task)"
                        class="task-action-btn text-xs"
                      >
                        Edit
                      </button>
                      <button
                        @click="toggleTaskNotes(task.id)"
                        class="task-action-btn text-xs"
                        :class="{ active: expandedTaskNotes[task.id] }"
                      >
                        {{ expandedTaskNotes[task.id] ? '− Notes' : '+ Notes' }}
                      </button>
                    </div>
                  </div>

                  <!-- Task Edit Mode -->
                  <div v-else class="task-edit-form">
                    <div class="form-group">
                      <label class="text-xs text-tertiary">Task Title</label>
                      <input
                        v-model="editingTask.title"
                        type="text"
                        class="form-input"
                        placeholder="Enter task title..."
                      />
                    </div>
                    <div class="form-group">
                      <label class="text-xs text-tertiary">Description</label>
                      <textarea
                        v-model="editingTask.description"
                        class="form-textarea"
                        rows="2"
                        placeholder="Enter task description..."
                      ></textarea>
                    </div>
                    <div class="form-group">
                      <label class="text-xs text-tertiary">Due Date</label>
                      <input
                        v-model="editingTask.dueDate"
                        type="date"
                        class="form-input"
                      />
                    </div>
                  <div class="form-actions">
                    <button @click="saveTaskEdit" class="btn btn-sm">Save</button>
                    <button @click="cancelTaskEdit" class="btn-text text-xs">Cancel</button>
                    <button @click="confirmDeleteTask(task.id)" class="btn-text text-xs text-danger">Delete Task</button>
                  </div>
                </div>                  <!-- Expandable Notes Section -->
                  <div v-if="expandedTaskNotes[task.id]" class="task-notes-section">
                    <label class="text-xs text-tertiary" style="display: block; margin-bottom: 0.5rem;">
                      Implementation Notes
                    </label>
                    <textarea
                      v-model="taskNotes[task.id]"
                      @input="saveTaskNotes(task.id)"
                      class="task-notes-textarea"
                      rows="3"
                      placeholder="Describe what you did to complete this task, any challenges faced, resources used, or lessons learned..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes & Learnings -->
            <div class="content-block">
              <div class="block-header">
                <h2 class="section-subtitle">Notes & Learnings</h2>
                <button 
                  v-if="!isEditingNotes"
                  @click="startEditingNotes"
                  class="btn-text text-xs"
                >
                  Edit
                </button>
              </div>
              
              <!-- Display Mode -->
              <div v-if="!isEditingNotes" class="notes-display">
                <p v-if="playbook.notes" class="text-secondary">{{ playbook.notes }}</p>
                <p v-else class="text-tertiary" style="font-style: italic;">No notes added yet. Click Edit to add your learnings and insights.</p>
              </div>

              <!-- Edit Mode -->
              <div v-else class="notes-edit">
                <textarea
                  v-model="editableNotes"
                  class="notes-textarea"
                  rows="6"
                  placeholder="Document your overall learnings, insights, challenges overcome, and advice for others implementing this pattern..."
                ></textarea>
                <div class="form-actions" style="margin-top: 1rem;">
                  <button @click="saveNotes" class="btn btn-sm">Save</button>
                  <button @click="cancelEditingNotes" class="btn-text text-xs">Cancel</button>
                </div>
              </div>
            </div>

            <!-- Resources -->
            <div v-if="playbook.resources.length > 0" class="content-block">
              <div class="block-header">
                <h2 class="section-subtitle">Resources</h2>
                <button 
                  v-if="!isEditingResources"
                  @click="startEditingResources"
                  class="btn-text text-xs"
                >
                  Edit
                </button>
              </div>
              
              <!-- Display Mode -->
              <div v-if="!isEditingResources" class="resources-grid">
                <!-- Link Resources (external) -->
                <a
                  v-for="resource in playbook.resources.filter(r => r.type === 'link')"
                  :key="`${resource.type}-${resource.id}`"
                  :href="resource.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="resource-card resource-card-link text-sm"
                >
                  <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
                  <span>{{ resource.title }}</span>
                  <span class="link-indicator">↗</span>
                </a>
                
                <!-- Internal Resources (patterns, challenges, stories) -->
                <router-link
                  v-for="resource in playbook.resources.filter(r => r.type !== 'link')"
                  :key="`${resource.type}-${resource.id}`"
                  :to="getResourceLink(resource)"
                  class="resource-card text-sm"
                >
                  <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
                  <span>{{ resource.title }}</span>
                </router-link>
              </div>

              <!-- Edit Mode -->
              <div v-else>
                <div class="resources-grid">
                  <div
                    v-for="resource in playbook.resources"
                    :key="`${resource.type}-${resource.id}`"
                    class="resource-card resource-card-editable text-sm"
                  >
                    <div class="resource-card-content">
                      <div class="resource-card-info">
                        <span class="resource-type text-xs text-tertiary">{{ resource.type }}</span>
                        <span>{{ resource.title }}</span>
                      </div>
                      <button @click="confirmDeleteResource(resource.id)" class="delete-resource-btn">×</button>
                    </div>
                  </div>
                </div>
                <div style="margin-top: 1.5rem;">
                  <button @click="cancelEditingResources" class="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <div class="content-nav">
              <router-link to="/dashboard/playbooks" class="nav-link text-xs">
                ← All Playbooks
              </router-link>
              <router-link to="/dashboard/stories" class="nav-link text-xs">
                Success Stories →
              </router-link>
            </div>
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

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete Playbook"
      message="Are you sure you want to delete this playbook? This action cannot be undone and all associated data will be lost."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDelete"
    />

    <!-- Delete Task Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteTaskModal"
      title="Delete Task"
      message="Are you sure you want to delete this task? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDeleteTask"
    />

    <!-- Delete Resource Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteResourceModal"
      title="Delete Resource"
      message="Are you sure you want to remove this resource from the playbook?"
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDeleteResource"
    />

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { ConfirmModal, Toast } from '@/components'

const route = useRoute()
const router = useRouter()
const playbooksStore = usePlaybooksStore()

// Fetch playbooks on mount
onMounted(() => {
  playbooksStore.fetchPlaybooks()
})

const playbookId = computed(() => route.params.id as string)

const playbook = computed(() => 
  playbooksStore.playbooks.find(p => p.id === playbookId.value)
)

const completedTasksCount = computed(() => {
  if (!playbook.value) return 0
  return playbook.value.tasks.filter(t => t.completed).length
})

// Task management
const isAddingTask = ref(false)
const editingTaskId = ref<string | null>(null)
const newTask = ref({
  title: '',
  description: '',
  dueDate: ''
})
const editingTask = ref({
  title: '',
  description: '',
  dueDate: ''
})

const startAddingTask = () => {
  isAddingTask.value = true
  newTask.value = { title: '', description: '', dueDate: '' }
}

const cancelAddingTask = () => {
  isAddingTask.value = false
  newTask.value = { title: '', description: '', dueDate: '' }
}

const saveNewTask = () => {
  if (!playbook.value || !newTask.value.title.trim()) return
  
  const task = {
    id: `task_${Date.now()}`,
    title: newTask.value.title.trim(),
    description: newTask.value.description.trim(),
    completed: false,
    dueDate: newTask.value.dueDate || null,
    completedDate: null
  }
  
  const updatedTasks = [...playbook.value.tasks, task]
  playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks })
  
  cancelAddingTask()
}

const startEditingTask = (task: any) => {
  editingTaskId.value = task.id
  editingTask.value = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate || ''
  }
}

const cancelTaskEdit = () => {
  editingTaskId.value = null
  editingTask.value = { title: '', description: '', dueDate: '' }
}

const saveTaskEdit = () => {
  if (!playbook.value || !editingTaskId.value || !editingTask.value.title.trim()) return
  
  const updatedTasks = playbook.value.tasks.map(task => 
    task.id === editingTaskId.value
      ? {
          ...task,
          title: editingTask.value.title.trim(),
          description: editingTask.value.description.trim(),
          dueDate: editingTask.value.dueDate || null
        }
      : task
  )
  
  playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks })
  toastMessage.value = 'Task saved successfully'
  showToast.value = true
  cancelTaskEdit()
}

// Task deletion with modal
const showDeleteTaskModal = ref(false)
const taskToDelete = ref<string | null>(null)

const confirmDeleteTask = (taskId: string) => {
  taskToDelete.value = taskId
  showDeleteTaskModal.value = true
}

const handleDeleteTask = () => {
  if (!playbook.value || !taskToDelete.value) return
  
  const updatedTasks = playbook.value.tasks.filter(task => task.id !== taskToDelete.value)
  playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks })
  
  // Clean up task notes from localStorage
  const storageKey = `task-notes-${playbook.value.id}-${taskToDelete.value}`
  localStorage.removeItem(storageKey)
  delete taskNotes.value[taskToDelete.value]
  delete expandedTaskNotes.value[taskToDelete.value]
  
  showDeleteTaskModal.value = false
  taskToDelete.value = null
  toastMessage.value = 'Task deleted successfully'
  showToast.value = true
  cancelTaskEdit()
}

// Task notes
const expandedTaskNotes = ref<Record<string, boolean>>({})
const taskNotes = ref<Record<string, string>>({})

const toggleTaskNotes = (taskId: string) => {
  expandedTaskNotes.value[taskId] = !expandedTaskNotes.value[taskId]
}

const saveTaskNotes = (taskId: string) => {
  // Save to localStorage immediately
  if (playbook.value) {
    const storageKey = `task-notes-${playbook.value.id}-${taskId}`
    localStorage.setItem(storageKey, taskNotes.value[taskId] || '')
  }
}

// Load task notes from localStorage
watch(() => playbook.value, (newPlaybook) => {
  if (newPlaybook) {
    newPlaybook.tasks.forEach(task => {
      const storageKey = `task-notes-${newPlaybook.id}-${task.id}`
      const savedNotes = localStorage.getItem(storageKey)
      if (savedNotes) {
        taskNotes.value[task.id] = savedNotes
      }
    })
  }
}, { immediate: true })

// Notes editing
const isEditingNotes = ref(false)
const editableNotes = ref('')
const showToast = ref(false)
const toastMessage = ref('')

const startEditingNotes = () => {
  editableNotes.value = playbook.value?.notes || ''
  isEditingNotes.value = true
}

const cancelEditingNotes = () => {
  editableNotes.value = playbook.value?.notes || ''
  isEditingNotes.value = false
}

const saveNotes = () => {
  if (playbook.value) {
    playbooksStore.updatePlaybookNotes(playbook.value.id, editableNotes.value)
    isEditingNotes.value = false
    toastMessage.value = 'Notes saved successfully'
    showToast.value = true
  }
}

// Initialize editable notes
watch(() => playbook.value?.notes, (newNotes) => {
  if (newNotes !== undefined && !isEditingNotes.value) {
    editableNotes.value = newNotes
  }
}, { immediate: true })

// Resources editing
const isEditingResources = ref(false)
const showDeleteResourceModal = ref(false)
const resourceToDelete = ref<number | null>(null)

const startEditingResources = () => {
  isEditingResources.value = true
}

const cancelEditingResources = () => {
  isEditingResources.value = false
}

const confirmDeleteResource = (resourceId: number) => {
  resourceToDelete.value = resourceId
  showDeleteResourceModal.value = true
}

const handleDeleteResource = () => {
  if (!playbook.value || !resourceToDelete.value) return
  
  const updatedResources = playbook.value.resources.filter(
    resource => resource.id !== resourceToDelete.value
  )
  
  playbooksStore.updatePlaybook(playbook.value.id, { resources: updatedResources })
  
  showDeleteResourceModal.value = false
  resourceToDelete.value = null
  toastMessage.value = 'Resource deleted successfully'
  showToast.value = true
  
  // Exit edit mode if no resources left
  if (updatedResources.length === 0) {
    isEditingResources.value = false
  }
}

const toggleTask = (taskId: string) => {
  if (playbook.value) {
    playbooksStore.toggleTaskCompletion(playbook.value.id, taskId)
  }
}

const markComplete = () => {
  if (playbook.value) {
    playbooksStore.updatePlaybook(playbook.value.id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0]
    })
  }
}

const togglePause = () => {
  if (playbook.value) {
    const newStatus = playbook.value.status === 'paused' ? 'active' : 'paused'
    playbooksStore.updatePlaybook(playbook.value.id, {
      status: newStatus as 'active' | 'paused'
    })
  }
}

// Delete modal
const showDeleteModal = ref(false)

const handleDelete = () => {
  if (playbook.value) {
    playbooksStore.deletePlaybook(playbook.value.id)
    router.push('/dashboard/playbooks')
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

const getResourceLink = (resource: any) => {
  if (resource.type === 'pattern') {
    return `/patterns/${resource.id}`
  } else if (resource.type === 'challenge') {
    return `/challenges/${resource.id}`
  } else if (resource.type === 'story') {
    return `/stories/${resource.id}`
  }
  // For links, we handle them with href directly
  return '#'
}
</script>

<style scoped>
.full-playbook-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Hero */
.playbook-hero {
  padding: 8rem var(--container-padding) 8rem;
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
  background: rgba(181, 160, 232, 0.1);
  border-color: var(--color-accent-3);
  color: var(--color-accent-3);
}

.status-completed {
  background: rgba(184, 212, 200, 0.1);
  border-color: var(--color-accent-2);
  color: var(--color-accent-2);
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
  background-position: left center;
  background-repeat: no-repeat;
  transition: width var(--transition-base), background-size var(--transition-base);
}

.progress-fill.progress-complete {
  background-size: 200% 100%;
  animation: gradientFlow 3s ease infinite;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Content */
.playbook-content {
  background: var(--color-bg-secondary);
  padding: 4rem var(--container-padding);
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-block {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-subtitle {
  font-size: 1.75rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin: 0;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.block-header .section-subtitle {
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.save-status {
  font-style: italic;
}

/* Overview */
.overview-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-top: 2.5rem;
}

.overview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  transition: all var(--transition-base);
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  display: inline-block;
}

.badge-pattern {
  cursor: pointer;
}

.badge-pattern:hover {
  border-color: var(--color-accent-2);
  background: rgba(184, 212, 200, 0.05);
}

.badge-challenge {
  background: rgba(42, 42, 42, 0.02);
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.overview-item .badge {
  align-self: flex-start;
}

.overview-item p {
  line-height: 1.7;
}

/* Timeline */
.timeline-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
}

.timeline-item {
  display: flex;
  gap: 1rem;
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

/* Overview Actions */
.overview-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.btn-secondary.btn-danger {
  border-color: rgba(232, 180, 160, 0.3);
  color: var(--color-accent-warm);
}

.btn-secondary.btn-danger:hover {
  border-color: var(--color-accent-1);
  background: rgba(232, 180, 160, 0.05);
}

/* Solution */
.solution-display {
  padding-top: 2.5rem;
}

.solution-display p {
  line-height: 1.8;
  font-size: 1rem;
}

.solution-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.solution-textarea {
  width: 100%;
  padding: 1.25rem;
  font-family: var(--font-family);
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  resize: vertical;
  transition: border-color var(--transition-base);
}

.solution-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.edit-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Forms */
.task-form,
.task-edit-form {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-family);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  transition: border-color var(--transition-base);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-top: 0.5rem;
}

.text-danger {
  color: var(--color-accent-warm) !important;
}

.text-danger:hover {
  color: var(--color-accent-1) !important;
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

.task-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.task-label {
  flex: 1;
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
  flex-shrink: 0;
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

.task-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem 1.5rem 1.5rem 0;
  flex-shrink: 0;
}

.task-action-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.task-action-btn:hover,
.task-action-btn.active {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.task-notes-section {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-secondary);
}

.task-notes-textarea {
  width: 100%;
  padding: 1rem;
  font-family: var(--font-family);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  resize: vertical;
  transition: border-color var(--transition-base);
}

.task-notes-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.task-notes-textarea::placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

/* Notes & Learnings */
.notes-display {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-3);
  line-height: 1.8;
  padding-top: 2.5rem;
}

.notes-edit {
  padding-top: 2.5rem;
}

.notes-textarea {
  width: 100%;
  padding: 1.5rem;
  font-family: var(--font-family);
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  resize: vertical;
  transition: border-color var(--transition-base);
}

.notes-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.notes-textarea::placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

/* Resources */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1.25rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all var(--transition-base);
  border: 1px solid rgba(42, 42, 42, 0.08);
  position: relative;
}

.resource-card:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-accent-2);
}

.resource-card-link {
  position: relative;
}

.link-indicator {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  font-size: 1rem;
  color: var(--color-text-tertiary);
  transition: all var(--transition-base);
}

.resource-card-link:hover .link-indicator {
  color: var(--color-text-primary);
  transform: translateX(2px) translateY(-2px);
}

.resource-card-editable {
  cursor: default;
}

.resource-card-editable:hover {
  background: var(--color-bg-primary);
  border-color: rgba(42, 42, 42, 0.08);
}

.resource-card-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.resource-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.delete-resource-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(232, 180, 160, 0.3);
  background: transparent;
  color: var(--color-accent-warm);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  padding: 0;
  font-weight: var(--font-weight-normal);
  flex-shrink: 0;
}

.delete-resource-btn:hover {
  background: rgba(232, 180, 160, 0.1);
  border-color: var(--color-accent-1);
  color: var(--color-accent-1);
}

.resource-type {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Navigation */
.content-nav {
  display: flex;
  justify-content: space-between;
  padding: 2rem 3rem;
  background: var(--color-bg-primary);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-base);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-link:hover {
  color: var(--color-text-primary);
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
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.action-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.02);
}

.action-btn-danger {
  border-color: rgba(232, 180, 160, 0.3);
  color: var(--color-accent-warm);
}

.action-btn-danger:hover {
  border-color: var(--color-accent-1);
  background: rgba(232, 180, 160, 0.05);
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

/* Responsive */
@media (max-width: 1024px) {
  .overview-grid,
  .timeline {
    grid-template-columns: 1fr;
  }

  .timeline {
    flex-direction: column;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .playbook-hero {
    padding: 6rem var(--container-padding) 6rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-location {
    font-size: 1rem;
  }

  .content-block {
    padding: 2rem;
  }

  .task-main {
    flex-direction: column;
  }

  .task-actions {
    padding: 0 1.5rem 1.5rem;
    align-self: flex-start;
  }

  .content-nav {
    padding: 1.5rem 2rem;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }

  .overview-badges,
  .overview-actions {
    flex-direction: column;
  }

  .badge,
  .btn-sm,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }
}
</style>
