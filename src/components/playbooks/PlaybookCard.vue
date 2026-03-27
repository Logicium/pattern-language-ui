<template>
  <div class="playbook-card" :data-accent="accent">
    <div class="card-header">
      <h3 class="card-title">{{ playbook.patternTitle }}</h3>
      <div class="progress-badge text-xs">{{ playbook.progress }}%</div>
    </div>

    <div class="card-location text-sm text-secondary">{{ playbook.location }}</div>

    <div v-if="showCreator && playbook.user" class="creator-info text-xs text-tertiary">
      <span>By {{ playbook.user.name }}</span>
    </div>

    <div class="card-meta">
      <div class="meta-item text-xs text-tertiary">
        <span class="meta-label">Pattern</span>
        <span class="meta-value">{{ String(playbook.patternId).padStart(2, '0') }}</span>
      </div>
      <div class="meta-item text-xs text-tertiary">
        <span class="meta-label">Challenge</span>
        <span class="meta-value">{{ playbook.challenge }}</span>
      </div>
      <div class="meta-item text-xs text-tertiary">
        <span class="meta-label">Due</span>
        <span class="meta-value">{{ formatDate(playbook.targetCompletionDate) }}</span>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{
            width: `${playbook.progress}%`,
            backgroundSize: `${100 / (playbook.progress || 1) * 100}% 100%`
          }"
        ></div>
      </div>
      <div class="progress-label text-xs text-tertiary">
        {{ tasksCompleted }} of {{ playbook.tasks.length }} tasks complete
      </div>
    </div>

    <div class="card-actions">
      <router-link :to="`/dashboard/playbooks/${playbook.id}`" class="btn action-btn-primary">
        VIEW DETAILS
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  playbook: any
  accent: number
  showCreator?: boolean
  formatDate: (dateString: string) => string
}>()

const tasksCompleted = computed(() =>
  props.playbook.tasks.filter((t: any) => t.completed).length
)
</script>

<style scoped>
.playbook-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.playbook-card[data-accent="1"] { border-left-color: var(--color-accent-1); }
.playbook-card[data-accent="2"] { border-left-color: var(--color-accent-2); }
.playbook-card[data-accent="3"] { border-left-color: var(--color-accent-3); }

.playbook-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.progress-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(42, 42, 42, 0.05);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  flex-shrink: 0;
}

.card-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0;
  line-height: 1.3;
  flex: 1;
}

.card-location { margin-bottom: 1rem; }

.creator-info {
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  font-style: italic;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  letter-spacing: 0.05em;
}

.meta-label {
  text-transform: uppercase;
  opacity: 0.6;
}

.meta-value { font-weight: var(--font-weight-medium); }

.progress-container { margin-bottom: 2rem; }

.progress-bar {
  height: 3px;
  background: rgba(42, 42, 42, 0.08);
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  background-position: left center;
  background-repeat: no-repeat;
  transition: width var(--transition-base), background-size var(--transition-base);
}

.progress-label { letter-spacing: 0.05em; }

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn-primary {
  flex: 1;
  text-align: center;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
}
</style>
