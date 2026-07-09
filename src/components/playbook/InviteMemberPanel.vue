<template>
  <SlideInModal :model-value="modelValue" title="Invite Member" @update:model-value="$emit('update:modelValue', $event)">
    <div class="invite-member-content">
      <button class="close-button" @click="$emit('update:modelValue', false)" title="Close">
        <span class="chevron chevron--back"></span> Back
      </button>

      <h2 class="modal-title">Invite Member</h2>

      <p class="text-sm text-secondary" style="margin-bottom: 20px;">
        Invite other Pattern Language users to collaborate on this playbook.
      </p>

      <!-- Scope Toggle -->
      <div class="scope-toggle">
        <button
          :class="['scope-option text-xs', { active: memberScope === 'local' }]"
          @click="$emit('update:memberScope', 'local')"
        >
          Local Members
        </button>
        <button
          :class="['scope-option text-xs', { active: memberScope === 'all' }]"
          @click="$emit('update:memberScope', 'all')"
        >
          All Members
        </button>
      </div>

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

      <!-- Invite by Email -->
      <div class="email-invite">
        <h3 class="email-invite-title text-sm">Invite by email</h3>
        <p class="text-xs text-tertiary" style="margin-bottom: 12px;">
          Not on Pattern Language yet? Send a branded invitation — they'll join this playbook automatically when they sign up.
        </p>
        <div class="form-group">
          <input
            v-model="inviteEmail"
            type="email"
            class="form-input"
            placeholder="name@example.com"
            @keyup.enter="sendEmailInvite"
          />
        </div>
        <div class="form-group">
          <textarea
            v-model="inviteMessage"
            class="form-input"
            rows="3"
            placeholder="Add a personal message (optional)..."
          ></textarea>
        </div>
        <button
          class="btn-sm"
          :disabled="inviteEmailSending || !isEmailValid"
          @click="sendEmailInvite"
        >
          {{ inviteEmailSending ? 'Sending...' : 'Send Email Invitation' }}
        </button>
      </div>
    </div>
  </SlideInModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SlideInModal from '@/components/SlideInModal.vue'
import { getInitials } from '@/utils/formatters'
import type { SearchedUser } from '@/types/collaboration'

const props = defineProps<{
  modelValue: boolean
  searchQuery: string
  memberScope: 'local' | 'all'
  filteredAvailableUsers: SearchedUser[]
  invitedUserIds: number[]
  loading: boolean
  inviteEmailSending: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:searchQuery': [value: string]
  'update:memberScope': [value: 'local' | 'all']
  inviteUser: [user: SearchedUser]
  inviteEmail: [email: string, message?: string]
}>()

const inviteEmail = ref('')
const inviteMessage = ref('')

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.value.trim()))

const sendEmailInvite = () => {
  if (!isEmailValid.value || props.inviteEmailSending) return
  emit('inviteEmail', inviteEmail.value.trim(), inviteMessage.value.trim() || undefined)
  inviteEmail.value = ''
  inviteMessage.value = ''
}
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

.scope-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(42, 42, 42, 0.12);
  width: fit-content;
}

.scope-option {
  padding: 0.6rem 1.25rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.2s;
}

.scope-option.active {
  background: #2c2c2c;
  color: white;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 380px;
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

.email-invite {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.email-invite-title {
  font-weight: 400;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

.email-invite textarea {
  resize: vertical;
}
</style>
