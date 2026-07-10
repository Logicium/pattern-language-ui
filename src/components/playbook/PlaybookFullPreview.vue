<template>
  <div class="playbook-full-preview">
    <PlaybookHero :playbook="playbook" />

    <section class="section preview-content">
      <div class="container">
        <div class="content-layout">
          <PlaybookSummary :playbook="playbook" />

          <div v-if="playbook.kpis?.length" class="content-block">
            <div class="block-header">
              <h2 class="section-subtitle">KPIs</h2>
            </div>
            <div class="kpi-grid">
              <div v-for="kpi in playbook.kpis" :key="kpi.id" class="kpi-item">
                <span class="kpi-category text-xs text-tertiary">{{ formatCategory(kpi.category) }}</span>
                <h3 class="kpi-title">{{ kpi.title }}</h3>
                <p class="kpi-description text-sm text-secondary">{{ kpi.description }}</p>
                <div v-if="kpi.target" class="kpi-target text-xs text-tertiary">
                  Target: {{ kpi.target }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="playbook.tasks?.length" class="content-block">
            <div class="block-header">
              <h2 class="section-subtitle">Tasks ({{ playbook.tasks.length }})</h2>
            </div>
            <ul class="tasks-list">
              <li v-for="task in playbook.tasks" :key="task.id" class="task-row">
                <div class="task-bullet" :class="{ done: task.completed }"></div>
                <div class="task-body">
                  <div class="task-title">{{ task.title }}</div>
                  <div v-if="task.description" class="task-desc text-sm text-secondary">{{ task.description }}</div>
                  <div v-if="task.dueDate" class="task-meta text-xs text-tertiary">Due {{ formatDate(task.dueDate) }}</div>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="playbook.notes" class="content-block">
            <div class="block-header">
              <h2 class="section-subtitle">Notes &amp; Learnings</h2>
            </div>
            <p class="notes-text text-secondary">{{ playbook.notes }}</p>
          </div>

          <div v-if="playbook.resources?.length" class="content-block">
            <div class="block-header">
              <h2 class="section-subtitle">Resources</h2>
            </div>
            <ul class="resources-list">
              <li v-for="r in playbook.resources" :key="`${r.type}-${r.id}`" class="resource-row">
                <span class="resource-type text-xs text-tertiary">{{ r.type }}</span>
                <span class="resource-title">{{ r.title }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import PlaybookHero from './PlaybookHero.vue'
import PlaybookSummary from './PlaybookSummary.vue'
import type { Playbook } from '@/stores/playbooks'

defineProps<{ playbook: Playbook }>()
defineEmits<{ close: [] }>()

const formatCategory = (category: string) =>
  category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(s))
</script>

<style scoped>
.playbook-full-preview {
  position: relative;
  min-height: 100%;
}

.preview-content {
  padding: 3rem 0 5rem;
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.content-block {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.block-header { border-bottom: 1px solid rgba(42, 42, 42, 0.08); padding-bottom: 0.75rem; }

.section-subtitle {
  font-size: 1.25rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.kpi-item {
  padding: 1rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid var(--color-accent-1, #d47b5f);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kpi-category { text-transform: uppercase; letter-spacing: 0.08em; }
.kpi-title { font-size: 0.95rem; font-weight: 500; }

.tasks-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }

.task-row {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(42, 42, 42, 0.05);
}

.task-bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid rgba(42, 42, 42, 0.3);
  margin-top: 0.3rem;
}

.task-bullet.done {
  background: var(--color-accent-2, #b8d4c8);
  border-color: var(--color-accent-2, #b8d4c8);
}

.task-body { display: flex; flex-direction: column; gap: 0.25rem; }
.task-title { font-size: 0.95rem; }

.notes-text { line-height: 1.7; white-space: pre-wrap; }

.resources-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }

.resource-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.resource-type {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  min-width: 70px;
}
</style>
