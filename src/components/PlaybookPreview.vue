<template>
  <div class="playbook-preview">
    <div class="preview-header">
      <div class="preview-icon">📋</div>
      <div class="preview-title-section">
        <h3 class="preview-title">{{ playbook.patternTitle }}</h3>
        <p class="preview-subtitle text-xs text-tertiary">AI-Generated Playbook</p>
      </div>
    </div>

    <div class="preview-content">
      <div class="preview-row">
        <span class="preview-label text-xs text-tertiary">Challenge</span>
        <span class="preview-value text-sm">{{ playbook.challenge }}</span>
      </div>
      <div class="preview-row">
        <span class="preview-label text-xs text-tertiary">Location</span>
        <span class="preview-value text-sm">{{ playbook.location }}</span>
      </div>
      <div class="preview-row">
        <span class="preview-label text-xs text-tertiary">Timeline</span>
        <span class="preview-value text-sm">{{ formatDate(playbook.startDate) }} → {{ formatDate(playbook.targetCompletionDate) }}</span>
      </div>
      <div class="preview-row">
        <span class="preview-label text-xs text-tertiary">Tasks</span>
        <span class="preview-value text-sm">{{ playbook.tasks.length }} actionable steps</span>
      </div>
    </div>

    <div class="preview-tasks">
      <span class="tasks-header text-xs text-tertiary">First 3 Tasks:</span>
      <ul class="tasks-list">
        <li v-for="task in playbook.tasks.slice(0, 3)" :key="task.id" class="task-item text-sm">
          {{ task.title }}
        </li>
      </ul>
    </div>

    <button 
      v-if="!added"
      @click="handleAddToPlaybooks" 
      class="add-button"
      :disabled="adding"
    >
      <span v-if="adding">Adding...</span>
      <span v-else>+ Add to My Playbooks</span>
    </button>
    
    <div v-else class="added-message text-sm">
      ✓ Added to your playbooks
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Playbook } from '@/stores/playbooks'

interface Props {
  playbook: Playbook
}

const props = defineProps<Props>()
const emit = defineEmits<{
  addToPlaybooks: [playbook: Playbook]
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
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  border-left: 4px solid var(--color-accent-3);
  padding: 1.5rem;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.preview-icon {
  font-size: 2rem;
  line-height: 1;
}

.preview-title-section {
  flex: 1;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
}

.preview-subtitle {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.preview-row {
  display: flex;
  gap: 1rem;
}

.preview-label {
  min-width: 80px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.preview-value {
  flex: 1;
  color: var(--color-text-secondary);
}

.preview-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tasks-header {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  padding-left: 1.5rem;
  position: relative;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.task-item::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-accent-3);
}

.add-button {
  padding: 1rem 1.5rem;
  background: var(--color-accent-3);
  color: var(--color-bg-primary);
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.add-button:hover:not(:disabled) {
  background: var(--color-accent-2);
  transform: translateY(-1px);
}

.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.added-message {
  padding: 1rem;
  text-align: center;
  color: var(--color-accent-2);
  font-weight: var(--font-weight-medium);
  background: rgba(184, 212, 200, 0.1);
  border: 1px solid rgba(184, 212, 200, 0.3);
}
</style>
