<template>
  <div class="content-block">
    <div class="block-header">
      <h2 class="section-subtitle">Implementation Tasks</h2>
      <div class="header-actions">
        <span class="text-xs text-tertiary">
          {{ completedTasksCount }} of {{ playbook.tasks.length }} complete
        </span>
        <button
          v-if="isUserMember"
          @click="$emit('startAddingSection')"
          class="btn-text text-xs"
        >
          + Add Section
        </button>
        <button
          v-if="isUserMember"
          @click="$emit('startAddingTask')"
          class="btn-text text-xs"
        >
          + Add Task
        </button>
      </div>
    </div>

    <!-- Add New Section Form -->
    <div v-if="isAddingSection && isUserMember" class="section-form">
      <div class="form-group">
        <label class="text-xs text-tertiary">Section Title</label>
        <input
          :value="newSectionTitle"
          @input="$emit('update:newSectionTitle', ($event.target as HTMLInputElement).value)"
          type="text"
          class="form-input"
          placeholder="Enter section title..."
          @keyup.enter="$emit('saveNewSection')"
        />
      </div>
      <div class="form-actions">
        <button @click="$emit('saveNewSection')" class="btn btn-sm">Add Section</button>
        <button @click="$emit('cancelAddingSection')" class="btn-text text-xs">Cancel</button>
      </div>
    </div>

    <!-- Add New Task Form -->
    <div v-if="isAddingTask && isUserMember" class="task-form">
      <div class="form-group">
        <label class="text-xs text-tertiary">Task Title</label>
        <input
          :value="newTask.title"
          @input="$emit('update:newTask', { ...newTask, title: ($event.target as HTMLInputElement).value })"
          type="text"
          class="form-input"
          placeholder="Enter task title..."
        />
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Description</label>
        <textarea
          :value="newTask.description"
          @input="$emit('update:newTask', { ...newTask, description: ($event.target as HTMLTextAreaElement).value })"
          class="form-textarea"
          rows="2"
          placeholder="Enter task description..."
        ></textarea>
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Section</label>
        <select
          :value="newTask.sectionId"
          @change="$emit('update:newTask', { ...newTask, sectionId: ($event.target as HTMLSelectElement).value })"
          class="form-input"
        >
          <option v-for="section in sections" :key="section.id" :value="section.id">
            {{ section.title }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label class="text-xs text-tertiary">Due Date</label>
        <input
          :value="newTask.dueDate"
          @input="$emit('update:newTask', { ...newTask, dueDate: ($event.target as HTMLInputElement).value })"
          type="date"
          class="form-input"
        />
      </div>
      <div class="form-actions">
        <button @click="$emit('saveNewTask')" class="btn btn-sm">Add Task</button>
        <button @click="$emit('cancelAddingTask')" class="btn-text text-xs">Cancel</button>
      </div>
    </div>

    <!-- Sections Container (raw SortableJS) -->
    <div ref="sectionsContainerRef" class="tasks-list">
      <div
        v-for="(section, sIndex) in localSections"
        :key="section.id"
        :data-section-id="section.id"
        :class="['phase-section', { 'ungrouped-section': section.id === '__ungrouped__' }]"
      >
        <!-- Section Header -->
        <div class="section-header">
          <div v-if="isUserMember && section.id !== '__ungrouped__'" class="section-drag-handle" title="Drag to reorder section">
            <svg class="drag-icon" width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
              <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
            </svg>
          </div>

          <div v-if="section.id !== '__ungrouped__' && editingSectionId === section.id" class="section-title-edit">
            <input
              :value="editingSectionTitle"
              @input="$emit('update:editingSectionTitle', ($event.target as HTMLInputElement).value)"
              type="text"
              class="section-title-input"
              @keyup.enter="$emit('saveSectionEdit')"
              @keyup.escape="$emit('cancelSectionEdit')"
            />
            <button @click="$emit('saveSectionEdit')" class="section-action-btn text-xs">Save</button>
            <button @click="$emit('cancelSectionEdit')" class="section-action-btn text-xs">Cancel</button>
          </div>
          <h3 v-else class="phase-title text-xs text-tertiary">
            {{ section.title.toUpperCase() }}
          </h3>

          <div v-if="isUserMember && section.id !== '__ungrouped__' && editingSectionId !== section.id" class="section-actions">
            <button
              @click="$emit('startEditingSection', section.id)"
              class="section-action-btn text-xs"
              title="Rename section"
            >
              Edit
            </button>
            <button
              @click="$emit('deleteSection', section.id)"
              class="section-action-btn text-xs text-danger"
              title="Delete section"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Task Container — SortableJS init via onMounted + querySelectorAll -->
        <div
          :data-section-id="section.id"
          class="task-drag-zone"
        >
          <div
            v-for="task in section.tasks"
            :key="task.id"
            :data-id="task.id"
            class="task-drag-item"
          >
            <PlaybookTaskItem
              :task="task"
              :accent-color="(sIndex % 3) + 1"
              :is-user-member="isUserMember"
              :editing-task-id="editingTaskId"
              :editing-task="editingTask"
              :expanded-task-notes="expandedTaskNotes"
              :task-notes="taskNotes"
              :sections="sections"
              @toggle-task="$emit('toggleTask', $event)"
              @view-task="$emit('viewTask', $event)"
              @start-edit="$emit('startEditTask', $event)"
              @toggle-notes="$emit('toggleNotes', $event)"
              @save-edit="$emit('saveTaskEdit')"
              @cancel-edit="$emit('cancelTaskEdit')"
              @delete-task="$emit('deleteTask', $event)"
              @update-notes="$emit('updateNotes', $event[0] ?? $event, $event[1] ?? '')"
              @update:editing-task="$emit('update:editingTask', $event)"
            />
          </div>
        </div>

        <div v-if="section.tasks.length === 0" class="empty-section">
          <span class="text-xs text-tertiary">No tasks — drag tasks here or add a new one</span>
        </div>
      </div>

      <!-- Ungrouped tasks are now included in localSections as a virtual '__ungrouped__' section -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sortable from 'sortablejs'
import PlaybookTaskItem from './PlaybookTaskItem.vue'
import type { PlaybookSection } from '@/stores/playbooks'

const props = defineProps<{
  playbook: any
  isUserMember: boolean
  isAddingTask: boolean
  newTask: { title: string; description: string; dueDate: string; sectionId: string }
  editingTaskId: string | null
  editingTask: { title: string; description: string; dueDate: string; sectionId: string }
  expandedTaskNotes: Record<string, boolean>
  taskNotes: Record<string, string>
  completedTasksCount: number
  sections: PlaybookSection[]
  ungroupedTasks: any[]
  getTasksForSection: (sectionId: string) => any[]
  isAddingSection: boolean
  newSectionTitle: string
  editingSectionId: string | null
  editingSectionTitle: string
}>()

const emit = defineEmits<{
  startAddingTask: []
  'update:newTask': [value: { title: string; description: string; dueDate: string; sectionId: string }]
  saveNewTask: []
  cancelAddingTask: []
  toggleTask: [taskId: string]
  viewTask: [task: any]
  startEditTask: [task: any]
  toggleNotes: [taskId: string]
  saveTaskEdit: []
  cancelTaskEdit: []
  deleteTask: [taskId: string]
  updateNotes: [taskId: string, value: string]
  'update:editingTask': [value: { title: string; description: string; dueDate: string; sectionId: string }]
  startAddingSection: []
  cancelAddingSection: []
  saveNewSection: []
  'update:newSectionTitle': [value: string]
  startEditingSection: [sectionId: string]
  cancelSectionEdit: []
  saveSectionEdit: []
  'update:editingSectionTitle': [value: string]
  deleteSection: [sectionId: string]
  sectionsReorder: [sections: PlaybookSection[]]
  tasksReorder: [sectionId: string, tasks: any[]]
}>()

// --- Data ---
const UNGROUPED_ID = '__ungrouped__'

interface SectionWithTasks {
  id: string
  title: string
  tasks: any[]
}

const localSections = ref<SectionWithTasks[]>([])
const isDragging = ref(false)

function rebuildLocalSections() {
  const grouped = props.sections.map(s => ({
    id: s.id,
    title: s.title,
    tasks: props.getTasksForSection(s.id).map((t: any) => ({ ...t }))
  }))
  // Add ungrouped tasks as a virtual section so they participate in drag-and-drop
  const ungrouped = (props.ungroupedTasks || []).map((t: any) => ({ ...t }))
  if (ungrouped.length > 0) {
    grouped.push({ id: UNGROUPED_ID, title: 'Ungrouped', tasks: ungrouped })
  }
  localSections.value = grouped
}

watch([() => props.sections, () => props.playbook?.tasks], () => {
  if (!isDragging.value) {
    rebuildLocalSections()
    // Re-init task sortables after DOM updates
    nextTick(() => initTaskSortables())
  }
}, { immediate: true, deep: true })

// --- Sections sortable (single container, template ref — this WORKS) ---
const sectionsContainerRef = ref<HTMLElement | null>(null)
let sectionsSortable: Sortable | null = null

function initSectionsSortable() {
  if (!sectionsContainerRef.value) return
  sectionsSortable?.destroy()
  sectionsSortable = new Sortable(sectionsContainerRef.value, {
    animation: 200,
    handle: '.section-drag-handle',
    ghostClass: 'drag-ghost-section',
    dragClass: 'drag-active-section',
    forceFallback: true,
    draggable: '.phase-section:not(.ungrouped-section)',
    onEnd: (evt) => {
      if (evt.oldIndex == null || evt.newIndex == null) return
      const moved = localSections.value.splice(evt.oldIndex, 1)[0]
      if (moved) {
        localSections.value.splice(evt.newIndex, 0, moved)
        // Only emit real sections (not the virtual ungrouped)
        emit('sectionsReorder', localSections.value
          .filter(s => s.id !== UNGROUPED_ID)
          .map(s => ({ id: s.id, title: s.title })))
      }
    }
  })
}

// --- Task sortables ---
let taskSortableInstances: Sortable[] = []

function initTaskSortables() {
  // Destroy old instances
  taskSortableInstances.forEach(s => s.destroy())
  taskSortableInstances = []

  // Query all task zones in the DOM
  const zones = sectionsContainerRef.value?.querySelectorAll<HTMLElement>('.task-drag-zone[data-section-id]')
  if (!zones || zones.length === 0) return

  zones.forEach(zone => {
    const sectionId = zone.getAttribute('data-section-id')!

    const sortable = new Sortable(zone, {
      group: 'tasks',
      animation: 200,
      handle: '.task-drag-handle',
      ghostClass: 'drag-ghost-task',
      dragClass: 'drag-active-task',
      fallbackClass: 'drag-fallback-task',
      draggable: '.task-drag-item',
      forceFallback: true,
      fallbackOnBody: true,
      emptyInsertThreshold: 20,
      onStart: () => {
        isDragging.value = true
      },
      onEnd: () => {
        syncAllSectionsFromDOM()
        setTimeout(() => { isDragging.value = false }, 50)
      },
    })
    taskSortableInstances.push(sortable)
  })
}

function syncAllSectionsFromDOM() {
  const allTasks = localSections.value.flatMap(s => s.tasks)
  const zones = document.querySelectorAll<HTMLElement>('.task-drag-zone[data-section-id]')
  for (const zone of zones) {
    const sectionId = zone.getAttribute('data-section-id')!
    const section = localSections.value.find(s => s.id === sectionId)
    if (!section) continue
    const items = zone.querySelectorAll<HTMLElement>(':scope > .task-drag-item[data-id]')
    const taskIds = Array.from(items).map(el => el.getAttribute('data-id')!)
    const newTasks = taskIds
      .map(id => allTasks.find(t => t.id === id))
      .filter((t): t is any => !!t)
      .map(t => ({ ...t, sectionId: sectionId === UNGROUPED_ID ? undefined : sectionId }))
    section.tasks = newTasks
    emit('tasksReorder', sectionId === UNGROUPED_ID ? '' : sectionId, newTasks)
  }
}

onMounted(() => {
  nextTick(() => {
    initSectionsSortable()
    initTaskSortables()
  })
})

onBeforeUnmount(() => {
  sectionsSortable?.destroy()
  taskSortableInstances.forEach(s => s.destroy())
})
</script>

<style scoped>
.section-form {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.task-form {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  padding: 1.5rem 0 0;
}
.phase-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 2rem;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem 1rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
}
.section-drag-handle {
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  transition: opacity var(--transition-base), color var(--transition-base);
  min-width: 14px;
}
.section-drag-handle:hover {
  opacity: 1;
  color: var(--color-text-secondary);
}
.section-drag-handle:active {
  cursor: grabbing;
}
.drag-icon {
  display: block;
  width: 10px;
  height: 16px;
}
.phase-title {
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 0;
  flex: 1;
}
.section-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
.section-action-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.12);
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  white-space: nowrap;
}
.section-action-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}
.section-title-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.section-title-input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  font-family: var(--font-family);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  transition: border-color var(--transition-base);
}
.section-title-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
}
.task-drag-zone {
  min-height: 8px;
}
.task-drag-item {
  cursor: grab;
}
.task-drag-item:active {
  cursor: grabbing;
}
.empty-section {
  padding: 2rem 1.5rem;
  text-align: center;
  border: 1px dashed rgba(42, 42, 42, 0.1);
  margin: 0.75rem 1.5rem 1.5rem;
}
.ungrouped-section {
  opacity: 0.7;
}
@media (max-width: 768px) {
  .header-actions { flex-direction: column; align-items: flex-end; gap: 0.75rem; }
  .section-header { flex-wrap: wrap; }
  .section-actions { width: 100%; }
}
</style>

<!-- Unscoped: SortableJS applies these classes directly to DOM elements -->
<style>
.drag-ghost-section { opacity: 0.3; border-left: 2px solid var(--color-accent-2); }
.drag-active-section { opacity: 0.9; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); }
.drag-ghost-task { opacity: 0.3; border-left: 2px solid var(--color-accent-1); }
.drag-active-task { opacity: 0.9; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); background: var(--color-bg-primary); }
.drag-fallback-task { opacity: 0.9; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12); background: var(--color-bg-primary); z-index: 9999; }
</style>
