<template>
  <div class="playbook-card" :data-accent="accent">
    <div class="playbook-header">
      <h3 class="playbook-title">{{ playbook.patternTitle }}</h3>
      <div class="completion-badge text-xs">✓ Complete</div>
    </div>

    <div class="playbook-location text-sm text-secondary">{{ playbook.location }}</div>

    <div class="playbook-meta">
      <div class="meta-item text-xs text-tertiary">
        <span class="meta-label">Pattern</span>
        <span class="meta-value">{{ String(playbook.patternId).padStart(2, '0') }}</span>
      </div>
      <div class="meta-item text-xs text-tertiary">
        <span class="meta-label">Started</span>
        <span class="meta-value">{{ formatDate(playbook.startDate) }}</span>
      </div>
      <div class="meta-item text-xs text-tertiary">
        <span class="meta-label">Completed</span>
        <span class="meta-value">{{ formatDate(playbook.completedDate!) }}</span>
      </div>
    </div>

    <div class="playbook-stats">
      <div class="stat-item">
        <div class="stat-value">{{ playbook.tasks.length }}</div>
        <div class="stat-label text-xs text-tertiary">Tasks</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ getDuration(playbook) }}</div>
        <div class="stat-label text-xs text-tertiary">Duration</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ playbook.resources.length }}</div>
        <div class="stat-label text-xs text-tertiary">Resources</div>
      </div>
    </div>

    <div class="playbook-actions">
      <button
        :disabled="generating"
        class="action-btn-primary text-xs"
        @click="$emit('generate', playbook.id)"
      >
        {{ generating ? 'GENERATING...' : 'GENERATE STORY' }}
      </button>
      <router-link
        :to="`/dashboard/playbooks/${playbook.id}`"
        class="action-btn-secondary text-xs"
      >
        VIEW PLAYBOOK
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playbook: any
  accent: number
  generating: boolean
  formatDate: (dateString: string) => string
  getDuration: (playbook: any) => string
}>()

defineEmits<{
  generate: [playbookId: number | string]
}>()
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
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(42, 42, 42, 0.06);
}

.playbook-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.playbook-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0;
  line-height: 1.3;
  flex: 1;
}

.completion-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(184, 212, 200, 0.15);
  color: var(--color-accent-2);
  border: 1px solid var(--color-accent-2);
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  flex-shrink: 0;
}

.playbook-location { margin-bottom: 1.5rem; }

.playbook-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-value { font-weight: var(--font-weight-medium); }

.playbook-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.stat-item { text-align: center; }

.stat-value {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.stat-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.playbook-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn-primary,
.action-btn-secondary {
  flex: 1;
  min-width: 140px;
  padding: 0.75rem 1.5rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.08em;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid;
  text-decoration: none;
  display: inline-block;
}

.action-btn-primary {
  background: var(--color-accent-2);
  color: var(--color-bg-primary);
  border-color: var(--color-accent-2);
}

.action-btn-primary:hover:not(:disabled) {
  background: var(--color-accent-3);
  border-color: var(--color-accent-3);
  transform: translateY(-2px);
}

.action-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: rgba(42, 42, 42, 0.15);
}

.action-btn-secondary:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.02);
}

@media (max-width: 768px) {
  .playbook-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-value { font-size: 1.5rem; }

  .playbook-actions { flex-direction: column; }

  .action-btn-primary,
  .action-btn-secondary { width: 100%; }
}
</style>
