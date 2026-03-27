<template>
  <SlideInModal :model-value="modelValue" title="Invite Member" @update:model-value="$emit('update:modelValue', $event)">
    <div class="invite-member-content">
      <button class="close-button" @click="$emit('update:modelValue', false)" title="Close">
        ← Back
      </button>

      <h2 class="modal-title">Invite Member</h2>
      
      <p class="text-sm text-secondary" style="margin-bottom: 20px;">
        Invite users from your local community to collaborate on this playbook.
      </p>
      
      <!-- Search Input -->
      <div class="form-group">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          class="form-input"
          placeholder="Search by name..."
        />
      </div>

      <!-- All Available Users -->
      <div class="users-list">
        <div
          v-for="user in filteredAvailableUsers"
          :key="user.id"
          class="user-result"
        >
          <div 
            class="user-avatar" 
            :style="{ backgroundImage: user.profileImage ? `url(${user.profileImage})` : 'none' }"
          >
            {{ !user.profileImage ? getInitials(user.name) : '' }}
          </div>
          <div class="user-info-result">
            <div class="user-name-result">{{ user.name }}</div>
            <div class="text-xs text-tertiary">{{ user.location }}, {{ user.state }}</div>
          </div>
          <button
            @click="$emit('inviteUser', user)"
            :disabled="loading || invitedUserIds.includes(user.id)"
            class="btn-sm"
          >
            {{ invitedUserIds.includes(user.id) ? 'Invited' : 'Invite' }}
          </button>
        </div>
      </div>
      <p v-if="filteredAvailableUsers.length === 0" class="text-xs text-tertiary">
        {{ searchQuery ? 'No users found matching your search' : 'No users available to invite' }}
      </p>
    </div>
  </SlideInModal>
</template>

<script setup lang="ts">
import SlideInModal from '@/components/SlideInModal.vue'
import { getInitials } from '@/utils/formatters'
import type { SearchedUser } from '@/types/collaboration'

defineProps<{
  modelValue: boolean
  searchQuery: string
  filteredAvailableUsers: SearchedUser[]
  invitedUserIds: number[]
  loading: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'update:searchQuery': [value: string]
  inviteUser: [user: SearchedUser]
}>()
</script>

<style scoped>
.invite-member-content {
  padding: 3rem;
  position: relative;
}

.invite-member-content .close-button {
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 16px;
  font-weight: 300;
  padding: 0;
  margin-bottom: 2rem;
  transition: color 0.2s;
}

.invite-member-content .close-button:hover {
  color: var(--color-text-primary);
}

.invite-member-content .modal-title {
  font-size: 28px;
  font-weight: 300;
  margin: 0 0 16px 0;
  color: #2c2c2c;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  margin-top: 1rem;
}

.user-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #fafafa;
  transition: background 0.2s;
}

.user-result:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: #b8d4c8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.user-info-result {
  flex: 1;
}

.user-name-result {
  font-weight: 400;
  font-size: 15px;
  margin-bottom: 2px;
}
</style>
