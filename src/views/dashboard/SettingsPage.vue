<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Settings</h1>
        <p class="text-sm text-secondary">Manage your account and preferences</p>
      </div>
    </div>

    <!-- Content -->
    <div class="page-content">
      <div class="container">
        <!-- User Profile -->
        <section class="settings-section">
          <h2 class="section-title">Profile</h2>
          <div class="form-group">
            <label class="form-label text-xs text-tertiary">Name</label>
            <input v-model="userProfile.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label text-xs text-tertiary">Email</label>
            <input v-model="userProfile.email" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label text-xs text-tertiary">Location</label>
            <input v-model="userProfile.location" type="text" class="form-input" />
          </div>
          <button class="btn" @click="saveProfile">Save Profile</button>
        </section>

        <!-- AI Preferences -->
        <section class="settings-section">
          <h2 class="section-title">AI Assistant</h2>
          <div class="form-group">
            <label class="form-label text-xs text-tertiary">Conversation Style</label>
            <select v-model="aiPreferences.conversationStyle" class="form-input">
              <option value="concise">Concise & Direct</option>
              <option value="detailed">Detailed & Explanatory</option>
              <option value="collaborative">Collaborative & Exploratory</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label text-xs text-tertiary">Suggestion Frequency</label>
            <select v-model="aiPreferences.suggestionFrequency" class="form-input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label text-sm">
              <input v-model="aiPreferences.autoSuggestions" type="checkbox" class="checkbox" />
              Enable automatic pattern suggestions
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label text-sm">
              <input v-model="aiPreferences.relatedPatterns" type="checkbox" class="checkbox" />
              Show related patterns in responses
            </label>
          </div>
          <button class="btn" @click="saveAIPreferences">Save Preferences</button>
        </section>

        <!-- Notifications -->
        <section class="settings-section">
          <h2 class="section-title">Notifications</h2>
          <div class="form-group checkbox-group">
            <label class="checkbox-label text-sm">
              <input v-model="notifications.emailUpdates" type="checkbox" class="checkbox" />
              Email updates about new patterns
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label text-sm">
              <input v-model="notifications.playbookReminders" type="checkbox" class="checkbox" />
              Task due date reminders
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label text-sm">
              <input v-model="notifications.completionCelebrations" type="checkbox" class="checkbox" />
              Celebrate completed playbooks
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label text-sm">
              <input v-model="notifications.weeklyDigest" type="checkbox" class="checkbox" />
              Weekly digest
            </label>
          </div>
          <button class="btn" @click="saveNotifications">Save Notifications</button>
        </section>

        <!-- Account -->
        <section class="settings-section">
          <h2 class="section-title">Account</h2>
          <p class="text-sm text-secondary" style="margin-bottom: var(--spacing-md)">
            Logged in as <strong>{{ currentUser?.email }}</strong>
          </p>
          <button class="btn-danger" @click="handleLogout">Logout</button>
        </section>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast">{{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const currentUser = authStore.currentUser

const userProfile = reactive({
  name: currentUser?.name || '',
  email: currentUser?.email || '',
  location: currentUser?.location || ''
})

const aiPreferences = reactive({
  conversationStyle: 'detailed',
  suggestionFrequency: 'medium',
  autoSuggestions: true,
  relatedPatterns: true
})

const notifications = reactive({
  emailUpdates: true,
  playbookReminders: true,
  completionCelebrations: true,
  weeklyDigest: false
})

const showToast = ref(false)
const toastMessage = ref('')

onMounted(() => {
  const savedAIPrefs = localStorage.getItem('ai_preferences')
  if (savedAIPrefs) Object.assign(aiPreferences, JSON.parse(savedAIPrefs))

  const savedNotifications = localStorage.getItem('notifications')
  if (savedNotifications) Object.assign(notifications, JSON.parse(savedNotifications))
})

const saveProfile = () => {
  authStore.updateUser({
    name: userProfile.name,
    email: userProfile.email,
    location: userProfile.location
  })
  showSuccessToast('Profile saved')
}

const saveAIPreferences = () => {
  localStorage.setItem('ai_preferences', JSON.stringify(aiPreferences))
  showSuccessToast('AI preferences saved')
}

const saveNotifications = () => {
  localStorage.setItem('notifications', JSON.stringify(notifications))
  showSuccessToast('Notification settings saved')
}

const handleLogout = () => {
  if (confirm('Logout?')) {
    authStore.logout()
    router.push('/')
  }
}

const showSuccessToast = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.page-content {
  padding: var(--spacing-lg) var(--spacing-md);
}

.settings-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-light);
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.9375rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.checkbox-group {
  padding: var(--spacing-sm) 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-text-primary);
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border: 1px solid var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.875rem;
  letter-spacing: 0.02em;
  transition: opacity var(--transition-fast);
}

.btn-danger:hover {
  opacity: 0.8;
}

.toast {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  letter-spacing: 0.02em;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
