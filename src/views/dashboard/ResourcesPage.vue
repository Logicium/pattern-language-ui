<template>
  <div class="resources-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-top">
          <div>
            <h1 class="page-title">Resources</h1>
            <p class="text-sm text-secondary">Browse patterns and stories</p>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="search-input text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <div class="container">
        <div class="tabs">
          <button
            :class="['tab text-xs', { active: activeTab === 'patterns' }]"
            @click="activeTab = 'patterns'"
          >
            Patterns ({{ filteredPatterns.length }})
          </button>
          <button
            :class="['tab text-xs', { active: activeTab === 'stories' }]"
            @click="activeTab = 'stories'"
          >
            Stories ({{ filteredStories.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="page-content">
      <div class="container">
        <!-- Patterns Tab -->
        <div v-if="activeTab === 'patterns'" class="resources-grid">
          <div
            v-for="pattern in filteredPatterns"
            :key="pattern.id"
            class="resource-card"
          >
            <div class="card-number text-xs text-tertiary">{{ String(pattern.id).padStart(2, '0') }}</div>
            <h3 class="card-title">{{ pattern.title }}</h3>
            <p class="card-description text-sm text-secondary">{{ pattern.description }}</p>
            <div v-if="pattern.addresses.length > 0" class="card-tags">
              <span
                v-for="addr in pattern.addresses.slice(0, 3)"
                :key="addr"
                class="tag text-xs text-tertiary"
              >
                {{ addr }}
              </span>
            </div>
            <div class="card-actions">
              <button class="action-btn text-xs" @click="viewPattern(pattern.id)">View</button>
              <button class="action-btn text-xs" @click="addToPlaybook(pattern, 'pattern')">Add to Playbook</button>
            </div>
          </div>
        </div>

        <!-- Stories Tab -->
        <div v-else class="resources-grid">
          <div
            v-for="story in filteredStories"
            :key="story.id"
            class="resource-card"
          >
            <div class="card-number text-xs text-tertiary">Story {{ String(story.id).padStart(2, '0') }}</div>
            <h3 class="card-title">{{ story.title }}</h3>
            <div class="card-location text-xs text-tertiary">{{ story.location }}</div>
            <p class="card-description text-sm text-secondary">{{ story.excerpt }}</p>
            <div class="card-meta text-xs text-tertiary">
              {{ story.timeframe }} · Pattern {{ story.patternId }}
            </div>
            <div class="card-actions">
              <button class="action-btn text-xs" @click="viewStory(story.id)">Read</button>
              <button class="action-btn text-xs" @click="addToPlaybook(story, 'story')">Add to Playbook</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Playbook Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add to Playbook</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-content">
          <p class="text-sm text-secondary" style="margin-bottom: var(--spacing-md)">
            Select a playbook for <strong>{{ selectedResource?.title }}</strong>
          </p>
          <div v-if="activePlaybooks.length > 0" class="playbook-list">
            <button
              v-for="playbook in activePlaybooks"
              :key="playbook.id"
              class="playbook-item"
              @click="selectPlaybook(playbook.id)"
            >
              <div>
                <div class="text-sm">{{ playbook.patternTitle }}</div>
                <div class="text-xs text-tertiary">{{ playbook.location }}</div>
              </div>
              <div class="text-xs text-tertiary">{{ playbook.progress }}%</div>
            </button>
          </div>
          <div v-else class="empty-message">
            <p class="text-sm text-secondary">No active playbooks</p>
            <button class="btn" @click="$router.push('/dashboard/playbooks')">Create Playbook</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { allPatterns, allStories } from '@/utils/data'

const router = useRouter()
const playbooksStore = usePlaybooksStore()

const activeTab = ref<'patterns' | 'stories'>('patterns')
const searchQuery = ref('')
const showAddModal = ref(false)
const selectedResource = ref<any>(null)
const selectedResourceType = ref<'pattern' | 'story'>('pattern')

const activePlaybooks = computed(() => playbooksStore.activePlaybooks)

const filteredPatterns = computed(() => {
  if (!searchQuery.value) return allPatterns
  const query = searchQuery.value.toLowerCase()
  return allPatterns.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.addresses.some(a => a.toLowerCase().includes(query))
  )
})

const filteredStories = computed(() => {
  if (!searchQuery.value) return allStories
  const query = searchQuery.value.toLowerCase()
  return allStories.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.excerpt.toLowerCase().includes(query) ||
    s.location.toLowerCase().includes(query)
  )
})

const viewPattern = (id: number) => {
  router.push(`/patterns/${id}`)
}

const viewStory = (id: number) => {
  router.push(`/stories#story-${id}`)
}

const addToPlaybook = (resource: any, type: 'pattern' | 'story') => {
  selectedResource.value = resource
  selectedResourceType.value = type
  showAddModal.value = true
}

const selectPlaybook = (playbookId: string) => {
  if (selectedResource.value) {
    playbooksStore.addResourceToPlaybook(playbookId, {
      type: selectedResourceType.value,
      id: selectedResource.value.id,
      title: selectedResource.value.title
    })
    closeModal()
  }
}

const closeModal = () => {
  showAddModal.value = false
  selectedResource.value = null
}
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.search-input {
  width: 300px;
  padding: 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

/* Tabs */
.tabs-section {
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.tabs {
  display: flex;
  gap: var(--spacing-md);
}

.tab {
  padding: var(--spacing-sm) 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

/* Content */
.page-content {
  padding: var(--spacing-lg) var(--spacing-md);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-md);
}

.resource-card {
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  padding: var(--spacing-md);
  transition: border-color var(--transition-fast);
}

.resource-card:hover {
  border-color: rgba(42, 42, 42, 0.15);
}

.card-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 0.5rem;
}

.card-location {
  margin-bottom: 0.5rem;
}

.card-description {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: var(--spacing-sm);
}

.tag {
  padding: 0.25rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  letter-spacing: 0.02em;
}

.card-meta {
  margin-bottom: var(--spacing-sm);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 42, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: var(--font-weight-normal);
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--color-text-primary);
}

.modal-content {
  padding: var(--spacing-md);
  overflow-y: auto;
}

.playbook-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.playbook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  text-align: left;
}

.playbook-item:hover {
  border-color: var(--color-text-primary);
}

.empty-message {
  text-align: center;
  padding: var(--spacing-md) 0;
}

.empty-message p {
  margin-bottom: var(--spacing-sm);
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
