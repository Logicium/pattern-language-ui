<template>
  <div class="task-item" :data-accent="accentColor">
    <!-- Task Display Mode -->
    <div v-if="editingTaskId !== task.id" class="task-main" @click="onTaskClick">
      <div class="task-header-row">
        <div class="task-drag-handle" title="Drag to reorder">
          <svg class="drag-icon" width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
          </svg>
        </div>
        <div v-if="isUserMember" class="task-checkbox-wrapper">
          <AppCheckbox
            :model-value="task.completed"
            @change="$emit('toggleTask', task.id)"
          />
        </div>
        <div class="task-title-wrapper">
          <div class="task-title text-sm" :class="{ completed: task.completed }">
            {{ task.title }}
          </div>
        </div>
        <div v-if="isUserMember" class="task-actions">
          <button
            @click.stop="$emit('startEdit', task)"
            class="task-action-btn text-xs"
            type="button"
          >
            Edit
          </button>
          <button
            @click.stop="$emit('toggleNotes', task.id)"
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
          :value="editingTask.title"
          @input="$emit('update:editingTask', { ...editingTask, title: ($event.target as HTMLInputElement).value })"
          type="text"
          class="form-input"
          placeholder="Enter task title..."
        />
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Description</label>
        <textarea
          :value="editingTask.description"
          @input="$emit('update:editingTask', { ...editingTask, description: ($event.target as HTMLTextAreaElement).value })"
          class="form-textarea"
          rows="2"
          placeholder="Enter task description..."
        ></textarea>
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Section</label>
        <AppDropdown
          :model-value="editingTask.sectionId"
          :options="sections.map(s => ({ value: s.id, label: s.title }))"
          placeholder="Select section"
          @update:model-value="$emit('update:editingTask', { ...editingTask, sectionId: String($event) })"
        />
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Due Date</label>
        <input
          :value="editingTask.dueDate"
          @input="$emit('update:editingTask', { ...editingTask, dueDate: ($event.target as HTMLInputElement).value })"
          type="date"
          class="form-input"
        />
      </div>
      <div class="form-actions">
        <button @click="$emit('saveEdit')" class="btn btn-sm">Save</button>
        <button @click="$emit('cancelEdit')" class="btn-text text-xs">Cancel</button>
        <button @click="$emit('deleteTask', task.id)" class="btn-text text-xs text-danger">Delete Task</button>
      </div>
    </div>

    <!-- Expandable Notes Section -->
    <div v-if="expandedTaskNotes[task.id] && isUserMember" class="task-notes-section">
      <label class="text-xs text-tertiary" style="display: block; margin-bottom: 0.5rem;">
        Implementation Notes
      </label>
      <textarea
        :value="taskNotes[task.id]"
        @input="onNotesInput(task.id, ($event.target as HTMLTextAreaElement).value)"
        class="task-notes-textarea"
        rows="3"
        placeholder="Describe what you did to complete this task, any challenges faced, resources used, or lessons learned..."
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatters'
import type { PlaybookSection } from '@/stores/playbooks'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppDropdown from '@/components/AppDropdown.vue'

const props = defineProps<{
  task: any
  accentColor: string | number
  isUserMember: boolean
  editingTaskId: string | null
  editingTask: { title: string; description: string; dueDate: string; sectionId: string }
  expandedTaskNotes: Record<string, boolean>
  taskNotes: Record<string, string>
  sections: PlaybookSection[]
}>()

const emit = defineEmits<{
  toggleTask: [taskId: string]
  viewTask: [task: any]
  startEdit: [task: any]
  toggleNotes: [taskId: string]
  saveEdit: []
  cancelEdit: []
  deleteTask: [taskId: string]
  updateNotes: [taskId: string, value: string]
  'update:editingTask': [value: { title: string; description: string; dueDate: string; sectionId: string }]
}>()

const onNotesInput = (taskId: string, value: string) => {
  emit('updateNotes', taskId, value)
}

const onTaskClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('.task-drag-handle') || target.closest('.task-checkbox-wrapper') || target.closest('.task-actions')) return
  emit('viewTask', props.task)
}
</script>

<style scoped>
.task-item {
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.task-item:hover {
  background: var(--color-bg-secondary);
}

.task-item[data-accent="1"] { border-left-color: var(--color-accent-1); }
.task-item[data-accent="2"] { border-left-color: var(--color-accent-2); }
.task-item[data-accent="3"] { border-left-color: var(--color-accent-3); }

.task-main {
  display: flex;
  flex-direction: column;
  gap: 0;
  cursor: pointer;
}

.task-header-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.5rem 1.5rem 0.75rem;
}

.task-drag-handle {
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.125rem;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  transition: opacity var(--transition-base);
  flex-shrink: 0;
  min-width: 14px;
}

.task-drag-handle:hover {
  opacity: 1;
  color: var(--color-text-secondary);
}

.task-drag-handle:active {
  cursor: grabbing;
  opacity: 1;
}

.drag-icon {
  display: block;
  width: 10px;
  height: 16px;
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



.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.task-header-row + .task-content {
  padding-left: calc(1.5rem + 18px + 0.75rem);
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

.task-edit-form {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

@media (max-width: 768px) {
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
}
</style>
