<template>
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
    <button class="btn" @click="save">Save Notifications</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'

const emit = defineEmits<{ 'saved': [message: string] }>()

const notifications = reactive({
  emailUpdates: true,
  playbookReminders: true,
  completionCelebrations: true,
  weeklyDigest: false
})

onMounted(() => {
  const saved = localStorage.getItem('notifications')
  if (saved) Object.assign(notifications, JSON.parse(saved))
})

const save = () => {
  localStorage.setItem('notifications', JSON.stringify(notifications))
  emit('saved', 'Notification settings saved')
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 3rem;
  padding: 3rem;
  background: var(--color-bg-primary);
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.settings-section[data-accent="3"] { border-left-color: var(--color-accent-3); }
.settings-section:hover { box-shadow: 0 4px 16px rgba(42, 42, 42, 0.06); }

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
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

.checkbox-label span { line-height: 1.5; }

@media (max-width: 768px) {
  .settings-section { padding: 2rem; }
  .section-title { font-size: 1.25rem; }
}
</style>
