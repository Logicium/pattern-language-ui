<template>
  <div class="playbooks-page">
    <section class="page-header gradient-bg">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Playbooks</h1>
            <p class="text-sm text-secondary">Track your pattern implementation journey</p>
          </div>
          <button class="btn">New Playbook</button>
        </div>
      </div>
    </section>

    <section class="tabs-section">
      <div class="container">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab text-xs', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>
      </div>
    </section>

    <section class="section page-content">
      <div class="container">
        <div v-if="filteredPlaybooks.length > 0" class="playbooks-grid">
          <PlaybookCard
            v-for="(playbook, index) in filteredPlaybooks"
            :key="playbook.id"
            :playbook="playbook"
            :accent="(index % 3) + 1"
            :show-creator="activeTab === 'local'"
            :format-date="formatDate"
          />
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">∅</div>
          <h3 v-if="activeTab === 'local'">No local playbooks found</h3>
          <h3 v-else>No {{ activeTab }} playbooks</h3>
          <p v-if="activeTab === 'local'" class="text-secondary">
            No published playbooks from your local community yet
          </p>
          <p v-else class="text-secondary">Start tracking your pattern implementations</p>
          <button v-if="activeTab !== 'local'" class="btn btn-lg">Create Playbook</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlaybookCard from '@/components/playbooks/PlaybookCard.vue'
import { usePlaybooksPage } from '@/composables/usePlaybooksPage'

const {
  activeTab, localPlaybooks,
  activePlaybooks, completedPlaybooks, pausedPlaybooks,
  filteredPlaybooks, formatDate
} = usePlaybooksPage()

const tabs = computed(() => [
  { key: 'active' as const, label: 'Active', count: activePlaybooks.value.length },
  { key: 'completed' as const, label: 'Completed', count: completedPlaybooks.value.length },
  { key: 'paused' as const, label: 'Paused', count: pausedPlaybooks.value.length },
  { key: 'local' as const, label: 'Local Playbooks', count: localPlaybooks.value.length },
])
</script>

<style scoped>
.playbooks-page {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.page-header {
  padding: 3rem var(--container-padding);
}

.page-header .container,
.page-content .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.tabs-section {
  background: var(--color-bg-primary);
  padding: 0 var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.tabs-section .container { padding: 0; }

.tabs {
  display: flex;
  gap: 3rem;
  max-width: var(--container-max);
  margin: 0 auto;
}

.tab {
  padding: 1.25rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.tab:hover { color: var(--color-text-primary); }

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent-1);
}

.page-content {
  padding: 3rem var(--container-padding);
  background: var(--color-bg-secondary);
}

.playbooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 8rem 0;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-tertiary);
  margin-bottom: 2rem;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin-bottom: 2rem;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .playbooks-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
  .header-content { flex-direction: column; align-items: stretch; }
  .tabs { gap: 1.5rem; }
  .playbooks-grid { grid-template-columns: 1fr; }
}
</style>
