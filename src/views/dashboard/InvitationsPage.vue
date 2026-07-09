<template>
  <div class="invitations-page">
    <section class="page-header gradient-bg">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Invitations</h1>
            <p class="text-sm text-secondary">Collaboration requests, invitations, and introductions</p>
          </div>
        </div>
      </div>
    </section>

    <section class="tabs-section">
      <div class="container">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab text-xs', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}<template v-if="tab.count !== null"> ({{ tab.count }})</template>
          </button>
        </div>
      </div>
    </section>

    <section class="section page-content">
      <div class="container">
        <LoadingState v-if="loading" message="Loading invitations..." />

        <Transition v-else name="panel-blur" mode="out-in">
          <div :key="activeTab">
            <!-- Received invitations -->
            <template v-if="activeTab === 'received'">
              <div v-if="invitations.length > 0" class="invitations-list">
                <InvitationCard
                  v-for="(invitation, i) in invitations"
                  :key="invitation.id"
                  :invitation="invitation"
                  :is-processing="processing === invitation.id"
                  :format-date="formatDate"
                  :accent="(i % 3) + 1"
                  @accept="acceptInvitation"
                  @reject="rejectInvitation"
                />
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">∅</div>
                <h3>No invitations</h3>
                <p class="text-secondary">When someone invites you to collaborate on a playbook, it will appear here</p>
              </div>
            </template>

            <!-- Join requests on your playbooks -->
            <template v-else-if="activeTab === 'requests'">
              <div v-if="joinRequests.length > 0" class="invitations-list">
                <InvitationCard
                  v-for="(request, i) in joinRequests"
                  :key="request.id"
                  :invitation="request"
                  :is-processing="processing === request.id"
                  :format-date="formatDate"
                  :accent="(i % 3) + 1"
                  @accept="acceptInvitation"
                  @reject="rejectInvitation"
                />
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">∅</div>
                <h3>No join requests</h3>
                <p class="text-secondary">When someone asks to join one of your published playbooks, you'll approve them here</p>
              </div>
            </template>

            <!-- Sent by you -->
            <template v-else-if="activeTab === 'sent'">
              <div v-if="sentInvitations.length > 0" class="invitations-list">
                <InvitationCard
                  v-for="(sent, i) in sentInvitations"
                  :key="sent.id"
                  :invitation="sent"
                  :is-processing="processing === sent.id"
                  :format-date="formatDate"
                  :accent="(i % 3) + 1"
                  mode="sent"
                  @reject="cancelSentInvitation"
                />
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">∅</div>
                <h3>Nothing pending</h3>
                <p class="text-secondary">Join requests you make and invitations you send will wait here until they're answered</p>
              </div>
            </template>

            <!-- Invite someone -->
            <template v-else>
              <div class="invite-editorial">
                <div class="invite-intro">
                  <span class="invite-eyebrow text-xs">
                    <span class="eyebrow-tick" aria-hidden="true"></span>
                    An introduction
                  </span>
                  <h2 class="invite-heading">Bring someone<br />into the work.</h2>
                  <p class="text-sm text-secondary invite-copy">
                    Send a branded invitation to Pattern Language. Choose one of your
                    playbooks and they'll join your team the moment they sign up —
                    or leave it open and simply introduce them to the platform.
                  </p>
                </div>

                <div class="invite-form">
                  <div class="field">
                    <label class="field-label text-xs" for="invite-email">Email Address</label>
                    <input
                      id="invite-email"
                      v-model="inviteEmail"
                      type="email"
                      class="field-input"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div class="field">
                    <label class="field-label text-xs">Playbook — Optional</label>
                    <AppDropdown
                      :model-value="invitePlaybookId"
                      :options="playbookOptions"
                      placeholder="No playbook — just the platform"
                      @update:model-value="invitePlaybookId = $event === '' || $event === null ? null : Number($event)"
                    />
                  </div>

                  <div class="field">
                    <label class="field-label text-xs" for="invite-message">Personal Message — Optional</label>
                    <textarea
                      id="invite-message"
                      v-model="inviteMessage"
                      class="field-input field-textarea"
                      rows="3"
                      placeholder="A line or two about why you're inviting them..."
                    ></textarea>
                  </div>

                  <button
                    class="invite-submit text-xs"
                    :disabled="inviteSending || !isInviteEmailValid(inviteEmail)"
                    @click="sendPlatformInvite"
                  >
                    {{ inviteSending ? 'Sending…' : 'Send Invitation' }}
                    <span class="submit-arrow">→</span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </section>

    <div v-if="showToast" class="toast-notification">
      <p>{{ toastMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InvitationCard from '@/components/invitations/InvitationCard.vue'
import AppDropdown from '@/components/AppDropdown.vue'
import { LoadingState } from '@/components'
import { useInvitationsPage } from '@/composables/useInvitationsPage'

type InvitationsTab = 'received' | 'requests' | 'sent' | 'invite'

const activeTab = ref<InvitationsTab>('received')

const {
  invitations, joinRequests, sentInvitations, myPlaybooks,
  loading, processing,
  showToast, toastMessage,
  inviteEmail, inviteMessage, invitePlaybookId, inviteSending, isInviteEmailValid,
  acceptInvitation, rejectInvitation, cancelSentInvitation, sendPlatformInvite,
  formatDate
} = useInvitationsPage()

const tabs = computed(() => [
  { key: 'received' as const, label: 'Received', count: invitations.value.length },
  { key: 'requests' as const, label: 'Join Requests', count: joinRequests.value.length },
  { key: 'sent' as const, label: 'Sent', count: sentInvitations.value.length },
  { key: 'invite' as const, label: 'Invite Someone', count: null },
])

const playbookOptions = computed(() => [
  { value: '', label: 'No playbook — just the platform' },
  ...myPlaybooks.value.map((p: any) => ({ value: p.id, label: p.title || p.patternTitle })),
])
</script>

<style scoped>
.invitations-page {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.page-header {
  padding: 3rem var(--container-padding);
}

.page-header .container,
.page-content .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.tabs-section {
  background: var(--color-bg-primary);
  padding: 0 var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  position: sticky;
  top: 0;
  z-index: 20;
}

.tabs-section .container { padding: 0; }

.tabs {
  display: flex;
  gap: 3rem;
  max-width: var(--container-max);
  margin: 0 auto;
  overflow-x: auto;
}

.tab {
  padding: 1.25rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.tab:hover { color: var(--color-text-primary); }

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent-1);
}

.page-content {
  padding: 3rem var(--container-padding) 5rem;
}

.invitations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 8rem 0;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-tertiary);
  margin-bottom: 2rem;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
}

.empty-state p {
  font-size: 1rem;
  max-width: 460px;
  margin: 0 auto;
}

/* ── Invite tab: editorial split layout ─────────────────────────── */
.invite-editorial {
  display: grid;
  grid-template-columns: 5fr 6fr;
  gap: 5rem;
  max-width: 1080px;
  margin: 2rem auto 0;
  padding: 4rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
}

.invite-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-tertiary);
  margin-bottom: 1.75rem;
}

.eyebrow-tick {
  width: 24px;
  height: 1px;
  background: var(--color-accent-1);
}

.invite-heading {
  font-size: 3.25rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  line-height: 1.06;
  margin: 0 0 1.5rem;
}

.invite-copy {
  line-height: 1.8;
  max-width: 380px;
}

.invite-form {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  padding-top: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.field-label {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-tertiary);
}

.field-input {
  border: none;
  border-bottom: 1px solid rgba(42, 42, 42, 0.2);
  background: transparent;
  padding: 0.6rem 0;
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: var(--font-weight-light);
  color: var(--color-text-primary);
  transition: border-color var(--transition-base);
}

.field-input:focus {
  outline: none;
  border-bottom-color: var(--color-text-primary);
}

.field-input::placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.field-textarea {
  resize: vertical;
  line-height: 1.7;
}

.invite-submit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-bg-dark);
  cursor: pointer;
  font-family: var(--font-family);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  transition: all var(--transition-base);
}

.invite-submit:hover:not(:disabled) {
  background: transparent;
  color: var(--color-text-primary);
}

.invite-submit:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.submit-arrow {
  display: inline-block;
  transition: transform var(--transition-base);
}

.invite-submit:hover:not(:disabled) .submit-arrow { transform: translateX(4px); }

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

@media (max-width: 1024px) {
  .invitations-list {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
  .invite-editorial {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .tabs { gap: 1.5rem; }
  .invitations-list { grid-template-columns: 1fr; }
  .invite-editorial { padding: 2rem 1.5rem; }
  .invite-heading { font-size: 2.25rem; }
}
</style>
