<template>
  <div class="settings-page">
    <!-- Header -->
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Settings</h1>
        <p class="text-sm text-secondary">Manage your account and preferences</p>
      </div>
    </section>

    <!-- Content -->
    <section class="page-content">
      <div class="container">
        <!-- User Profile -->
        <div class="settings-section" data-accent="1">
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
        </div>

        <!-- AI Preferences -->
        <div class="settings-section" data-accent="2">
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
          <div class="checkbox-list">
            <label class="checkbox-label text-sm">
              <input v-model="aiPreferences.autoSuggestions" type="checkbox" class="checkbox" />
              <span>Enable automatic pattern suggestions</span>
            </label>
            <label class="checkbox-label text-sm">
              <input v-model="aiPreferences.relatedPatterns" type="checkbox" class="checkbox" />
              <span>Show related patterns in responses</span>
            </label>
          </div>
          <button class="btn" @click="saveAIPreferences">Save Preferences</button>
        </div>

        <!-- Notifications -->
        <div class="settings-section" data-accent="3">
          <h2 class="section-title">Notifications</h2>
          <div class="checkbox-list">
            <label class="checkbox-label text-sm">
              <input v-model="notifications.emailUpdates" type="checkbox" class="checkbox" />
              <span>Email updates about new patterns</span>
            </label>
            <label class="checkbox-label text-sm">
              <input v-model="notifications.playbookReminders" type="checkbox" class="checkbox" />
              <span>Task due date reminders</span>
            </label>
            <label class="checkbox-label text-sm">
              <input v-model="notifications.completionCelebrations" type="checkbox" class="checkbox" />
              <span>Celebrate completed playbooks</span>
            </label>
            <label class="checkbox-label text-sm">
              <input v-model="notifications.weeklyDigest" type="checkbox" class="checkbox" />
              <span>Weekly digest</span>
            </label>
          </div>
          <button class="btn" @click="saveNotifications">Save Notifications</button>
        </div>

        <!-- Account -->
        <div class="settings-section" data-accent="1">
          <h2 class="section-title">Account</h2>
          <div class="account-info">
            <span class="text-xs text-tertiary">Logged in as</span>
            <p class="text-sm">{{ currentUser?.email }}</p>
          </div>
          <button class="btn-danger" @click="handleLogout">Logout</button>
        </div>
      </div>
    </section>

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

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.settings-section[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.settings-section[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.settings-section:hover {
  box-shadow: 0 4px 16px rgba(42, 42, 42, 0.06);
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  transition: all var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
  background: var(--color-bg-primary);
}

.form-input:hover {
  border-color: rgba(42, 42, 42, 0.15);
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.75rem;
  transition: all var(--transition-base);
  border-left: 2px solid transparent;
}

.checkbox-label:hover {
  background: var(--color-bg-primary);
  border-left-color: var(--color-accent-2);
  padding-left: 1rem;
}

.checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: var(--color-accent-2);
}

.checkbox-label span {
  line-height: 1.5;
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

.btn-danger:hover::before {
  left: 100%;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 42, 42, 0.2);
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, var(--color-accent-2), var(--color-accent-3));
  color: var(--color-bg-primary);
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(2rem) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-1rem) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem var(--container-padding);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .settings-section {
    padding: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .toast {
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
  }
}
</style>
