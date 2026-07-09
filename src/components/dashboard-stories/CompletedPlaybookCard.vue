<template>
  <div class="playbook-card" :data-accent="accent">
    <div class="label-row">
      <span class="label-id">
        <span class="accent-mark" aria-hidden="true"></span>
        Pattern {{ String(playbook.patternId).padStart(2, '0') }}
      </span>
      <span class="label-complete">Complete</span>
    </div>

    <h3 class="playbook-title">{{ playbookTitle(playbook) }}</h3>

    <span class="pattern-chip">{{ playbook.patternTitle }}</span>

    <p class="card-provenance">{{ playbook.location }}</p>

    <div class="playbook-stats">
      <div class="stat-item">
        <div class="stat-value">{{ playbook.tasks.length }}</div>
        <div class="stat-label">Tasks</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ getDuration(playbook) }}</div>
        <div class="stat-label">Duration</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ playbook.resources.length }}</div>
        <div class="stat-label">Resources</div>
      </div>
    </div>

    <dl class="caption">
      <div class="caption-row">
        <dt>Started</dt>
        <dd>{{ formatDate(playbook.startDate) }}</dd>
      </div>
      <div class="caption-row">
        <dt>Completed</dt>
        <dd>{{ formatDate(playbook.completedDate!) }}</dd>
      </div>
    </dl>

    <div class="playbook-actions">
      <button
        :disabled="generating"
        class="action-link action-primary"
        @click="$emit('generate', playbook.id)"
      >
        {{ generating ? 'Generating…' : 'Generate Story' }}
      </button>
      <router-link
        :to="`/dashboard/playbooks/${playbook.id}`"
        class="action-link action-muted"
      >
        View Playbook
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { playbookTitle } from '@/utils/formatters'

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
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  padding: 2.75rem 2.5rem 2.25rem;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.playbook-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 2.25rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.playbook-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.playbook-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.playbook-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.label-complete { color: var(--color-accent-2); }

.playbook-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.18;
  margin: 0 0 1.25rem;
}

.pattern-chip {
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  margin-bottom: 1.25rem;
}

.playbook-card[data-accent="1"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.playbook-card[data-accent="2"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.playbook-card[data-accent="3"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

.card-provenance {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin: 0 0 2.25rem;
}

.playbook-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 0.25rem 1rem;
}

.stat-item + .stat-item {
  border-left: 1px solid var(--hairline);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 0.35rem;
}

.stat-label {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.caption {
  margin: 0 0 2.5rem;
  border-top: 1px solid var(--hairline);
}

.caption-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2.5rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--hairline);
}

.caption-row dt {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.caption-row dd {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  text-align: right;
}

.playbook-actions {
  display: flex;
  gap: 2.5rem;
  align-items: baseline;
  margin-top: auto;
}

.action-link {
  background: none;
  border: none;
  padding: 0 0 2px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.action-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-primary {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-text-primary);
}

.action-muted {
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
}

.action-muted:hover {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

@media (max-width: 768px) {
  .playbook-card { padding: 2.25rem 1.75rem 2rem; }
  .playbook-title { font-size: 1.5rem; }
  .playbook-actions { flex-wrap: wrap; gap: 1.75rem; }
}
</style>
