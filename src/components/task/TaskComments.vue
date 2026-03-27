<template>
  <div class="task-section">
    <h3>Discussion</h3>
    
    <!-- Add Comment Form -->
    <div v-if="canComment" class="add-comment-form">
      <textarea 
        v-model="localContent"
        placeholder="Add a comment..."
        rows="3"
        @keydown.meta.enter="$emit('addComment', localContent)"
        @keydown.ctrl.enter="$emit('addComment', localContent)"
      ></textarea>
      <button 
        class="btn-sm" 
        @click="onAddComment"
        :disabled="!localContent.trim() || loading"
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
            <span class="comment-date">{{ formatRelativeDate(comment.createdAt) }}</span>
          </div>
          <div v-if="canEditComment(comment)" class="comment-actions">
            <button 
              class="btn-text-small" 
              @click="$emit('startEditComment', comment)"
              :disabled="loading"
            >
              Edit
            </button>
            <button 
              class="btn-text-small" 
              @click="$emit('deleteComment', comment.id)"
              :disabled="loading"
            >
              Delete
            </button>
          </div>
        </div>
        
        <div v-if="editingCommentId === comment.id" class="edit-comment-form">
          <textarea 
            v-model="localEditContent"
            rows="3"
            @keydown.esc="$emit('cancelEditComment')"
          ></textarea>
          <div class="form-actions">
            <button class="btn-sm" @click="$emit('saveEditComment', comment.id, localEditContent)" :disabled="!localEditContent.trim() || loading">
              Save
            </button>
            <button class="btn-text" @click="$emit('cancelEditComment')">Cancel</button>
          </div>
        </div>
        <p v-else class="comment-content">{{ comment.content }}</p>
      </div>
    </div>
    <p v-else class="empty-state">No comments yet</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getInitials } from '@/utils/formatters'
import type { TaskComment } from '@/types/collaboration'

const props = defineProps<{
  comments: TaskComment[]
  canComment: boolean
  loading: boolean
  editingCommentId: number | null
  editCommentContent: string
  canEditComment: (comment: TaskComment) => boolean
}>()

const emit = defineEmits<{
  addComment: [content: string]
  startEditComment: [comment: TaskComment]
  saveEditComment: [commentId: number, content: string]
  cancelEditComment: []
  deleteComment: [commentId: number]
}>()

const localContent = ref('')
const localEditContent = ref('')

watch(() => props.editCommentContent, (val) => {
  localEditContent.value = val
})

const onAddComment = () => {
  if (localContent.value.trim()) {
    emit('addComment', localContent.value)
    localContent.value = ''
  }
}

const formatRelativeDate = (dateString: string) => {
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
</script>

<style scoped>
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

.form-actions {
  display: flex;
  gap: 12px;
}

.empty-state {
  font-size: 14px;
  color: #999;
  font-weight: 300;
  font-style: italic;
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
</style>
