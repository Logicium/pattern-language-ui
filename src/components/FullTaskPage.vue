<template>
  <SlideInModal v-model="isOpen" title="Task Details">
    <div v-if="task && playbook" class="full-task-page">
      <button class="close-button" @click="isOpen = false" title="Close">← Back</button>

      <TaskHeader
        :task="task"
        :is-editing-task="isEditingTask"
        :editable-task="editableTask"
        :can-manage="canManage"
        :loading="loading"
        @toggle-completion="toggleTaskCompletion"
        @start-editing="startEditingTask"
        @show-delete="showDeleteConfirm = true"
        @save-edit="saveTaskEdit"
        @cancel-editing="cancelEditingTask"
      />

      <TaskAssignees
        :can-manage="canManage"
        :loading="loading"
        :is-editing-assignees="isEditingAssignees"
        :assigned-members="assignedMembers"
        @show-assign-modal="showAssignMemberModal = true"
        @toggle-edit-mode="toggleAssigneeEditMode"
        @unassign-member="unassignMember"
      />

      <AssignMemberModal
        :show="showAssignMemberModal"
        :search-query="memberSearchQuery"
        :filtered-members="filteredUnassignedMembers"
        :loading="loading"
        @close="showAssignMemberModal = false"
        @update:search-query="memberSearchQuery = $event"
        @assign-member="assignMember"
      />

      <TaskSubtasks
        :subtasks="task.subtasks"
        :can-manage="canManage"
        :loading="loading"
        :is-editing-subtasks="isEditingSubtasks"
        :editing-subtask-id="editingSubtaskId"
        :editing-subtask-title="editingSubtaskTitle"
        :show-add-subtask="showAddSubtask"
        @show-add-subtask="showAddSubtask = true"
        @toggle-edit-mode="toggleSubtaskEditMode"
        @add-subtask="handleAddSubtask"
        @cancel-add="cancelAddSubtask"
        @toggle-subtask="toggleSubtaskCompletion"
        @start-edit-subtask="startEditingSubtask"
        @save-subtask-edit="handleSaveSubtaskEdit"
        @cancel-subtask-edit="cancelSubtaskEdit"
        @delete-subtask="deleteSubtask"
      />

      <TaskComments
        :comments="comments"
        :can-comment="canComment"
        :loading="loading"
        :editing-comment-id="editingCommentId"
        :edit-comment-content="editCommentContent"
        :can-edit-comment="canEditComment"
        @add-comment="handleAddComment"
        @start-edit-comment="startEditComment"
        @save-edit-comment="handleSaveEditComment"
        @cancel-edit-comment="cancelEditComment"
        @delete-comment="deleteComment"
      />
    </div>
  </SlideInModal>

  <ConfirmModal
    v-model="showDeleteConfirm"
    title="Delete Task"
    message="Are you sure you want to delete this task? This action cannot be undone."
    confirm-text="Delete"
    cancel-text="Cancel"
    :danger="true"
    @confirm="deleteTask"
  />

  <Toast :show="showToast" :message="toastMessage" @update:show="showToast = $event" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SlideInModal from './SlideInModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import Toast from './Toast.vue'
import TaskHeader from './task/TaskHeader.vue'
import TaskAssignees from './task/TaskAssignees.vue'
import AssignMemberModal from './task/AssignMemberModal.vue'
import TaskSubtasks from './task/TaskSubtasks.vue'
import TaskComments from './task/TaskComments.vue'
import { useTaskPage } from '@/composables/useTaskPage'
import type { Task, PlaybookMember } from '@/types/collaboration'

interface Props {
  modelValue: boolean
  playbook: any
  task: Task | null
  members: PlaybookMember[]
  userRole?: 'creator' | 'collaborator' | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'refresh'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const {
  loading, isEditingTask, editableTask, showDeleteConfirm, showToast, toastMessage,
  isEditingAssignees, showAssignMemberModal, memberSearchQuery,
  isEditingSubtasks, editingSubtaskId, editingSubtaskTitle, showAddSubtask,
  newSubtaskTitle, newCommentContent, comments, editingCommentId, editCommentContent,
  canManage, canComment, canEditComment, assignedMembers, filteredUnassignedMembers,
  toggleTaskCompletion, deleteTask, startEditingTask, cancelEditingTask, saveTaskEdit,
  toggleAssigneeEditMode, assignMember, unassignMember,
  addSubtask, cancelAddSubtask, toggleSubtaskCompletion, deleteSubtask,
  toggleSubtaskEditMode, startEditingSubtask, cancelSubtaskEdit, saveSubtaskEdit,
  addComment, startEditComment, cancelEditComment, saveEditComment, deleteComment,
} = useTaskPage(props, emit)

// Bridge handlers for sub-components that pass data via emit payloads
const handleAddSubtask = (title: string) => { newSubtaskTitle.value = title; addSubtask() }
const handleAddComment = (content: string) => { newCommentContent.value = content; addComment() }
const handleSaveSubtaskEdit = (subtaskId: string, title: string) => { editingSubtaskTitle.value = title; saveSubtaskEdit(subtaskId) }
const handleSaveEditComment = (commentId: number, content: string) => { editCommentContent.value = content; saveEditComment(commentId) }
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
</style>
