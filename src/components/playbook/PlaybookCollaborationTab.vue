<template>
  <div class="collaboration-tab">
    <!-- Members Section -->
    <div class="collab-section">
      <div class="collab-section-header">
        <h3 class="section-subtitle">Team</h3>
        <button
          v-if="userRole === 'creator'"
          @click="$emit('inviteMember')"
          :disabled="loading"
          class="btn-text text-xs"
        >
          + Invite Member
        </button>
      </div>

      <div class="members-list">
        <router-link
          v-for="member in members"
          :key="member.id"
          :to="`/dashboard/profile/${member.user.id}`"
          class="member-row"
        >
          <div
            class="member-avatar"
            :class="{ 'member-avatar-creator': member.role === 'creator' }"
          >
            <img
              v-if="member.user.profileImage"
              :src="member.user.profileImage"
              :alt="member.user.name"
            />
            <span v-else>{{ getInitials(member.user.name) }}</span>
          </div>
          <div class="member-detail">
            <span class="member-detail-name text-sm">{{ member.user.name }}</span>
            <span class="member-detail-role text-xs text-tertiary">{{ member.role === 'creator' ? 'Creator' : 'Collaborator' }}</span>
          </div>
          <span class="member-joined text-xs text-tertiary">Joined {{ formatRelativeDate(member.joinedAt) }}</span>
          <button
            v-if="userRole === 'creator' && member.role !== 'creator'"
            class="btn-text text-xs text-danger member-remove"
            @click.prevent="$emit('removeMember', member.user.id)"
          >
            Remove
          </button>
        </router-link>

        <p v-if="members.length === 0" class="text-xs text-tertiary empty-state">
          No team members yet. Invite collaborators to get started.
        </p>
      </div>
    </div>

    <!-- Visibility Section -->
    <div class="collab-section">
      <div class="collab-section-header">
        <h3 class="section-subtitle">Visibility</h3>
      </div>

      <div class="visibility-card">
        <div class="visibility-status">
          <div class="visibility-indicator" :class="playbook.isPublic ? 'is-public' : 'is-private'"></div>
          <div class="visibility-info">
            <span class="text-sm">{{ playbook.isPublic ? 'Public' : 'Private' }}</span>
            <span class="text-xs text-tertiary">
              {{ playbook.isPublic
                ? 'Visible to your local community'
                : 'Only visible to team members'
              }}
            </span>
          </div>
        </div>
        <button
          v-if="userRole === 'creator'"
          @click="$emit('togglePublish')"
          :disabled="loading"
          class="btn-secondary btn-sm"
        >
          {{ playbook.isPublic ? 'Make Private' : 'Publish' }}
        </button>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="collab-section">
      <div class="collab-section-header">
        <h3 class="section-subtitle">Actions</h3>
      </div>

      <div class="actions-grid">
        <template v-if="isUserMember">
          <button
            v-if="playbook.status === 'active'"
            @click="$emit('markComplete')"
            class="action-card"
          >
            <span class="action-icon">✓</span>
            <span class="action-label text-xs">Mark Complete</span>
          </button>
          <button
            v-if="playbook.status === 'completed'"
            @click="$emit('generateStory')"
            :disabled="isGenerating"
            class="action-card"
          >
            <span class="action-icon">◆</span>
            <span class="action-label text-xs">{{ isGenerating ? 'Generating...' : 'Generate Story' }}</span>
          </button>
          <button
            @click="$emit('togglePause')"
            class="action-card"
          >
            <span class="action-icon">{{ playbook.status === 'paused' ? '▶' : '⏸' }}</span>
            <span class="action-label text-xs">{{ playbook.status === 'paused' ? 'Resume' : 'Pause' }}</span>
          </button>
          <button
            @click="$emit('showDelete')"
            class="action-card action-danger"
          >
            <span class="action-icon">✕</span>
            <span class="action-label text-xs">Delete</span>
          </button>
        </template>
        <template v-else>
          <button
            @click="$emit('requestJoin')"
            :disabled="loading"
            class="action-card action-join"
          >
            <span class="action-icon">+</span>
            <span class="action-label text-xs">Request to Join</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, getInitials } from '@/utils/formatters'
import type { PlaybookMember } from '@/types/collaboration'

defineProps<{
  playbook: any
  members: PlaybookMember[]
  userRole: string | null
  isUserMember: boolean
  isGenerating: boolean
  loading: boolean
}>()

defineEmits<{
  inviteMember: []
  removeMember: [userId: number]
  togglePublish: []
  markComplete: []
  generateStory: []
  togglePause: []
  showDelete: []
  requestJoin: []
}>()

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return formatDate(dateStr)
}
</script>

<style scoped>
.collaboration-tab {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.collab-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.collab-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
}

/* Members */
.members-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(42, 42, 42, 0.04);
  text-decoration: none;
  transition: opacity var(--transition-base);
}

.member-row:last-child {
  border-bottom: none;
}

.member-row:hover {
  opacity: 0.7;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #d0d0d0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 15px;
  flex-shrink: 0;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar-creator {
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
}

.member-detail {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.member-detail-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.member-detail-role {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.member-joined {
  white-space: nowrap;
}

.member-remove {
  opacity: 0;
  transition: opacity var(--transition-base);
}

.member-row:hover .member-remove {
  opacity: 1;
}

.empty-state {
  padding: 2rem 0;
  text-align: center;
}

/* Visibility */
.visibility-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
}

.visibility-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.visibility-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.visibility-indicator.is-public {
  background: var(--color-accent-2);
}

.visibility-indicator.is-private {
  background: var(--color-text-tertiary);
}

.visibility-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

/* Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.06);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: var(--font-family);
}

.action-card:hover {
  border-color: rgba(42, 42, 42, 0.15);
  transform: translateY(-2px);
}

.action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-icon {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
}

.action-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.action-danger:hover {
  border-color: rgba(232, 180, 160, 0.3);
}

.action-danger .action-icon,
.action-danger .action-label {
  color: var(--color-accent-warm);
}

.action-join:hover {
  border-color: var(--color-accent-2);
}

@media (max-width: 768px) {
  .visibility-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }

  .member-joined {
    display: none;
  }
}
</style>
