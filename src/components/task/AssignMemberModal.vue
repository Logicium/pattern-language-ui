<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container assign-member-modal" @click.stop>
          <div class="modal-header-custom">
            <h3 class="modal-title">Assign Member</h3>
            <button @click="$emit('close')" class="modal-close-btn" aria-label="Close">×</button>
          </div>
          <div class="modal-content-inner">
            <p class="modal-subtitle">Select a member to assign to this task</p>
            
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              type="text"
              class="modal-search-input"
              placeholder="Search members..."
            />

            <div v-if="filteredMembers.length > 0" class="modal-members-list">
              <div
                v-for="member in filteredMembers"
                :key="member.user.id"
                class="modal-member-item"
                @click="$emit('assignMember', member.user.id)"
                :class="{ 'disabled': loading }"
              >
                <div 
                  class="modal-member-avatar" 
                  :class="{ 'is-creator': member.role === 'creator' }"
                >
                  {{ getInitials(member.user.name) }}
                </div>
                <div class="modal-member-info">
                  <div class="modal-member-name">{{ member.user.name }}</div>
                  <div class="modal-member-role">{{ member.role === 'creator' ? 'Creator' : 'Member' }}</div>
                </div>
              </div>
            </div>
            <p v-else class="modal-empty-message">
              {{ searchQuery ? 'No members found' : 'All members are already assigned' }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { getInitials } from '@/utils/formatters'
import type { PlaybookMember } from '@/types/collaboration'

defineProps<{
  show: boolean
  searchQuery: string
  filteredMembers: PlaybookMember[]
  loading: boolean
}>()

defineEmits<{
  close: []
  'update:searchQuery': [value: string]
  assignMember: [userId: number]
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--container-padding);
}

.assign-member-modal {
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-2);
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(42, 42, 42, 0.2);
}

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.modal-content-inner {
  padding: 2rem;
  background: var(--color-bg-secondary);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin: 0;
  text-align: left;
  color: var(--color-text-primary);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.modal-close-btn:hover {
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.05);
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: left;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.modal-search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  font-family: var(--font-family);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  margin-bottom: 1.5rem;
  transition: border-color var(--transition-base);
}

.modal-search-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.modal-search-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.modal-members-list {
  max-height: 320px;
  overflow-y: auto;
}

.modal-member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  cursor: pointer;
  transition: background var(--transition-base);
}

.modal-member-item:last-child {
  border-bottom: none;
}

.modal-member-item:hover:not(.disabled) {
  background: rgba(42, 42, 42, 0.02);
}

.modal-member-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d0d0d0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.modal-member-avatar.is-creator {
  background: linear-gradient(135deg, #e8b4a0, #b8d4c8, #c9b8e8);
}

.modal-member-info {
  flex: 1;
}

.modal-member-name {
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.modal-member-role {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-empty-message {
  text-align: left;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  padding: 1rem 0;
  margin: 0;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .assign-member-modal,
.modal-leave-active .assign-member-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .assign-member-modal,
.modal-leave-to .assign-member-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
