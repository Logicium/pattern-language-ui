<template>
  <div class="sidebar-column">
    <div v-if="interests?.length" class="profile-section sidebar-card">
      <h3 class="sidebar-title">Challenges Focused On</h3>
      <ul class="challenges-list">
        <li
          v-for="challenge in interests"
          :key="challenge"
          class="challenge-item text-sm"
        >
          {{ challenge }}
        </li>
      </ul>
    </div>

    <div class="profile-section sidebar-card">
      <h3 class="sidebar-title">Member Since</h3>
      <p class="text-sm text-secondary">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  interests?: string[]
  createdAt?: string
}>()

const formattedDate = computed(() => {
  if (!props.createdAt) return ''
  const date = new Date(props.createdAt)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})
</script>

<style scoped>
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: var(--color-bg-primary);
}

.sidebar-card { padding: 2rem; }

.sidebar-title {
  font-weight: var(--font-weight-normal);
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
}

.challenges-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.challenge-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  color: var(--color-text-secondary);
}

.challenge-item:last-child { border-bottom: none; }

@media (max-width: 768px) {
  .sidebar-card { padding: 1.5rem; }
}
</style>
