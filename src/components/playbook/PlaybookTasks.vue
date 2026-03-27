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
          @click="$emit('startAddingTask')" 
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
        <label class="text-xs text-tertiary">Phase</label>
        <select 
          :value="newTask.phase" 
          @change="$emit('update:newTask', { ...newTask, phase: Number(($event.target as HTMLSelectElement).value) })"
          class="form-input"
        >
          <option :value="1">Phase 1: Planning</option>
          <option :value="2">Phase 2: Development</option>
          <option :value="3">Phase 3: Testing & Launch</option>
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

    <div class="tasks-list">
      <!-- Phase 1: Planning -->
      <div v-if="tasksByPhase.planning.length > 0" class="phase-section">
        <h3 class="phase-title text-xs text-tertiary">PHASE 1: PLANNING</h3>
        <PlaybookTaskItem
          v-for="task in tasksByPhase.planning"
          :key="task.id"
          :task="task"
          :accent-color="1"
          :is-user-member="isUserMember"
          :editing-task-id="editingTaskId"
          :editing-task="editingTask"
          :expanded-task-notes="expandedTaskNotes"
          :task-notes="taskNotes"
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

      <!-- Phase 2: Development -->
      <div v-if="tasksByPhase.development.length > 0" class="phase-section">
        <h3 class="phase-title text-xs text-tertiary">PHASE 2: DEVELOPMENT</h3>
        <PlaybookTaskItem
          v-for="task in tasksByPhase.development"
          :key="task.id"
          :task="task"
          :accent-color="2"
          :is-user-member="isUserMember"
          :editing-task-id="editingTaskId"
          :editing-task="editingTask"
          :expanded-task-notes="expandedTaskNotes"
          :task-notes="taskNotes"
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

      <!-- Phase 3: Testing & Launch -->
      <div v-if="tasksByPhase.testing.length > 0" class="phase-section">
        <h3 class="phase-title text-xs text-tertiary">PHASE 3: TESTING & LAUNCH</h3>
        <PlaybookTaskItem
          v-for="task in tasksByPhase.testing"
          :key="task.id"
          :task="task"
          :accent-color="3"
          :is-user-member="isUserMember"
          :editing-task-id="editingTaskId"
          :editing-task="editingTask"
          :expanded-task-notes="expandedTaskNotes"
          :task-notes="taskNotes"
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

      <!-- Ungrouped Tasks -->
      <div v-if="tasksByPhase.ungrouped.length > 0" class="phase-section">
        <h3 class="phase-title text-xs text-tertiary">UNGROUPED TASKS</h3>
        <PlaybookTaskItem
          v-for="(task, index) in tasksByPhase.ungrouped"
          :key="task.id"
          :task="task"
          :accent-color="((index % 3) + 1)"
          :is-user-member="isUserMember"
          :editing-task-id="editingTaskId"
          :editing-task="editingTask"
          :expanded-task-notes="expandedTaskNotes"
          :task-notes="taskNotes"
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
  </div>
</template>

<script setup lang="ts">
import PlaybookTaskItem from './PlaybookTaskItem.vue'

defineProps<{
  playbook: any
  isUserMember: boolean
  isAddingTask: boolean
  newTask: { title: string; description: string; dueDate: string; phase: number }
  editingTaskId: string | null
  editingTask: { title: string; description: string; dueDate: string; phase: number }
  expandedTaskNotes: Record<string, boolean>
  taskNotes: Record<string, string>
  completedTasksCount: number
  tasksByPhase: {
    planning: any[]
    development: any[]
    testing: any[]
    ungrouped: any[]
  }
}>()

defineEmits<{
  startAddingTask: []
  'update:newTask': [value: { title: string; description: string; dueDate: string; phase: number }]
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
  'update:editingTask': [value: { title: string; description: string; dueDate: string; phase: number }]
}>()
</script>

<style scoped>
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
}

.phase-title {
  padding: 0 1.5rem 1rem;
  letter-spacing: 0.08em;
  font-weight: 500;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
  }
}
</style>
