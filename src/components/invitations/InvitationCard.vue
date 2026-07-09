<template>
  <article class="invitation-card" :data-accent="accent">
    <div class="label-row">
      <span class="label-id">
        <span class="accent-mark" aria-hidden="true"></span>
        {{ kindLabel }}
      </span>
      <span>{{ formatDate(invitation.createdAt) }}</span>
    </div>

    <h3 class="invitation-title">{{ invitation.playbook.title || invitation.playbook.patternTitle }}</h3>

    <span class="pattern-chip">{{ invitation.playbook.patternTitle }}</span>

    <p class="card-provenance">
      <template v-if="mode === 'sent'">
        <template v-if="isJoinRequest">Awaiting the creator's approval</template>
        <template v-else-if="invitation.invitedUser">To {{ invitation.invitedUser.name }}</template>
        <template v-else>To {{ invitation.email }} — not yet signed up</template>
      </template>
      <template v-else>
        {{ isJoinRequest ? 'Request from' : 'From' }} {{ invitation.invitedBy.name }}
      </template>
    </p>

    <blockquote v-if="invitation.message" class="invitation-message">
      {{ invitation.message }}
    </blockquote>

    <div class="invitation-actions">
      <template v-if="mode === 'sent'">
        <button
          @click="$emit('reject', invitation.id)"
          :disabled="isProcessing"
          class="action-link action-muted"
        >
          {{ isProcessing ? 'Withdrawing…' : 'Withdraw' }}
        </button>
      </template>
      <template v-else>
        <button
          @click="$emit('accept', invitation.id)"
          :disabled="isProcessing"
          class="action-link action-primary"
        >
          {{ isProcessing ? (isJoinRequest ? 'Approving…' : 'Accepting…') : (isJoinRequest ? 'Approve' : 'Accept') }}
        </button>
        <button
          @click="$emit('reject', invitation.id)"
          :disabled="isProcessing"
          class="action-link action-muted"
        >
          Decline
        </button>
      </template>
      <router-link
        v-if="mode !== 'sent'"
        :to="`/dashboard/profile/${invitation.invitedBy.id}`"
        class="action-link action-profile"
      >
        Profile
      </router-link>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  invitation: any
  isProcessing: boolean
  formatDate: (dateString: string) => string
  mode?: 'incoming' | 'sent'
  accent?: number
}>(), {
  mode: 'incoming',
  accent: 1
})

defineEmits<{
  accept: [id: number]
  reject: [id: number]
}>()

const isJoinRequest = computed(() => props.invitation.type === 'join_request')

const kindLabel = computed(() => {
  if (props.mode === 'sent') {
    return isJoinRequest.value ? 'Join Request — Sent' : 'Invitation — Sent'
  }
  return isJoinRequest.value ? 'Join Request' : 'Invitation'
})
</script>

<style scoped>
.invitation-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  padding: 2.75rem 2.5rem 2.25rem;
  color: var(--color-text-primary);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.invitation-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 2.25rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.invitation-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.invitation-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.invitation-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.invitation-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.18;
  margin: 0 0 1.25rem;
}

.pattern-chip {
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  margin-bottom: 1.25rem;
}

.invitation-card[data-accent="1"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.invitation-card[data-accent="2"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.invitation-card[data-accent="3"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

.card-provenance {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin: 0;
}

.invitation-message {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.7;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  margin: 1.5rem 0 0;
  padding: 1.1rem 1.25rem;
}

.invitation-actions {
  display: flex;
  gap: 2.5rem;
  align-items: baseline;
  margin-top: 2.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--hairline);
}

.action-link {
  background: none;
  border: none;
  padding: 0 0 2px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.action-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-primary {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-text-primary);
}

.action-muted {
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
}

.action-muted:hover:not(:disabled) {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

.action-profile {
  margin-left: auto;
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
}

.action-profile:hover {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

@media (max-width: 768px) {
  .invitation-card { padding: 2.25rem 1.75rem 2rem; }
  .invitation-title { font-size: 1.5rem; }
  .invitation-actions { gap: 1.75rem; }
}
</style>
