<template>
  <div class="invitation-card">
    <div class="invitation-header">
      <h3 class="invitation-title">{{ invitation.playbook.patternTitle }}</h3>
      <span class="invitation-date text-xs text-tertiary">
        {{ formatDate(invitation.createdAt) }}
      </span>
    </div>

    <div class="invitation-body">
      <p class="invitation-from text-sm">
        <span class="text-tertiary">From:</span>
        <router-link
          :to="`/dashboard/profile/${invitation.invitedBy.id}`"
          class="inviter-link"
        >
          {{ invitation.invitedBy.name }}
        </router-link>
      </p>
      <p v-if="invitation.message" class="invitation-message text-sm text-secondary">
        "{{ invitation.message }}"
      </p>
    </div>

    <div class="invitation-actions">
      <button
        @click="$emit('accept', invitation.id)"
        :disabled="isProcessing"
        class="btn btn-sm btn-accept"
      >
        {{ isProcessing ? 'Accepting...' : 'Accept' }}
      </button>
      <button
        @click="$emit('reject', invitation.id)"
        :disabled="isProcessing"
        class="btn-secondary btn-sm"
      >
        {{ isProcessing ? 'Declining...' : 'Decline' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  invitation: any
  isProcessing: boolean
  formatDate: (dateString: string) => string
}>()

defineEmits<{
  accept: [id: number]
  reject: [id: number]
}>()
</script>

<style scoped>
.invitation-card {
  background: white;
  border: 1px solid #e8e8e8;
  padding: 2rem;
  transition: box-shadow 0.2s;
}

.invitation-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.invitation-title {
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0;
  color: var(--color-text-primary);
}

.invitation-date {
  white-space: nowrap;
  padding-top: 0.25rem;
}

.invitation-body { margin-bottom: 1.5rem; }
.invitation-from { margin-bottom: 0.75rem; }

.inviter-link {
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 400;
  transition: opacity 0.2s;
}

.inviter-link:hover { opacity: 0.7; }

.invitation-message {
  font-style: italic;
  padding: 1rem;
  background: #fafafa;
  margin: 1rem 0 0 0;
}

.invitation-actions {
  display: flex;
  gap: 1rem;
}

.btn-accept {
  background: #2c2c2c;
  color: white;
}

.btn-accept:hover { opacity: 0.8; }

@media (max-width: 768px) {
  .invitation-card { padding: 1.5rem; }
  .invitation-title { font-size: 1.25rem; }
  .invitation-header { flex-direction: column; gap: 0.5rem; }
  .invitation-actions { flex-direction: column; }
  .invitation-actions .btn,
  .invitation-actions .btn-secondary { width: 100%; }
}
</style>
