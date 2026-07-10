<template>
  <div class="playbook-preview">
    <div class="label-row">
      <span class="label-id">
        <span class="accent-mark" aria-hidden="true"></span>
        AI-Generated Playbook
      </span>
      <span class="label-meta">{{ playbook.tasks.length }} tasks</span>
    </div>

    <h3 class="card-title">{{ playbookTitle(playbook) }}</h3>

    <span class="pattern-chip">
      Pattern {{ String(playbook.patternId).padStart(2, '0') }} — {{ playbook.patternTitle }}
    </span>

    <dl class="caption">
      <div class="caption-row">
        <dt>Challenge</dt>
        <dd>{{ playbook.challenge }}</dd>
      </div>
      <div class="caption-row">
        <dt>Location</dt>
        <dd>{{ playbook.location }}</dd>
      </div>
      <div class="caption-row">
        <dt>Timeline</dt>
        <dd>{{ formatDate(playbook.startDate) }} — {{ formatDate(playbook.targetCompletionDate) }}</dd>
      </div>
    </dl>

    <div class="preview-tasks">
      <span class="tasks-header">First Steps</span>
      <ul class="tasks-list">
        <li v-for="(task, i) in playbook.tasks.slice(0, 3)" :key="task.id" class="task-row">
          <span class="task-mark" :data-accent="(i % 3) + 1" aria-hidden="true"></span>
          <span class="task-text">{{ task.title }}</span>
        </li>
      </ul>
    </div>

    <div class="card-foot">
      <button
        v-if="!added"
        type="button"
        class="action-link action-primary"
        :disabled="adding"
        @click="handleAddToPlaybooks"
      >
        {{ adding ? 'Adding…' : '+ Add to My Playbooks' }}
      </button>
      <span v-else class="added-note">✓ Added to your playbooks</span>

      <button type="button" class="action-link action-muted" @click="emit('viewFull', playbook)">
        View Full Playbook
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { playbookTitle } from '@/utils/formatters'
import type { Playbook } from '@/stores/playbooks'

interface Props {
  playbook: Playbook
}

const props = defineProps<Props>()
const emit = defineEmits<{
  addToPlaybooks: [playbook: Playbook]
  viewFull: [playbook: Playbook]
}>()

const adding = ref(false)
const added = ref(false)

const handleAddToPlaybooks = async () => {
  adding.value = true
  try {
    emit('addToPlaybooks', props.playbook)
    // Wait a moment before showing success
    await new Promise(resolve => setTimeout(resolve, 500))
    added.value = true
  } finally {
    adding.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.playbook-preview {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  padding: 2.25rem 2rem 1.75rem;
  margin: 1rem 0;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.playbook-preview:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 1.5rem;
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
  background: var(--color-accent-3);
}

.label-meta { white-space: nowrap; }

.card-title {
  font-size: 1.375rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 1rem;
}

.pattern-chip {
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  background: color-mix(in srgb, var(--color-accent-3) 24%, transparent);
  margin-bottom: 1.5rem;
}

.caption {
  margin: 0 0 1.5rem;
  border-top: 1px solid var(--hairline);
}

.caption-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2rem;
  padding: 0.7rem 0;
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

.preview-tasks {
  margin-bottom: 1.75rem;
}

.tasks-header {
  display: block;
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 0.85rem;
}

.tasks-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.task-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.task-mark {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  transform: translateY(-1px);
}

.task-mark[data-accent="1"] { background: var(--color-accent-1); }
.task-mark[data-accent="2"] { background: var(--color-accent-2); }
.task-mark[data-accent="3"] { background: var(--color-accent-3); }

.task-text {
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--hairline);
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
  transition: color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
}

.action-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-primary {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-text-primary);
}

.action-primary:hover:not(:disabled) { opacity: 0.6; }

.action-muted {
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
  white-space: nowrap;
}

.action-muted:hover {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

.added-note {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-accent-2);
}
</style>
