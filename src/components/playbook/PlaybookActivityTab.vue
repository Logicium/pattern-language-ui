<template>
  <div class="activity-tab">
    <div v-if="loadingActivities" class="activity-loading">
      <span class="text-xs text-tertiary">Loading activity...</span>
    </div>

    <div v-else-if="activities.length === 0" class="activity-empty">
      <p class="text-sm text-secondary">No activity yet</p>
      <p class="text-xs text-tertiary">Actions on this playbook will appear here.</p>
    </div>

    <div v-else class="activity-feed">
      <template v-for="(group, dateKey) in groupedActivities" :key="dateKey">
        <div class="activity-date-header">
          <span class="text-xs text-tertiary">{{ dateKey }}</span>
          <div class="date-line"></div>
        </div>

        <div
          v-for="activity in group"
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-marker" :class="actionMarkerClass(activity.action)"></div>
          <div class="activity-content">
            <p class="text-sm activity-description">
              <span class="activity-user">{{ activity.user?.name }}</span>
              {{ activityVerb(activity.action) }}
              <span v-if="activity.targetTitle" class="activity-target">{{ activity.targetTitle }}</span>
            </p>
            <p v-if="activity.details" class="text-xs text-tertiary activity-details">{{ activity.details }}</p>
            <span class="text-xs text-tertiary activity-time">{{ formatActivityTime(activity.createdAt) }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { playbooksApi } from '@/services/api'
import type { PlaybookActivity } from '@/types/collaboration'

const props = defineProps<{
  playbook: any
}>()

const activities = ref<PlaybookActivity[]>([])
const loadingActivities = ref(false)

const groupedActivities = computed(() => {
  const groups: Record<string, PlaybookActivity[]> = {}
  for (const activity of activities.value) {
    const date = new Date(activity.createdAt)
    const key = formatDateGroup(date)
    if (!groups[key]) groups[key] = []
    groups[key].push(activity)
  }
  return groups
})

function formatDateGroup(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' })
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatActivityTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function activityVerb(action: PlaybookActivity['action']): string {
  const verbs: Record<string, string> = {
    task_created: 'created a task',
    task_completed: 'completed a task',
    task_comment: 'commented on',
    member_joined: 'joined the playbook',
    member_invited: 'invited a new member',
    playbook_published: 'published the playbook',
    playbook_completed: 'marked the playbook as complete',
    playbook_paused: 'paused the playbook',
    playbook_resumed: 'resumed the playbook',
    note_updated: 'updated notes',
    kpi_updated: 'updated a KPI',
    discussion_message: 'sent a message',
  }
  return verbs[action] || action
}

function actionMarkerClass(action: PlaybookActivity['action']): string {
  if (action === 'task_completed' || action === 'playbook_completed') return 'marker-success'
  if (action === 'playbook_paused') return 'marker-warning'
  if (action === 'member_joined' || action === 'member_invited') return 'marker-accent'
  if (action === 'discussion_message' || action === 'task_comment') return 'marker-neutral'
  return 'marker-default'
}

async function loadActivities() {
  if (!props.playbook || typeof props.playbook.id !== 'number') return
  loadingActivities.value = true
  try {
    activities.value = await playbooksApi.getActivities(props.playbook.id)
  } catch (error) {
    console.error('Failed to load activities:', error)
  } finally {
    loadingActivities.value = false
  }
}

onMounted(() => {
  loadActivities()
})

watch(() => props.playbook?.id, () => {
  loadActivities()
})
</script>

<style scoped>
.activity-tab {
  min-height: 400px;
}

.activity-loading,
.activity-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 0.5rem;
}

/* Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-date-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0 0.75rem;
}

.activity-date-header:first-child {
  padding-top: 0;
}

.date-line {
  flex: 1;
  height: 1px;
  background: rgba(42, 42, 42, 0.06);
}

/* Activity Item */
.activity-item {
  display: flex;
  gap: 1.25rem;
  padding: 1rem 0;
  padding-left: 0.5rem;
  border-left: 1px solid rgba(42, 42, 42, 0.06);
  position: relative;
}

.activity-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.4rem;
  margin-left: -0.75rem;
  position: relative;
  z-index: 1;
}

.marker-default {
  background: var(--color-accent-1);
}

.marker-success {
  background: var(--color-accent-2);
}

.marker-warning {
  background: var(--color-text-tertiary);
}

.marker-accent {
  background: var(--color-accent-3);
}

.marker-neutral {
  background: rgba(42, 42, 42, 0.2);
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.activity-description {
  margin: 0;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.activity-user {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.activity-target {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.activity-details {
  margin: 0;
  line-height: 1.5;
}

.activity-time {
  margin-top: 0.125rem;
}

@media (max-width: 768px) {
  .activity-item {
    gap: 1rem;
  }
}
</style>
