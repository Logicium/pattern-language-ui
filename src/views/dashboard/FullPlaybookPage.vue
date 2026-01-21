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
                  <div class="timeline">
                    <div class="timeline-item">
                      <span class="timeline-label text-xs text-tertiary">STARTED</span>
                      <div class="timeline-value">
                        <div class="timeline-marker" data-accent="1"></div>
                        <p class="timeline-date text-sm">{{ formatDate(playbook.startDate) }}</p>
                      </div>
                    </div>
                    <div class="timeline-item">
                      <span class="timeline-label text-xs text-tertiary">TARGET COMPLETION</span>
                      <div class="timeline-value">
                        <div class="timeline-marker" data-accent="2"></div>
                        <p class="timeline-date text-sm">{{ formatDate(playbook.targetCompletionDate) }}</p>
                      </div>
                    </div>
                    <div v-if="playbook.completedDate" class="timeline-item">
                      <span class="timeline-label text-xs text-tertiary">COMPLETED</span>
                      <div class="timeline-value">
                        <div class="timeline-marker" data-accent="3"></div>
                        <p class="timeline-date text-sm">{{ formatDate(playbook.completedDate) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Collaboration -->
                <div class="overview-section">
                  <div class="section-header-with-actions">
                    <span class="section-label text-xs text-tertiary">Collaboration</span>
                    <div class="section-actions">
                      <button 
                        v-if="userRole === 'creator'"
                        @click="showInviteMemberModal = true"
                        :disabled="loading"
                        class="btn-text text-xs"
                      >
                        + Invite Member
                      </button>
                    </div>
                  </div>
                  
                  <div class="members-grid">
                    <router-link 
                      v-for="member in members" 
                      :key="member.id"
                      :to="`/dashboard/profile/${member.user.id}`"
                      class="member-card"
                      :class="{ 'member-creator': member.role === 'creator' }"
                    >
                      <div class="member-circle">
                        {{ getInitials(member.user.name) }}
                      </div>
                      <div class="member-name text-xs">{{ member.user.name }}</div>
                      <div v-if="member.role === 'creator'" class="member-role text-xs text-tertiary">Creator</div>
                      <div v-else class="member-role text-xs text-tertiary">Member</div>
                    </router-link>
                    <p v-if="members.length === 0" class="text-xs text-tertiary">No members yet</p>
                  </div>

                  <div v-if="playbook.isPublic" class="public-indicator">
                    <span class="text-xs text-tertiary">
                      This playbook is visible to your local community
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="overview-section">
                  <span class="section-label text-xs text-tertiary">Actions</span>
                  <div class="overview-actions">
                    <!-- Actions for members -->
                    <template v-if="isUserMember">
                      <button 
                        v-if="playbook.status === 'active'"
                        @click="markComplete"
                        class="btn btn-sm"
                      >
                        Mark Complete
                      </button>
                      <button 
                        v-if="playbook.status === 'completed'"
                        @click="generateSuccessStory"
                        :disabled="isGenerating"
                        class="btn btn-sm"
                      >
                        {{ isGenerating ? 'Generating...' : 'Generate Success Story' }}
                      </button>
                      <button 
                        v-if="userRole === 'creator'"
                        @click="togglePublishState"
                        :disabled="loading"
                        class="btn-secondary btn-sm"
                      >
                        {{ playbook.isPublic ? 'Unpublish' : 'Publish' }}
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
                    </template>
                    
                    <!-- Action for non-members viewing a public playbook -->
                    <template v-else>
                      <button 
                        @click="requestToJoin"
                        :disabled="loading"
                        class="btn btn-sm"
                      >
                        Request to Join
                      </button>
                    </template>
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
                  <button 
                    v-if="isUserMember"
                    @click="startAddingTask" 
                    class="btn-text text-xs"
                  >
                    + Add Task
                  </button>
                </div>
              </div>

              <!-- Add New Task Form -->
              <div v-if="isAddingTask && isUserMember" class="task-form">
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
                    <div class="task-header-row">
                      <div v-if="isUserMember" class="task-checkbox-wrapper">
                        <input
                          type="checkbox"
                          :checked="task.completed"
                          @change="toggleTask(task.id)"
                          class="task-checkbox"
                        />
                      </div>
                      <div class="task-title-wrapper">
                        <div class="task-title text-sm" :class="{ completed: task.completed }">
                          {{ task.title }}
                        </div>
                      </div>
                      <div v-if="isUserMember" class="task-actions">
                        <button
                          @click="selectedTask = task; showTaskDetailsModal = true"
                          class="task-action-btn text-xs"
                          type="button"
                        >
                          View
                        </button>
                        <button
                          @click="startEditingTask(task)"
                          class="task-action-btn text-xs"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          @click="toggleTaskNotes(task.id)"
                          class="task-action-btn text-xs"
                          :class="{ active: expandedTaskNotes[task.id] }"
                          type="button"
                        >
                          {{ expandedTaskNotes[task.id] ? '− Notes' : '+ Notes' }}
                        </button>
                      </div>
                    </div>
                    <div class="task-content">
                      <p class="task-description text-xs text-secondary">
                        {{ task.description }}
                      </p>
                      <div class="task-meta text-xs text-tertiary">
                        <span v-if="task.dueDate">Due {{ formatDate(task.dueDate) }}</span>
                        <span v-if="task.completedDate"> · Completed {{ formatDate(task.completedDate) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Task Edit Mode -->
                  <div v-else-if="isUserMember" class="task-edit-form">
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
                  <div v-if="expandedTaskNotes[task.id] && isUserMember" class="task-notes-section">
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
                  v-if="!isEditingNotes && isUserMember"
                  @click="startEditingNotes"
                  class="btn-text text-xs"
                >
                  Edit
                </button>
              </div>
              
              <!-- Display Mode -->
              <div v-if="!isEditingNotes" class="notes-display">
                <p v-if="playbook.notes" class="text-secondary">{{ playbook.notes }}</p>
                <p v-else class="text-tertiary" style="font-style: italic;">
                  {{ isUserMember ? 'No notes added yet. Click Edit to add your learnings and insights.' : 'No notes added yet.' }}
                </p>
              </div>

              <!-- Edit Mode -->
              <div v-else-if="isUserMember" class="notes-edit">
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
                  v-if="!isEditingResources && isUserMember"
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
                  v-for="resource in playbook.resources.filter((r: any) => r.type === 'link')"
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
                  v-for="resource in playbook.resources.filter((r: any) => r.type !== 'link')"
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

    <!-- Full Task Page Modal -->
    <FullTaskPage
      v-model="showTaskDetailsModal"
      :playbook="playbook"
      :task="selectedTask"
      :members="members"
      :userRole="userRole"
      @refresh="refreshPlaybook"
    />

    <!-- Invite Member Slide-In Modal -->
    <SlideInModal v-model="showInviteMemberModal" title="Invite Member">
      <div class="invite-member-content">
        <!-- Back Button -->
        <button class="close-button" @click="showInviteMemberModal = false" title="Close">
          ← Back
        </button>

        <h2 class="modal-title">Invite Member</h2>
        
        <p class="text-sm text-secondary" style="margin-bottom: 20px;">
          Invite users from your local community to collaborate on this playbook.
        </p>
        
        <!-- Search Input -->
        <div class="form-group">
          <input
            v-model="searchQuery"
            type="text"
            class="form-input"
            placeholder="Search by name..."
            @input="searchUsers"
          />
        </div>

        <!-- All Available Users -->
        <div class="users-list">
          <div
            v-for="user in filteredAvailableUsers"
            :key="user.id"
            class="user-result"
          >
            <div 
              class="user-avatar" 
              :style="{ backgroundImage: user.profileImage ? `url(${user.profileImage})` : 'none' }"
            >
              {{ !user.profileImage ? getInitials(user.name) : '' }}
            </div>
            <div class="user-info-result">
              <div class="user-name-result">{{ user.name }}</div>
              <div class="text-xs text-tertiary">{{ user.location }}, {{ user.state }}</div>
            </div>
            <button
              @click="inviteUser(user)"
              :disabled="loading || invitedUserIds.includes(user.id)"
              class="btn-sm"
            >
              {{ invitedUserIds.includes(user.id) ? 'Invited' : 'Invite' }}
            </button>
          </div>
        </div>
        <p v-if="filteredAvailableUsers.length === 0" class="text-xs text-tertiary">
          {{ searchQuery ? 'No users found matching your search' : 'No users available to invite' }}
        </p>
      </div>
    </SlideInModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { useAuthStore } from '@/stores/auth'
import { userStoriesApi, playbooksApi, usersApi } from '@/services/api'
import { ConfirmModal, Toast } from '@/components'
import FullTaskPage from '@/components/FullTaskPage.vue'
import SlideInModal from '@/components/SlideInModal.vue'
import type { PlaybookMember, SearchedUser, Task } from '@/types/collaboration'

const route = useRoute()
const router = useRouter()
const playbooksStore = usePlaybooksStore()
const authStore = useAuthStore()
const loading = ref(false)
const localPlaybookData = ref<any>(null)
const allLocalPlaybooks = ref<any[]>([])

const playbookId = computed(() => route.params.id as string)

// Fetch playbooks on mount
onMounted(async () => {
  // Force refresh to ensure we have the latest data including public playbooks
  await playbooksStore.fetchPlaybooks(true)
  
  // Check if playbook exists in user's playbooks
  const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === playbookId.value)
  
  if (!userPlaybook) {
    // Not in user's playbooks, try loading from local published playbooks
    await loadPublicPlaybook()
  }
  
  loadMembers()
})

// Watch for route changes (navigating between different playbooks)
watch(() => route.params.id, async (newId) => {
  if (newId) {
    localPlaybookData.value = null // Reset
    const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === newId)
    if (!userPlaybook) {
      await loadPublicPlaybook()
    }
    loadMembers()
  }
})

const playbook = computed(() => {
  // First check user's own playbooks
  const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === playbookId.value)
  if (userPlaybook) return userPlaybook
  
  // Otherwise return the loaded public playbook
  return localPlaybookData.value
})

// Load public playbook data (for local playbooks from other users)
const loadPublicPlaybook = async () => {
  try {
    loading.value = true
    console.log('Loading public playbook with ID:', playbookId.value)
    
    // First try to get all local published playbooks
    allLocalPlaybooks.value = await playbooksApi.getLocalPublished()
    console.log('All local playbooks:', allLocalPlaybooks.value)
    
    // Find the specific playbook by ID
    const foundPlaybook = allLocalPlaybooks.value.find(p => p.id.toString() === playbookId.value)
    
    if (foundPlaybook) {
      localPlaybookData.value = foundPlaybook
      console.log('Found public playbook:', localPlaybookData.value)
    } else {
      console.error('Playbook not found in local published playbooks')
    }
  } catch (error) {
    console.error('Failed to load public playbook:', error)
  } finally {
    loading.value = false
  }
}

const completedTasksCount = computed(() => {
  if (!playbook.value) return 0
  return playbook.value.tasks.filter((t: any) => t.completed).length
})

// Success story generation
const isGenerating = ref(false)

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
  
  const updatedTasks = playbook.value.tasks.map((task: any) => 
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

const handleDeleteTask = async () => {
  if (!playbook.value || !taskToDelete.value) return
  
  try {
    // Call API to delete task
    await playbooksApi.deleteTask(playbook.value.id, taskToDelete.value)
    
    // Clean up task notes from localStorage
    const storageKey = `task-notes-${playbook.value.id}-${taskToDelete.value}`
    localStorage.removeItem(storageKey)
    delete taskNotes.value[taskToDelete.value]
    delete expandedTaskNotes.value[taskToDelete.value]
    
    // Refresh playbook data
    await refreshPlaybook()
    
    showDeleteTaskModal.value = false
    taskToDelete.value = null
    toastMessage.value = 'Task deleted successfully'
    showToast.value = true
    cancelTaskEdit()
  } catch (error) {
    console.error('Failed to delete task:', error)
    toastMessage.value = 'Failed to delete task'
    showToast.value = true
  }
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
    newPlaybook.tasks.forEach((task: any) => {
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
    (resource: any) => resource.id !== resourceToDelete.value
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

const generateSuccessStory = async () => {
  if (!playbook.value || typeof playbook.value.id !== 'number') return
  
  isGenerating.value = true
  try {
    const story = await userStoriesApi.generateFromPlaybook(playbook.value.id)
    toastMessage.value = 'Success story generated!'
    showToast.value = true
    
    // Navigate to the generated story after a brief delay
    setTimeout(() => {
      router.push(`/dashboard/success-stories/${story.id}`)
    }, 1000)
  } catch (error) {
    console.error('Failed to generate success story:', error)
    toastMessage.value = 'Failed to generate success story'
    showToast.value = true
  } finally {
    isGenerating.value = false
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

// ========== PART II: COLLABORATION ==========

// Members
const members = ref<PlaybookMember[]>([])

const userRole = computed(() => {
  if (!authStore.user || !playbook.value) return null
  const member = members.value.find(m => String(m.user.id) === String(authStore.user?.id))
  return member?.role || null
})

// Check if user is a member of this playbook
const isUserMember = computed(() => {
  if (!authStore.user || !playbook.value) return false
  return members.value.some(m => String(m.user.id) === String(authStore.user?.id))
})

const loadMembers = async () => {
  if (!playbook.value || typeof playbook.value.id !== 'number') return
  try {
    members.value = await playbooksApi.getMembers(playbook.value.id)
  } catch (error) {
    console.error('Failed to load members:', error)
    // If it's a local playbook we're not a member of, members might return empty
    members.value = []
  }
}

const removeMember = async (userId: number) => {
  if (!playbook.value || typeof playbook.value.id !== 'number' || !confirm('Remove this member from the playbook?')) return
  
  loading.value = true
  try {
    await playbooksApi.removeMember(playbook.value.id, userId)
    await loadMembers()
    toastMessage.value = 'Member removed'
    showToast.value = true
  } catch (error) {
    console.error('Failed to remove member:', error)
    toastMessage.value = 'Failed to remove member'
    showToast.value = true
  } finally {
    loading.value = false
  }
}

// Publish/Unpublish
const togglePublishState = async () => {
  if (!playbook.value || typeof playbook.value.id !== 'number' || loading.value) return
  
  loading.value = true
  try {
    if (playbook.value.isPublic) {
      await playbooksApi.unpublish(playbook.value.id)
      toastMessage.value = 'Playbook unpublished'
    } else {
      await playbooksApi.publish(playbook.value.id)
      toastMessage.value = 'Playbook published to local community'
    }
    showToast.value = true
    await refreshPlaybook()
  } catch (error) {
    console.error('Failed to toggle publish state:', error)
    toastMessage.value = 'Failed to update playbook'
    showToast.value = true
  } finally {
    loading.value = false
  }
}

// Request to Join (for non-members viewing a public playbook)
const requestToJoin = async () => {
  if (!playbook.value || typeof playbook.value.id !== 'number' || !authStore.user) return
  
  loading.value = true
  try {
    // Find the creator from members list or playbook data
    const creator = members.value.find(m => m.role === 'creator')
    if (creator) {
      // Convert user id from string to number for the API
      const userId = parseInt(authStore.user.id, 10)
      await playbooksApi.invite(playbook.value.id, userId, 'Request to join this playbook')
      toastMessage.value = 'Join request sent to playbook creator'
      showToast.value = true
    } else {
      toastMessage.value = 'Unable to send request - creator not found'
      showToast.value = true
    }
  } catch (error) {
    console.error('Failed to request join:', error)
    toastMessage.value = 'Failed to send request'
    showToast.value = true
  } finally {
    loading.value = false
  }
}

// Task Details Modal
const showTaskDetailsModal = ref(false)
const selectedTask = ref<Task | null>(null)

const refreshPlaybook = async () => {
  const currentTaskId = selectedTask.value?.id
  await playbooksStore.fetchPlaybooks()
  await loadMembers()
  
  // Update selectedTask with fresh data if it was open
  if (currentTaskId && playbook.value?.tasks) {
    const updatedTask = playbook.value.tasks.find((t: Task) => t.id === currentTaskId)
    if (updatedTask) {
      selectedTask.value = updatedTask
    }
  }
}

// Invite Member Modal
const showInviteMemberModal = ref(false)
const searchQuery = ref('')
const allAvailableUsers = ref<SearchedUser[]>([])
const invitedUserIds = ref<number[]>([])

// Computed property to filter users based on search
const filteredAvailableUsers = computed(() => {
  if (!searchQuery.value.trim()) {
    return allAvailableUsers.value
  }
  return allAvailableUsers.value.filter((u: SearchedUser) => 
    u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Load all available users when modal opens
watch(showInviteMemberModal, async (isOpen) => {
  if (isOpen && allAvailableUsers.value.length === 0) {
    await loadAvailableUsers()
  }
  // Clear search when closing
  if (!isOpen) {
    searchQuery.value = ''
  }
})

const loadAvailableUsers = async () => {
  try {
    const users = await usersApi.search()
    // Filter out users who are already members
    const memberIds = members.value.map(m => m.user.id)
    allAvailableUsers.value = users.filter((u: SearchedUser) => 
      !memberIds.includes(u.id)
    )
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const searchUsers = async () => {
  // The filtering is now handled by the computed property
  // This function can be kept for potential future enhancements
}

const inviteUser = async (user: SearchedUser) => {
  if (!playbook.value || typeof playbook.value.id !== 'number' || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.invite(playbook.value.id, user.id)
    invitedUserIds.value.push(user.id)
    toastMessage.value = `Invitation sent to ${user.name}`
    showToast.value = true
  } catch (error: any) {
    console.error('Failed to invite user:', error)
    toastMessage.value = error.message || 'Failed to send invitation'
    showToast.value = true
  } finally {
    loading.value = false
  }
}

const getInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Watch for playbook changes to reload members
watch(() => playbook.value?.id, (newId) => {
  if (newId) {
    loadMembers()
  }
})

// ========== END COLLABORATION ==========

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
  padding: 4rem 0;
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
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.timeline-value {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
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

.timeline-date {
  margin: 0;
  color: var(--color-text-primary);
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

.task-item:hover {
  background: var(--color-bg-secondary);
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

.task-main {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.task-header-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.5rem 0.75rem;
}

.task-title-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.task-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  padding: 0;
}

.task-checkbox {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent-2);
  flex-shrink: 0;
  border-radius: 0;
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* When checkbox is present, add left padding to align with title */
.task-header-row + .task-content {
  padding-left: calc(1.5rem + 18px + 1rem);
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
    padding: 3rem 0;
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

  .task-header-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .task-actions {
    align-self: flex-start;
    width: 100%;
  }

  .task-action-btn {
    flex: 1;
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

/* PART II: Collaboration Styles */
.section-header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.members-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: opacity 0.2s;
}

.member-card:hover {
  opacity: 0.7;
}

.member-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #d0d0d0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.member-card:hover .member-circle {
  transform: scale(1.05);
}

.member-card.member-creator .member-circle {
  background: linear-gradient(135deg, #e8b4a0, #b8d4c8, #c9b8e8);
}

.member-name {
  font-weight: 400;
  color: var(--color-text-primary);
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-role {
  text-align: center;
}

.btn-text-small {
  background: none;
  border: none;
  color: #999;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.btn-text-small:hover {
  color: #e74c3c;
}

.btn-text-small:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.public-indicator {
  padding: 0.75rem;
  background: #f0f8f0;
  margin-top: 1rem;
}

/* Invite Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Invite Member Styles */
.invite-member-content {
  padding: 3rem;
  position: relative;
}

.invite-member-content .close-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 16px;
  font-weight: 300;
  padding: 0;
  margin-bottom: 2rem;
  transition: color 0.2s;
}

.invite-member-content .close-button:hover {
  color: var(--color-text-primary);
}

.invite-member-content .modal-title {
  font-size: 28px;
  font-weight: 300;
  margin: 0 0 16px 0;
  color: #2c2c2c;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  margin-top: 1rem;
}

.user-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #fafafa;
  transition: background 0.2s;
}

.user-result:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: #b8d4c8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.user-info-result {
  flex: 1;
}

.user-name-result {
  font-weight: 400;
  font-size: 15px;
  margin-bottom: 2px;
}
</style>
