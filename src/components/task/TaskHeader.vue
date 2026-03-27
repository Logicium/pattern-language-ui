<template>
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
            @click="$emit('toggleCompletion')"
            :disabled="loading"
          >
            {{ task.completed ? 'Resume Task' : 'Mark Complete' }}
          </button>
          <button 
            v-if="canManage"
            class="task-action-btn text-xs"
            @click="$emit('startEditing')"
            :disabled="loading"
          >
            Edit
          </button>
          <button 
            v-if="canManage"
            class="task-action-btn text-xs"
            @click="$emit('showDelete')"
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
          :value="editableTask.title"
          @input="$emit('update:editableTask', { ...editableTask, title: ($event.target as HTMLInputElement).value })"
          type="text"
          class="form-input"
          placeholder="Enter task title..."
        />
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Description</label>
        <textarea
          :value="editableTask.description"
          @input="$emit('update:editableTask', { ...editableTask, description: ($event.target as HTMLTextAreaElement).value })"
          class="form-textarea"
          rows="3"
          placeholder="Enter task description..."
        ></textarea>
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Due Date</label>
        <input
          :value="editableTask.dueDate"
          @input="$emit('update:editableTask', { ...editableTask, dueDate: ($event.target as HTMLInputElement).value })"
          type="date"
          class="form-input"
        />
      </div>
      <div class="form-actions">
        <button class="btn btn-sm" @click="$emit('saveEdit')" :disabled="!editableTask.title.trim() || loading">
          Save
        </button>
        <button class="btn-text" @click="$emit('cancelEditing')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/types/collaboration'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

defineProps<{
  task: Task
  isEditingTask: boolean
  editableTask: { title: string; description: string; dueDate: string }
  canManage: boolean
  loading: boolean
}>()

defineEmits<{
  toggleCompletion: []
  startEditing: []
  showDelete: []
  saveEdit: []
  cancelEditing: []
  'update:editableTask': [value: { title: string; description: string; dueDate: string }]
}>()
</script>

<style scoped>
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

.task-description {
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
  color: #4a4a4a;
  margin: 0;
}

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

/* Due date timeline */
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

.timeline-marker[data-accent="1"] { background: var(--color-accent-1); }
.timeline-marker[data-accent="2"] { background: var(--color-accent-2); }
.timeline-marker[data-accent="3"] { background: var(--color-accent-3); }

.timeline-date {
  margin: 0;
  color: var(--color-text-primary);
}

/* Form styles */
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
