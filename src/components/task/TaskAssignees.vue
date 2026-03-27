<template>
  <div class="task-section" v-if="canManage">
    <div class="section-header">
      <h3>Assigned To</h3>
      <div class="section-header-actions">
        <button 
          class="btn-text-assignee" 
          @click="$emit('showAssignModal')"
          :disabled="loading"
        >
          + Assign Member
        </button>
        <button 
          v-if="assignedMembers.length > 0"
          class="btn-text-assignee" 
          @click="$emit('toggleEditMode')"
          :disabled="loading"
        >
          {{ isEditingAssignees ? 'Done' : 'Edit' }}
        </button>
      </div>
    </div>
    
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
          @click="$emit('unassignMember', member.user.id)"
          :disabled="loading"
        >
          Remove
        </button>
      </div>
    </div>
    <p v-else class="text-xs text-tertiary">No members assigned yet</p>
  </div>
</template>

<script setup lang="ts">
import { getInitials } from '@/utils/formatters'
import type { PlaybookMember } from '@/types/collaboration'

defineProps<{
  canManage: boolean
  loading: boolean
  isEditingAssignees: boolean
  assignedMembers: PlaybookMember[]
}>()

defineEmits<{
  showAssignModal: []
  toggleEditMode: []
  unassignMember: [userId: number]
}>()
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
</style>
