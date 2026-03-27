<template>
  <div class="task-section">
    <div class="section-header">
      <h3>Subtasks</h3>
      <div class="section-header-actions">
        <button 
          v-if="canManage"
          class="btn-text-assignee" 
          @click="$emit('showAddSubtask')"
          :disabled="loading"
        >
          + Add Subtask
        </button>
        <button 
          v-if="canManage && subtasks && subtasks.length > 0"
          class="btn-text-assignee" 
          @click="$emit('toggleEditMode')"
          :disabled="loading"
        >
          {{ isEditingSubtasks ? 'Done' : 'Edit' }}
        </button>
      </div>
    </div>

    <div v-if="showAddSubtask" class="add-subtask-form">
      <input 
        v-model="localNewTitle"
        type="text" 
        placeholder="Subtask title..."
        @keyup.enter="$emit('addSubtask', localNewTitle)"
        @keyup.esc="$emit('cancelAdd')"
        ref="subtaskInput"
      />
      <div class="form-actions">
        <button class="btn-sm" @click="$emit('addSubtask', localNewTitle)" :disabled="!localNewTitle.trim() || loading">
          Add
        </button>
        <button class="btn-text" @click="$emit('cancelAdd')">Cancel</button>
      </div>
    </div>

    <div v-if="subtasks && subtasks.length > 0" class="subtasks-list">
      <div 
        v-for="subtask in subtasks" 
        :key="subtask.id"
        class="subtask-item"
      >
        <label class="checkbox-container">
          <input 
            v-if="!isEditingSubtasks"
            type="checkbox" 
            :checked="subtask.completed"
            @change="$emit('toggleSubtask', subtask.id)"
            :disabled="loading"
          />
          <input 
            v-if="isEditingSubtasks && editingSubtaskId === subtask.id"
            v-model="localEditTitle"
            type="text"
            class="subtask-edit-input"
            @keyup.enter="$emit('saveSubtaskEdit', subtask.id, localEditTitle)"
            @keyup.esc="$emit('cancelSubtaskEdit')"
            @blur="$emit('saveSubtaskEdit', subtask.id, localEditTitle)"
          />
          <span 
            v-else
            :class="{ completed: subtask.completed }"
            @click="isEditingSubtasks ? $emit('startEditSubtask', subtask.id, subtask.title) : null"
            :style="{ cursor: isEditingSubtasks ? 'pointer' : 'default' }"
          >
            {{ subtask.title }}
          </span>
        </label>
        <button 
          v-if="isEditingSubtasks"
          class="btn-delete" 
          @click="$emit('deleteSubtask', subtask.id)"
          :disabled="loading"
          title="Delete subtask"
        >
          ×
        </button>
      </div>
    </div>
    <p v-else class="empty-state">No subtasks yet</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Subtask } from '@/types/collaboration'

const props = defineProps<{
  subtasks: Subtask[] | undefined
  canManage: boolean
  loading: boolean
  isEditingSubtasks: boolean
  editingSubtaskId: string | null
  editingSubtaskTitle: string
  showAddSubtask: boolean
}>()

defineEmits<{
  showAddSubtask: []
  toggleEditMode: []
  addSubtask: [title: string]
  cancelAdd: []
  toggleSubtask: [subtaskId: string]
  startEditSubtask: [subtaskId: string, title: string]
  saveSubtaskEdit: [subtaskId: string, title: string]
  cancelSubtaskEdit: []
  deleteSubtask: [subtaskId: string]
}>()

const localNewTitle = ref('')
const localEditTitle = ref('')
const subtaskInput = ref<HTMLInputElement | null>(null)

watch(() => props.editingSubtaskTitle, (val) => {
  localEditTitle.value = val
})

watch(() => props.showAddSubtask, (val) => {
  if (!val) localNewTitle.value = ''
})
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
}

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

.empty-state {
  font-size: 14px;
  color: #999;
  font-weight: 300;
  font-style: italic;
}

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
