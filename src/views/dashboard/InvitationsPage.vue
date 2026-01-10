<template>
  <div class="invitations-page">
    <!-- Header -->
    <section class="page-header gradient-bg">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Invitations</h1>
            <p class="text-sm text-secondary">Manage your playbook collaboration invitations</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="section page-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <p class="text-secondary">Loading invitations...</p>
        </div>

        <!-- Invitations List -->
        <div v-else-if="invitations.length > 0" class="invitations-list">
          <div 
            v-for="invitation in invitations" 
            :key="invitation.id"
            class="invitation-card"
          >
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
                @click="acceptInvitation(invitation.id)"
                :disabled="processing === invitation.id"
                class="btn btn-sm btn-accept"
              >
                {{ processing === invitation.id ? 'Accepting...' : 'Accept' }}
              </button>
              <button 
                @click="rejectInvitation(invitation.id)"
                :disabled="processing === invitation.id"
                class="btn-secondary btn-sm"
              >
                {{ processing === invitation.id ? 'Declining...' : 'Decline' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">✉</div>
          <h3>No pending invitations</h3>
          <p class="text-secondary">When others invite you to collaborate on playbooks, they'll appear here</p>
        </div>
      </div>
    </section>

    <!-- Toast Notification -->
    <div v-if="showToast" class="toast-notification">
      <p>{{ toastMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { invitationsApi } from '@/services/api'
import type { PlaybookInvitation } from '@/types/collaboration'

const router = useRouter()

const invitations = ref<PlaybookInvitation[]>([])
const loading = ref(true)
const processing = ref<number | null>(null)
const showToast = ref(false)
const toastMessage = ref('')

const loadInvitations = async () => {
  loading.value = true
  try {
    invitations.value = await invitationsApi.getPending()
  } catch (error) {
    console.error('Failed to load invitations:', error)
    invitations.value = []
  } finally {
    loading.value = false
  }
}

const acceptInvitation = async (invitationId: number) => {
  processing.value = invitationId
  try {
    await invitationsApi.accept(invitationId)
    
    // Remove from list
    invitations.value = invitations.value.filter(inv => inv.id !== invitationId)
    
    // Show success message
    toastMessage.value = 'Invitation accepted! You can now access the playbook.'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to accept invitation:', error)
    toastMessage.value = 'Failed to accept invitation'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } finally {
    processing.value = null
  }
}

const rejectInvitation = async (invitationId: number) => {
  if (!confirm('Are you sure you want to decline this invitation?')) return
  
  processing.value = invitationId
  try {
    await invitationsApi.reject(invitationId)
    
    // Remove from list
    invitations.value = invitations.value.filter(inv => inv.id !== invitationId)
    
    // Show success message
    toastMessage.value = 'Invitation declined'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to reject invitation:', error)
    toastMessage.value = 'Failed to decline invitation'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } finally {
    processing.value = null
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

onMounted(() => {
  loadInvitations()
})
</script>

<style scoped>
.invitations-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Header */
.page-header {
  padding: 4rem 0 3rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  font-size: 3rem;
  font-weight: 300;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
}

/* Content */
.page-content {
  padding: 3rem 0;
}

.loading-state {
  text-align: center;
  padding: 4rem 0;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

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

.invitation-body {
  margin-bottom: 1.5rem;
}

.invitation-from {
  margin-bottom: 0.75rem;
}

.inviter-link {
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 400;
  transition: opacity 0.2s;
}

.inviter-link:hover {
  opacity: 0.7;
}

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

.btn-accept:hover {
  opacity: 0.8;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: 1rem;
  line-height: 1.6;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #2c2c2c;
  color: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast-notification p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 300;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .invitation-card {
    padding: 1.5rem;
  }

  .invitation-title {
    font-size: 1.25rem;
  }

  .invitation-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .invitation-actions {
    flex-direction: column;
  }

  .invitation-actions .btn,
  .invitation-actions .btn-secondary {
    width: 100%;
  }
}
</style>
