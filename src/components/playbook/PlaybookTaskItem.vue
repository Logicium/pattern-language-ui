<template>
  <div class="task-item" :data-accent="accentColor">
    <div ref="swapEl" class="task-swap">
    <Transition
      name="mode-blur"
      mode="out-in"
      @before-leave="lockHeight"
      @enter="animateToContent"
    >
    <!-- Task Display Mode -->
    <div v-if="editingTaskId !== task.id" key="view" class="task-main" @click="onTaskClick">
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
    <div v-else-if="isUserMember" key="edit" class="task-edit-form">
      <!-- Save/Cancel sit where the Edit button was, so the eye never travels -->
      <div class="edit-header-row">
        <span class="edit-label text-xs text-tertiary">Editing Task</span>
        <div class="task-actions">
          <button @click="$emit('saveEdit')" class="task-action-btn task-action-primary text-xs" type="button">Save</button>
          <button @click="$emit('cancelEdit')" class="task-action-btn text-xs" type="button">Cancel</button>
          <button @click="$emit('deleteTask', task.id)" class="task-action-btn task-action-danger text-xs" type="button">Delete</button>
        </div>
      </div>
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
    </div>
    </Transition>
    </div>

    <!-- Expandable Notes Section — height animates via interpolate-size -->
    <div
      v-if="isUserMember"
      class="task-notes-section"
      :class="{ expanded: expandedTaskNotes[task.id] }"
    >
      <div class="task-notes-inner">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

// The view<->edit swap replaces content, so no height property ever changes
// on its own — lock the wrapper at the old height, then transition it to the
// incoming content's height while the blur crossfade runs. The inline height
// is released only when the HEIGHT transition ends (the blur finishes much
// earlier — releasing there retargets the animation mid-flight and jitters).
const swapEl = ref<HTMLElement | null>(null)
let heightEndHandler: ((e: TransitionEvent) => void) | null = null

const clearHeightHandler = () => {
  if (heightEndHandler && swapEl.value) {
    swapEl.value.removeEventListener('transitionend', heightEndHandler)
    heightEndHandler = null
  }
}

const lockHeight = () => {
  const el = swapEl.value
  if (!el) return
  clearHeightHandler()
  el.style.height = `${el.offsetHeight}px`
}

const animateToContent = () => {
  const el = swapEl.value
  if (!el) return
  requestAnimationFrame(() => {
    const target = el.scrollHeight
    if (target === el.offsetHeight) {
      el.style.height = ''
      return
    }
    el.style.height = `${target}px`
    heightEndHandler = (e: TransitionEvent) => {
      if (e.target !== el || e.propertyName !== 'height') return
      el.style.height = ''
      clearHeightHandler()
    }
    el.addEventListener('transitionend', heightEndHandler)
  })
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

.task-swap {
  overflow: clip;
  transition: height var(--transition-base);
}

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

/* No margin here: the height animation measures scrollHeight, which cannot
   see child margins — a margin would make the target land short and pop. */
.task-edit-form {
  padding: 1.5rem 1.5rem 2rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.edit-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.edit-label {
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.task-action-primary {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
}

.task-action-danger:hover {
  color: var(--color-accent-warm);
  border-color: var(--color-accent-warm);
}

/* Collapsed by default; `interpolate-size: allow-keywords` on :root lets the
   height animate to auto in supporting browsers (snaps gracefully elsewhere). */
.task-notes-section {
  height: 0;
  overflow: clip;
  border-top: 1px solid transparent;
  background: var(--color-bg-secondary);
  transition: height var(--transition-fast), border-color var(--transition-fast);
}

.task-notes-section.expanded {
  height: auto;
  border-top-color: rgba(42, 42, 42, 0.08);
}

.task-notes-inner {
  padding: 1rem 1.5rem 1.5rem;
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
