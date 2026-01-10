<template>
  <SlideInModal v-model="isOpen" title="Task Details">
    <div v-if="task && playbook" class="full-task-page">
      <!-- Close Button -->
      <button class="close-button" @click="isOpen = false" title="Close">
        ← Back
      </button>

      <!-- Task Header -->
      <div class="task-header">
        <h2>{{ task.title }}</h2>
        <div class="task-status">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              :checked="task.completed"
              @change="toggleTaskCompletion"
              :disabled="loading"
            />
            <span>Mark as complete</span>
          </label>
        </div>
      </div>

      <!-- Task Description -->
      <div class="task-section">
        <p class="task-description">{{ task.description }}</p>
      </div>

      <!-- Assigned Members -->
      <div class="task-section" v-if="canManage">
        <h3>Assigned To</h3>
        <div class="assigned-members">
          <div 
            v-for="member in members" 
            :key="member.user.id"
            class="member-card"
            :class="{ 'member-creator': member.role === 'creator' }"
          >
            <label class="checkbox-container-card">
              <input 
                type="checkbox" 
                :checked="isAssigned(member.user.id)"
                @change="toggleAssignment(member.user.id)"
                :disabled="loading"
              />
            </label>
            <div 
              class="member-circle" 
              :class="{ 'member-circle-creator': member.role === 'creator' }"
            >
              {{ getInitials(member.user.name) }}
            </div>
            <div class="member-name text-xs">{{ member.user.name }}</div>
            <div v-if="member.role === 'creator'" class="member-role text-xs text-tertiary">Creator</div>
            <div v-else class="member-role text-xs text-tertiary">Member</div>
          </div>
        </div>
      </div>

      <!-- Subtasks -->
      <div class="task-section">
        <div class="section-header">
          <h3>Subtasks</h3>
          <button 
            v-if="canManage"
            class="btn-text" 
            @click="showAddSubtask = true"
            :disabled="loading"
          >
            + Add Subtask
          </button>
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
                type="checkbox" 
                :checked="subtask.completed"
                @change="toggleSubtaskCompletion(subtask.id)"
                :disabled="loading"
              />
              <span :class="{ completed: subtask.completed }">{{ subtask.title }}</span>
            </label>
            <button 
              v-if="canManage"
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
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { playbooksApi } from '../services/api'
import SlideInModal from './SlideInModal.vue'
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

// Member assignments
const isAssigned = (userId: number) => {
  return props.task?.assignedTo?.includes(userId) || false
}

const toggleAssignment = async (userId: number) => {
  if (!props.playbook || !props.task || loading.value) return
  
  const currentAssignments = props.task.assignedTo || []
  const newAssignments = isAssigned(userId)
    ? currentAssignments.filter(id => id !== userId)
    : [...currentAssignments, userId]
  
  loading.value = true
  try {
    await playbooksApi.assignTask(props.playbook.id, props.task.id, newAssignments)
    emit('refresh')
  } catch (error) {
    console.error('Failed to update assignments:', error)
    alert('Failed to update assignments')
  } finally {
    loading.value = false
  }
}

// Subtasks
const addSubtask = async () => {
  if (!props.playbook || !props.task || !newSubtaskTitle.value.trim() || loading.value) return
  
  loading.value = true
  try {
    await playbooksApi.addSubtask(props.playbook.id, props.task.id, newSubtaskTitle.value.trim())
    newSubtaskTitle.value = ''
    showAddSubtask.value = false
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
  if (!confirm('Delete this subtask?')) return
  
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
</style>
