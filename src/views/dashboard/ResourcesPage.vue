<template>
  <div class="resources-page">
    <section class="page-header gradient-bg">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Resources</h1>
            <p class="text-sm text-secondary">Browse patterns and stories for inspiration</p>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search resources..."
            class="search-input text-sm"
          />
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
            {{ tab.label }} ({{ tabCounts[tab.key] }})
          </button>
        </div>
      </div>
    </section>

    <section class="page-content" id="resources-content">
      <div class="container">
        <ResourceCardGrid
          :items="currentPaginatedItems"
          :type="activeTab"
          @add="addToPlaybook"
        />

        <Pagination
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-items="currentFilteredItems.length"
          :per-page-options="[12, 24, 48]"
          scroll-target-id="resources-content"
        />
      </div>
    </section>

    <ResourceAddModal
      :show="showAddModal"
      :resource="selectedResource"
      :resource-type="selectedResourceType"
      :playbooks="activePlaybooks"
      @close="closeModal"
      @select="selectPlaybook"
    />
  </div>
</template>

<script setup lang="ts">
import Pagination from '@/components/Pagination.vue'
import ResourceCardGrid from '@/components/resources/ResourceCardGrid.vue'
import ResourceAddModal from '@/components/resources/ResourceAddModal.vue'
import { useResourcesPage, type ResourceTab } from '@/composables/useResourcesPage'

const {
  activeTab, searchQuery, currentPage, itemsPerPage,
  tabCounts, currentFilteredItems, currentPaginatedItems,
  showAddModal, selectedResource, selectedResourceType, activePlaybooks,
  addToPlaybook, selectPlaybook, closeModal
} = useResourcesPage()

const tabs: { key: ResourceTab; label: string }[] = [
  { key: 'patterns', label: 'Patterns' },
  { key: 'stories', label: 'Stories' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'links', label: 'Links' },
]
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header {
  padding: 3rem var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
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

.search-input {
  width: 320px;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
  background: var(--color-bg-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.tabs-section {
  background: var(--color-bg-primary);
  padding: 0 var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  position: sticky;
  top: 0;
  z-index: 20;
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

@media (max-width: 768px) {
  .page-header { padding: 2rem var(--container-padding); }
  .page-title { font-size: 1.5rem; }
  .header-content { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .tabs { gap: 1.5rem; }
}
</style>
