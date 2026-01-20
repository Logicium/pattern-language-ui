<template>
  <SlideInModal v-model="isOpen" title="Task Details">
    <div v-if="task && playbook" class="full-task-page">
      <!-- Close Button -->
      <button class="close-button" @click="isOpen = false" title="Close">
        ← Back
      </button>

      <!-- Task Header -->
      <div class="task-header">
        <div v-if="!isEditingTask" class="task-view-mode">
          <h2>{{ task.title }}</h2>
          <p class="task-description">{{ task.description }}</p>
          
          <!-- Due Date Display -->
          <div v-if="task.dueDate" class="task-due-date">
            <div class="timeline-item">
              <div class="timeline-content">
                <span class="timeline-label text-xs text-tertiary">DUE DATE</span>
                <div class="timeline-value">
                  <div class="timeline-marker" :data-accent="task.completed ? '2' : '1'"></div>
                  <p class="timeline-date text-sm">{{ formatDate(task.dueDate) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Status Display -->
          <div class="task-status-section">
            <h3 class="section-label text-xs text-tertiary">STATUS</h3>
            <div class="status-badge" :class="task.completed ? 'status-completed' : 'status-in-progress'">
              {{ task.completed ? 'Completed' : 'In Progress' }}
            </div>
          </div>
          
          <div class="task-actions-section">
            <h3 class="section-label text-xs text-tertiary">TASK ACTIONS</h3>
            <div class="task-actions-row">
              <button 
                v-if="canManage"
                class="task-action-btn text-xs"
                @click="toggleTaskCompletion"
                :disabled="loading"
              >
                {{ task.completed ? 'Resume Task' : 'Mark Complete' }}
              </button>
              <button 
                v-if="canManage"
                class="task-action-btn text-xs"
                @click="startEditingTask"
                :disabled="loading"
              >
                Edit
              </button>
              <button 
                v-if="canManage"
                class="task-action-btn text-xs"
                @click="showDeleteConfirm = true"
                :disabled="loading"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
        <div v-else class="task-edit-mode">
          <div class="form-group">
            <label class="text-xs text-tertiary">Task Title</label>
            <input
              v-model="editableTask.title"
              type="text"
              class="form-input"
              placeholder="Enter task title..."
            />
          </div>
          <div class="form-group">
            <label class="text-xs text-tertiary">Description</label>
            <textarea
              v-model="editableTask.description"
              class="form-textarea"
              rows="3"
              placeholder="Enter task description..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="text-xs text-tertiary">Due Date</label>
            <input
              v-model="editableTask.dueDate"
              type="date"
              class="form-input"
            />
          </div>
          <div class="form-actions">
            <button class="btn btn-sm" @click="saveTaskEdit" :disabled="!editableTask.title.trim() || loading">
              Save
            </button>
            <button class="btn-text" @click="cancelEditingTask">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Assigned Members -->
      <div class="task-section" v-if="canManage">
        <div class="section-header">
          <h3>Assigned To</h3>
          <div class="section-header-actions">
            <button 
              class="btn-text-assignee" 
              @click="showAssignMemberModal = true"
              :disabled="loading"
            >
              + Assign Member
            </button>
            <button 
              v-if="assignedMembers.length > 0"
              class="btn-text-assignee" 
              @click="toggleAssigneeEditMode"
              :disabled="loading"
            >
              {{ isEditingAssignees ? 'Done' : 'Edit' }}
            </button>
          </div>
        </div>
        
        <!-- Assigned Members Display -->
        <div v-if="assignedMembers.length > 0" class="assigned-members">
          <div 
            v-for="member in assignedMembers" 
            :key="member.user.id"
            class="member-card"
            :class="{ 'member-creator': member.role === 'creator' }"
          >
            <div 
              class="member-circle" 
              :class="{ 'member-circle-creator': member.role === 'creator' }"
            >
              {{ getInitials(member.user.name) }}
            </div>
            <div class="member-name text-xs">{{ member.user.name }}</div>
            <div v-if="member.role === 'creator'" class="member-role text-xs text-tertiary">Creator</div>
            <div v-else class="member-role text-xs text-tertiary">Member</div>
            <button 
              v-if="isEditingAssignees" 
              class="remove-member-btn-action"
              @click="unassignMember(member.user.id)"
              :disabled="loading"
            >
              Remove
            </button>
          </div>
        </div>
        <p v-else class="text-xs text-tertiary">No members assigned yet</p>
      </div>

      <!-- Assign Member Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showAssignMemberModal" class="modal-overlay" @click.self="showAssignMemberModal = false">
            <div class="modal-container assign-member-modal" @click.stop>
              <div class="modal-header-custom">
                <h3 class="modal-title">Assign Member</h3>
                <button @click="showAssignMemberModal = false" class="modal-close-btn" aria-label="Close">×</button>
              </div>
              <div class="modal-content-inner">
                <p class="modal-subtitle">Select a member to assign to this task</p>
                
                <!-- Search Input -->
                <input
                  v-model="memberSearchQuery"
                  type="text"
                  class="modal-search-input"
                  placeholder="Search members..."
                />

                <!-- Available Members -->
                <div v-if="filteredUnassignedMembers.length > 0" class="modal-members-list">
                  <div
                    v-for="member in filteredUnassignedMembers"
                    :key="member.user.id"
                    class="modal-member-item"
                    @click="assignMember(member.user.id)"
                    :class="{ 'disabled': loading }"
                  >
                    <div 
                      class="modal-member-avatar" 
                      :class="{ 'is-creator': member.role === 'creator' }"
                    >
                      {{ getInitials(member.user.name) }}
                    </div>
                    <div class="modal-member-info">
                      <div class="modal-member-name">{{ member.user.name }}</div>
                      <div class="modal-member-role">{{ member.role === 'creator' ? 'Creator' : 'Member' }}</div>
                    </div>
                  </div>
                </div>
                <p v-else class="modal-empty-message">
                  {{ memberSearchQuery ? 'No members found' : 'All members are already assigned' }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Subtasks -->
      <div class="task-section">
        <div class="section-header">
          <h3>Subtasks</h3>
          <div class="section-header-actions">
            <button 
              v-if="canManage"
              class="btn-text-assignee" 
              @click="showAddSubtask = true"
              :disabled="loading"
            >
              + Add Subtask
            </button>
            <button 
              v-if="canManage && task.subtasks && task.subtasks.length > 0"
              class="btn-text-assignee" 
              @click="toggleSubtaskEditMode"
              :disabled="loading"
            >
              {{ isEditingSubtasks ? 'Done' : 'Edit' }}
            </button>
          </div>
        </div>

        <div v-if="showAddSubtask" class="add-subtask-form">
          <input 
            v-model="newSubtaskTitle"
            type="text" 
            placeholder="Subtask title..."
            @keyup.enter="addSubtask"
            @keyup.esc="showAddSubtask = false"
            ref="subtaskInput"
          />
          <div class="form-actions">
            <button class="btn-sm" @click="addSubtask" :disabled="!newSubtaskTitle.trim() || loading">
              Add
            </button>
            <button class="btn-text" @click="cancelAddSubtask">Cancel</button>
          </div>
        </div>

        <div v-if="task.subtasks && task.subtasks.length > 0" class="subtasks-list">
          <div 
            v-for="subtask in task.subtasks" 
            :key="subtask.id"
            class="subtask-item"
          >
            <label class="checkbox-container">
              <input 
                v-if="!isEditingSubtasks"
                type="checkbox" 
                :checked="subtask.completed"
                @change="toggleSubtaskCompletion(subtask.id)"
                :disabled="loading"
              />
              <input 
                v-if="isEditingSubtasks && editingSubtaskId === subtask.id"
                v-model="editingSubtaskTitle"
                type="text"
                class="subtask-edit-input"
                @keyup.enter="saveSubtaskEdit(subtask.id)"
                @keyup.esc="cancelSubtaskEdit"
                @blur="saveSubtaskEdit(subtask.id)"
                ref="subtaskEditInput"
              />
              <span 
                v-else
                :class="{ completed: subtask.completed }"
                @click="isEditingSubtasks ? startEditingSubtask(subtask.id, subtask.title) : null"
                :style="{ cursor: isEditingSubtasks ? 'pointer' : 'default' }"
              >
                {{ subtask.title }}
              </span>
            </label>
            <button 
              v-if="isEditingSubtasks"
              class="btn-delete" 
              @click="deleteSubtask(subtask.id)"
              :disabled="loading"
              title="Delete subtask"
            >
              ×
            </button>
          </div>
        </div>
        <p v-else class="empty-state">No subtasks yet</p>
      </div>

      <!-- Comments -->
      <div class="task-section">
        <h3>Discussion</h3>
        
        <!-- Add Comment Form -->
        <div v-if="canComment" class="add-comment-form">
          <textarea 
            v-model="newCommentContent"
            placeholder="Add a comment..."
            rows="3"
            @keydown.meta.enter="addComment"
            @keydown.ctrl.enter="addComment"
          ></textarea>
          <button 
            class="btn-sm" 
            @click="addComment"
            :disabled="!newCommentContent.trim() || loading"
          >
            Comment
          </button>
        </div>

        <!-- Comments List -->
        <div v-if="comments.length > 0" class="comments-list">
          <div 
            v-for="comment in comments" 
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-author">
                <div 
                  class="author-avatar" 
                  :style="{ backgroundImage: comment.author.profileImage ? `url(${comment.author.profileImage})` : 'none' }"
                >
                  {{ !comment.author.profileImage ? getInitials(comment.author.name) : '' }}
                </div>
                <span class="author-name">{{ comment.author.name }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div v-if="canEditComment(comment)" class="comment-actions">
                <button 
                  class="btn-text-small" 
                  @click="startEditComment(comment)"
                  :disabled="loading"
                >
                  Edit
                </button>
                <button 
                  class="btn-text-small" 
                  @click="deleteComment(comment.id)"
                  :disabled="loading"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div v-if="editingCommentId === comment.id" class="edit-comment-form">
              <textarea 
                v-model="editCommentContent"
                rows="3"
                @keydown.esc="cancelEditComment"
              ></textarea>
              <div class="form-actions">
                <button class="btn-sm" @click="saveEditComment(comment.id)" :disabled="!editCommentContent.trim() || loading">
                  Save
                </button>
                <button class="btn-text" @click="cancelEditComment">Cancel</button>
              </div>
            </div>
            <p v-else class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
        <p v-else class="empty-state">No comments yet</p>
      </div>
    </div>
  </SlideInModal>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal
    v-model="showDeleteConfirm"
    title="Delete Task"
    message="Are you sure you want to delete this task? This action cannot be undone."
    confirm-text="Delete"
    cancel-text="Cancel"
    :danger="true"
    @confirm="deleteTask"
  />

  <!-- Toast Notification -->
  <Toast :show="showToast" :message="toastMessage" @update:show="showToast = $event" />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { playbooksApi } from '../services/api'
import SlideInModal from './SlideInModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import Toast from './Toast.vue'
import type { Task, PlaybookMember, TaskComment } from '../types/collaboration'

interface Props {
  modelValue: boolean
  playbook: any
  task: Task | null
  members: PlaybookMember[]
  userRole?: 'creator' | 'collaborator' | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'refresh'])

const authStore = useAuthStore()
const loading = ref(false)

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Task editing
const isEditingTask = ref(false)
const editableTask = ref({
  title: '',
  description: '',
  dueDate: ''
})

// Delete confirmation
const showDeleteConfirm = ref(false)

// Toast notification
const showToast = ref(false)
const toastMessage = ref('')

// Assignee editing
const isEditingAssignees = ref(false)
const showAssignMemberModal = ref(false)
const memberSearchQuery = ref('')

// Subtask editing
const isEditingSubtasks = ref(false)
const editingSubtaskId = ref<string | null>(null)
const editingSubtaskTitle = ref('')

// Computed: Filter assigned members
const assignedMembers = computed(() => {
  if (!props.task?.assignedTo) return []
  return props.members.filter(m => props.task.assignedTo.includes(m.user.id))
})

// Computed: Filter unassigned members for the modal
const filteredUnassignedMembers = computed(() => {
  const assignedIds = props.task?.assignedTo || []
  const unassigned = props.members.filter(m => !assignedIds.includes(m.user.id))
  
  if (!memberSearchQuery.value.trim()) {
    return unassigned
  }
  
  return unassigned.filter(m => 
    m.user.name.toLowerCase().includes(memberSearchQuery.value.toLowerCase())
  )
})

// Subtasks
const showAddSubtask = ref(false)
const newSubtaskTitle = ref('')
const subtaskInput = ref<HTMLInputElement | null>(null)

// Comments
const comments = ref<TaskComment[]>([])
const newCommentContent = ref('')
const editingCommentId = ref<number | null>(null)
const editCommentContent = ref('')

// Permissions
const canManage = computed(() => {
  return props.userRole === 'creator' || props.userRole === 'collaborator'
})

const canComment = computed(() => {
  return props.userRole === 'creator' || props.userRole === 'collaborator'
})

const canEditComment = (comment: TaskComment) => {
  return String(comment.author.id) === String(authStore.user?.id) || props.userRole === 'creator'
}

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

// Task completion
const toggleTaskCompletion = async () => {
  if (!props.playbook || !props.task || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.toggleTask(props.playbook.id, props.task.id)
    emit('refresh')
  } catch (error) {
    console.error('Failed to toggle task:', error)
    alert('Failed to update task')
  } finally {
    loading.value = false
  }
}

// Delete task
const deleteTask = async () => {
  if (!props.playbook || !props.task || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.deleteTask(props.playbook.id, props.task.id)
    
    // Show success toast
    toastMessage.value = 'Task deleted successfully'
    showToast.value = true
    
    emit('refresh')
    isOpen.value = false // Close the modal after successful deletion
  } catch (error) {
    console.error('Failed to delete task:', error)
    toastMessage.value = 'Failed to delete task'
    showToast.value = true
  } finally {
    loading.value = false
    showDeleteConfirm.value = false
  }
}

// Task editing
const startEditingTask = () => {
  if (!props.task) return
  isEditingTask.value = true
  editableTask.value = {
    title: props.task.title,
    description: props.task.description || '',
    dueDate: props.task.dueDate || ''
  }
}

const cancelEditingTask = () => {
  isEditingTask.value = false
  editableTask.value = { title: '', description: '', dueDate: '' }
}

const saveTaskEdit = async () => {
  if (!props.playbook || !props.task || !editableTask.value.title.trim() || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.updateTask(props.playbook.id, props.task.id, {
      title: editableTask.value.title,
      description: editableTask.value.description,
      dueDate: editableTask.value.dueDate
    })
    emit('refresh')
    isEditingTask.value = false
  } catch (error) {
    console.error('Failed to update task:', error)
    alert('Failed to update task')
  } finally {
    loading.value = false
  }
}

// Assignee editing
const toggleAssigneeEditMode = () => {
  isEditingAssignees.value = !isEditingAssignees.value
}

const assignMember = async (userId: number) => {
  if (!props.playbook || !props.task || loading.value) return
  
  loading.value = true
  try {
    const updatedAssignedTo = [...(props.task.assignedTo || []), userId]
    await playbooksApi.updateTask(props.playbook.id, props.task.id, {
      assignedTo: updatedAssignedTo
    })
    emit('refresh')
    showAssignMemberModal.value = false
    memberSearchQuery.value = ''
  } catch (error) {
    console.error('Failed to assign member:', error)
    alert('Failed to assign member')
  } finally {
    loading.value = false
  }
}

const unassignMember = async (userId: number) => {
  if (!props.playbook || !props.task || loading.value) return
  
  loading.value = true
  try {
    const updatedAssignedTo = (props.task.assignedTo || []).filter(id => id !== userId)
    await playbooksApi.updateTask(props.playbook.id, props.task.id, {
      assignedTo: updatedAssignedTo
    })
    emit('refresh')
  } catch (error) {
    console.error('Failed to unassign member:', error)
    alert('Failed to unassign member')
  } finally {
    loading.value = false
  }
}

// Subtask management

// Subtasks
const addSubtask = async () => {
  if (!props.playbook || !props.task || !newSubtaskTitle.value.trim() || loading.value) return
  
  loading.value = true
  try {
    const result = await playbooksApi.addSubtask(props.playbook.id, props.task.id, newSubtaskTitle.value.trim())
    newSubtaskTitle.value = ''
    showAddSubtask.value = false
    // Force immediate refresh to show new subtask
    await nextTick()
    emit('refresh')
  } catch (error) {
    console.error('Failed to add subtask:', error)
    alert('Failed to add subtask')
  } finally {
    loading.value = false
  }
}

const cancelAddSubtask = () => {
  newSubtaskTitle.value = ''
  showAddSubtask.value = false
}

const toggleSubtaskCompletion = async (subtaskId: string) => {
  if (!props.playbook || !props.task || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.toggleSubtask(props.playbook.id, props.task.id, subtaskId)
    emit('refresh')
  } catch (error) {
    console.error('Failed to toggle subtask:', error)
    alert('Failed to update subtask')
  } finally {
    loading.value = false
  }
}

const deleteSubtask = async (subtaskId: string) => {
  if (!props.playbook || !props.task || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.deleteSubtask(props.playbook.id, props.task.id, subtaskId)
    emit('refresh')
  } catch (error) {
    console.error('Failed to delete subtask:', error)
    alert('Failed to delete subtask')
  } finally {
    loading.value = false
  }
}

const toggleSubtaskEditMode = () => {
  isEditingSubtasks.value = !isEditingSubtasks.value
  if (!isEditingSubtasks.value) {
    cancelSubtaskEdit()
  }
}

const startEditingSubtask = (subtaskId: string, title: string) => {
  editingSubtaskId.value = subtaskId
  editingSubtaskTitle.value = title
}

const cancelSubtaskEdit = () => {
  editingSubtaskId.value = null
  editingSubtaskTitle.value = ''
}

const saveSubtaskEdit = async (subtaskId: string) => {
  if (!props.playbook || !props.task || !editingSubtaskTitle.value.trim() || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.updateSubtask(
      props.playbook.id, 
      props.task.id, 
      subtaskId, 
      { title: editingSubtaskTitle.value.trim() }
    )
    emit('refresh')
    cancelSubtaskEdit()
  } catch (error) {
    console.error('Failed to update subtask:', error)
    alert('Failed to update subtask')
  } finally {
    loading.value = false
  }
}

// Comments
const loadComments = async () => {
  if (!props.playbook || !props.task) return
  
  try {
    comments.value = await playbooksApi.getComments(props.playbook.id, props.task.id)
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const addComment = async () => {
  if (!props.playbook || !props.task || !newCommentContent.value.trim() || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.addComment(props.playbook.id, props.task.id, newCommentContent.value.trim())
    newCommentContent.value = ''
    await loadComments()
  } catch (error) {
    console.error('Failed to add comment:', error)
    alert('Failed to add comment')
  } finally {
    loading.value = false
  }
}

const startEditComment = (comment: TaskComment) => {
  editingCommentId.value = comment.id
  editCommentContent.value = comment.content
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editCommentContent.value = ''
}

const saveEditComment = async (commentId: number) => {
  if (!props.playbook || !props.task || !editCommentContent.value.trim() || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.updateComment(
      props.playbook.id, 
      props.task.id, 
      commentId, 
      editCommentContent.value.trim()
    )
    editingCommentId.value = null
    editCommentContent.value = ''
    await loadComments()
  } catch (error) {
    console.error('Failed to update comment:', error)
    alert('Failed to update comment')
  } finally {
    loading.value = false
  }
}

const deleteComment = async (commentId: number) => {
  if (!props.playbook || !props.task || loading.value) return
  if (!confirm('Delete this comment?')) return
  
  loading.value = true
  try {
    await playbooksApi.deleteComment(props.playbook.id, props.task.id, commentId)
    await loadComments()
  } catch (error) {
    console.error('Failed to delete comment:', error)
    alert('Failed to delete comment')
  } finally {
    loading.value = false
  }
}

// Watch for task changes
watch(() => props.task, (newTask) => {
  if (newTask && props.modelValue) {
    loadComments()
  }
}, { immediate: true })

watch(showAddSubtask, async (show) => {
  if (show) {
    await nextTick()
    subtaskInput.value?.focus()
  }
})
</script>

<style scoped>
.full-task-page {
  padding: 3rem;
  position: relative;
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color var(--transition-base);
  padding: 0;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-button:hover {
  color: var(--color-text-primary);
}

.task-header {
  margin-bottom: 32px;
}

.task-header h2 {
  font-size: 28px;
  font-weight: 300;
  margin: 0 0 16px 0;
  color: #2c2c2c;
}

.task-view-mode .task-description {
  margin-bottom: 20px;
}

/* Status Section */
.task-status-section {
  margin-top: 32px;
}

.task-status-section .section-label {
  display: block;
  margin-bottom: 0.75rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 2px;
  transition: all var(--transition-base);
}

.status-in-progress {
  background: rgba(232, 180, 160, 0.15);
  color: var(--color-accent-1);
  border: 1px solid var(--color-accent-1);
}

.status-completed {
  background: rgba(184, 212, 200, 0.15);
  color: var(--color-accent-2);
  border: 1px solid var(--color-accent-2);
}

.task-actions-section {
  margin-top: 32px;
}

.task-actions-section .section-label {
  display: block;
  margin-bottom: 1rem;
}

.task-actions-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

.task-action-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.task-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.task-edit-mode {
  background: var(--color-bg-secondary);
  border-radius: 4px;
  padding: 2rem;
}

.task-status {
  margin-top: 16px;
}

.task-section {
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e8e8e8;
}

.task-section:last-child {
  border-bottom: none;
}

.task-section h3 {
  font-size: 16px;
  font-weight: 400;
  margin: 0 0 20px 0;
  color: #2c2c2c;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.task-description {
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
  color: #4a4a4a;
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
}

/* Checkbox Container */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 300;
}

.checkbox-container input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-container span.completed {
  text-decoration: line-through;
  color: #999;
}

/* Members */
.assigned-members {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.checkbox-container-card {
  position: absolute;
  top: -8px;
  right: -8px;
  cursor: pointer;
}

.checkbox-container-card input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-accent-2);
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
}

.member-circle-creator {
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

.remove-member-btn-action {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid #e85d4d;
  color: #e85d4d;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  border-radius: 3px;
}

.remove-member-btn-action:hover {
  background: #e85d4d;
  color: white;
}

.remove-member-btn-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

/* Subtasks */
.add-subtask-form {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
}

.add-subtask-form input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 15px;
  font-weight: 300;
  margin-bottom: 12px;
  background: white;
}

.add-subtask-form input:focus {
  outline: none;
  border-color: #e8b4a0;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtask-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fafafa;
  transition: background 0.2s;
}

.subtask-item:hover {
  background: #f5f5f5;
}

.subtask-item .checkbox-container {
  flex: 1;
}

.btn-delete {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  font-weight: 300;
}

.btn-delete:hover {
  color: #e74c3c;
}

.btn-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Comments */
.add-comment-form {
  margin-bottom: 24px;
}

.add-comment-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 15px;
  font-weight: 300;
  margin-bottom: 12px;
  resize: vertical;
  background: white;
}

.add-comment-form textarea:focus {
  outline: none;
  border-color: #e8b4a0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 16px;
  background: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  background: #b8d4c8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 12px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.author-name {
  font-weight: 400;
  font-size: 14px;
}

.comment-date {
  font-size: 12px;
  color: #999;
  font-weight: 300;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.comment-content {
  font-size: 15px;
  font-weight: 300;
  line-height: 1.6;
  color: #4a4a4a;
  margin: 0;
  white-space: pre-wrap;
}

.edit-comment-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 15px;
  font-weight: 300;
  margin-bottom: 12px;
  resize: vertical;
  background: white;
}

.edit-comment-form textarea:focus {
  outline: none;
  border-color: #e8b4a0;
}

.empty-state {
  font-size: 14px;
  color: #999;
  font-weight: 300;
  font-style: italic;
}

/* Buttons */
.btn-text {
  background: none;
  border: none;
  color: #e8b4a0;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.btn-text:hover {
  opacity: 0.7;
}

.btn-text:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-text-small {
  background: none;
  border: none;
  color: #999;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.btn-text-small:hover {
  color: #e8b4a0;
}

.btn-text-small:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-sm {
  padding: 8px 20px;
  background: #2c2c2c;
  color: white;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-sm:hover {
  opacity: 0.8;
}

.btn-sm:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Action buttons */
.btn-text-action {
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

.btn-text-action:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.btn-text-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Timeline styling */
.task-due-date {
  margin-bottom: 2rem;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-content {
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

/* Assign member modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--container-padding);
}

.assign-member-modal {
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-2);
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(42, 42, 42, 0.2);
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.modal-content-inner {
  padding: 2rem;
  background: var(--color-bg-secondary);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin: 0;
  text-align: left;
  color: var(--color-text-primary);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.modal-close-btn:hover {
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.05);
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: left;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.modal-search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  font-family: var(--font-family);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  margin-bottom: 1.5rem;
  transition: border-color var(--transition-base);
}

.modal-search-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.modal-search-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.modal-members-list {
  max-height: 320px;
  overflow-y: auto;
}

.modal-member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  cursor: pointer;
  transition: background var(--transition-base);
}

.modal-member-item:last-child {
  border-bottom: none;
}

.modal-member-item:hover:not(.disabled) {
  background: rgba(42, 42, 42, 0.02);
}

.modal-member-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d0d0d0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.modal-member-avatar.is-creator {
  background: linear-gradient(135deg, #e8b4a0, #b8d4c8, #c9b8e8);
}

.modal-member-info {
  flex: 1;
}

.modal-member-name {
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.modal-member-role {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-empty-message {
  text-align: left;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  padding: 1rem 0;
  margin: 0;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .assign-member-modal,
.modal-leave-active .assign-member-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .assign-member-modal,
.modal-leave-to .assign-member-modal {
  transform: scale(0.95);
  opacity: 0;
}

/* Button styling matching FullPlaybookPage */
.btn-text-assignee {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
  transition: color var(--transition-base);
  padding: 0;
  margin-left: 1rem;
}

.btn-text-assignee:first-child {
  margin-left: 0;
}

.btn-text-assignee:hover {
  color: var(--color-text-primary);
}

.btn-text-assignee:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Subtask edit input */
.subtask-edit-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--color-accent-1);
  font-family: inherit;
  font-size: 14px;
  font-weight: 300;
  background: white;
  outline: none;
}

.subtask-edit-input:focus {
  border-color: var(--color-accent-2);
}
</style>
