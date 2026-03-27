<template>
  <div class="settings-page">
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Settings</h1>
        <p class="text-sm text-secondary">Manage your account and preferences</p>
      </div>
    </section>

    <section class="page-content">
      <div class="container">
        <div class="settings-section" data-accent="1">
          <h2 class="section-title">Profile</h2>
          <p class="text-sm text-secondary" style="margin-bottom: 1.5rem;">
            Manage your public profile, bio, and community information
          </p>
          <button class="btn" @click="showProfileEdit = true">Edit Profile</button>
        </div>

        <SettingsAISection @saved="showSuccessToast" />
        <SettingsNotificationsSection @saved="showSuccessToast" />

        <div class="settings-section" data-accent="1">
          <h2 class="section-title">Account</h2>
          <div class="account-info">
            <span class="text-xs text-tertiary">Logged in as</span>
            <p class="text-sm">{{ currentUser?.email }}</p>
          </div>
          <button class="btn-danger" @click="showLogoutModal = true">Logout</button>
        </div>
      </div>
    </section>

    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />

    <ConfirmModal
      v-model="showLogoutModal"
      title="Confirm Logout"
      message="Are you sure you want to logout?"
      confirm-text="Logout"
      danger
      @confirm="confirmLogout"
    />

    <SlideInModal v-model="showProfileEdit">
      <ProfileEditPage 
        v-if="myProfile"
        :profile="myProfile"
        @close="showProfileEdit = false"
        @saved="handleProfileSaved"
      />
    </SlideInModal>
  </div>
</template>

<script setup lang="ts">
import { Toast, ConfirmModal, SlideInModal } from '@/components'
import ProfileEditPage from './ProfileEditPage.vue'
import SettingsAISection from '@/components/settings/SettingsAISection.vue'
import SettingsNotificationsSection from '@/components/settings/SettingsNotificationsSection.vue'
import { useSettings } from '@/composables/useSettings'

const {
  currentUser, myProfile, showProfileEdit,
  showToast, toastMessage, showLogoutModal,
  handleProfileSaved, confirmLogout, showSuccessToast
} = useSettings()
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header {
  padding: 3rem var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.page-header .container,
.page-content .container {
  max-width: 800px;
  margin: 0 !important;
  padding: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.page-content {
  padding: 3rem var(--container-padding);
  background: var(--color-bg-secondary);
}

.settings-section {
  margin-bottom: 3rem;
  padding: 3rem;
  background: var(--color-bg-primary);
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.settings-section:last-child { margin-bottom: 0; }
.settings-section[data-accent="1"] { border-left-color: var(--color-accent-1); }
.settings-section:hover { box-shadow: 0 4px 16px rgba(42, 42, 42, 0.06); }

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  margin-bottom: 2rem;
  border-left: 2px solid rgba(42, 42, 42, 0.15);
}

.account-info .text-xs {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.btn-danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-base);
}

.btn-danger:hover::before { left: 100%; }

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 42, 42, 0.2);
}

@media (max-width: 768px) {
  .page-header { padding: 2rem var(--container-padding); }
  .page-title { font-size: 1.5rem; }
  .settings-section { padding: 2rem; }
  .section-title { font-size: 1.25rem; }
}
</style>
