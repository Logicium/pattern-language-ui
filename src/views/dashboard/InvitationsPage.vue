<template>
  <div class="invitations-page">
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

    <section class="section page-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <p class="text-secondary">Loading invitations...</p>
        </div>

        <div v-else-if="invitations.length > 0" class="invitations-list">
          <InvitationCard
            v-for="invitation in invitations"
            :key="invitation.id"
            :invitation="invitation"
            :is-processing="processing === invitation.id"
            :format-date="formatDate"
            @accept="acceptInvitation"
            @reject="rejectInvitation"
          />
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">✉</div>
          <h3>No pending invitations</h3>
          <p class="text-secondary">When others invite you to collaborate on playbooks, they'll appear here</p>
        </div>
      </div>
    </section>

    <div v-if="showToast" class="toast-notification">
      <p>{{ toastMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import InvitationCard from '@/components/invitations/InvitationCard.vue'
import { useInvitationsPage } from '@/composables/useInvitationsPage'

const {
  invitations, loading, processing,
  showToast, toastMessage,
  acceptInvitation, rejectInvitation, formatDate
} = useInvitationsPage()
</script>

<style scoped>
.invitations-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header { padding: 4rem 0 3rem; }

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

.page-content { padding: 3rem 0; }

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
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.toast-notification p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 300;
}

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
}
</style>
