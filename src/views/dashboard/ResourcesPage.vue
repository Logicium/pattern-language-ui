<template>
  <div class="resources-page">
    <!-- Header -->
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

    <!-- Tabs -->
    <section class="tabs-section">
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
          <button
            :class="['tab text-xs', { active: activeTab === 'challenges' }]"
            @click="activeTab = 'challenges'"
          >
            Challenges ({{ filteredChallenges.length }})
          </button>
          <button
            :class="['tab text-xs', { active: activeTab === 'links' }]"
            @click="activeTab = 'links'"
          >
            Links ({{ filteredLinks.length }})
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="page-content" id="resources-content">
      <div class="container">
        <!-- Patterns Tab -->
        <div v-if="activeTab === 'patterns'" class="resources-grid">
          <div
            v-for="(pattern, index) in paginatedPatterns"
            :key="pattern.id"
            class="resource-card"
            :data-accent="(index % 3) + 1"
          >
            <div class="card-header">
              <div class="card-number text-xs text-tertiary">{{ String(pattern.id).padStart(2, '0') }}</div>
            </div>
            <h3 class="card-title">{{ pattern.title }}</h3>
            <p class="card-description text-sm text-secondary">{{ pattern.description }}</p>
            <div v-if="pattern.addresses.length > 0" class="card-tags">
              <div class="tags-label text-xs text-tertiary">Addresses</div>
              <div class="tags-list">
                <span
                  v-for="addr in pattern.addresses.slice(0, 2)"
                  :key="addr"
                  class="tag text-xs"
                >
                  {{ addr }}
                </span>
              </div>
            </div>
            <div class="card-actions">
              <router-link :to="`/patterns/${pattern.id}`" class="action-btn-primary text-xs">View Pattern</router-link>
              <button class="action-btn-secondary text-xs" @click="addToPlaybook(pattern, 'pattern')">
                <span class="btn-icon">+</span> Add
              </button>
            </div>
          </div>
        </div>

        <!-- Stories Tab -->
        <div v-else-if="activeTab === 'stories'" class="resources-grid">
          <div
            v-for="(story, index) in paginatedStories"
            :key="story.id"
            class="resource-card"
            :data-accent="(index % 3) + 1"
          >
            <div class="card-header">
              <div class="card-number text-xs text-tertiary">Story {{ String(story.id).padStart(2, '0') }}</div>
            </div>
            <h3 class="card-title">{{ story.title }}</h3>
            <div class="card-location text-xs text-secondary">{{ story.location }}</div>
            <p class="card-description text-sm text-secondary">{{ story.solution || story.excerpt || story.problem }}</p>
            <div class="card-meta text-xs text-tertiary">
              {{ formatDate(story.publishedDate) }}
            </div>
            <div class="card-actions">
              <router-link :to="`/stories/${story.id}`" class="action-btn-primary text-xs">Read Story</router-link>
              <button class="action-btn-secondary text-xs" @click="addToPlaybook(story, 'story')">
                <span class="btn-icon">+</span> Add
              </button>
            </div>
          </div>
        </div>

        <!-- Challenges Tab -->
        <div v-else-if="activeTab === 'challenges'" class="resources-grid">
          <div
            v-for="(challenge, index) in paginatedChallenges"
            :key="challenge.id"
            class="resource-card"
            :data-accent="(index % 3) + 1"
          >
            <div class="card-header">
              <div class="card-number text-xs text-tertiary">WP{{ String(challenge.id).padStart(2, '0') }}</div>
            </div>
            <h3 class="card-title">{{ challenge.title }}</h3>
            <p class="card-description text-sm text-secondary">{{ challenge.description }}</p>
            <div v-if="challenge.relatedPatterns.length > 0" class="card-tags">
              <div class="tags-label text-xs text-tertiary">Related Patterns</div>
              <div class="tags-list">
                <span
                  v-for="pattern in challenge.relatedPatterns.slice(0, 2)"
                  :key="pattern"
                  class="tag text-xs"
                >
                  {{ pattern }}
                </span>
              </div>
            </div>
            <div class="card-actions">
              <router-link :to="`/challenges/${challenge.id}`" class="action-btn-primary action-btn-challenge text-xs">View Challenge</router-link>
              <button class="action-btn-secondary text-xs" @click="addToPlaybook(challenge, 'challenge')">
                <span class="btn-icon">+</span> Add
              </button>
            </div>
          </div>
        </div>

        <!-- Links Tab -->
        <div v-else class="resources-grid">
          <div
            v-for="(link, index) in paginatedLinks"
            :key="link.id"
            class="resource-card link-card"
            :data-accent="(index % 3) + 1"
          >
            <div class="card-header">
              <div class="card-number text-xs text-tertiary">{{ link.category || 'Resource' }}</div>
            </div>
            <h3 class="card-title">{{ link.name }}</h3>
            <div class="card-location text-xs text-secondary">{{ link.location }}</div>
            <p class="card-description text-sm text-secondary">{{ link.description }}</p>
            <div class="link-url text-xs text-tertiary">
              {{ getHostname(link.url) }}
            </div>
            <div class="card-actions">
              <a :href="link.url" target="_blank" rel="noopener noreferrer" class="action-btn-primary action-btn-link text-xs">
                Visit Site
              </a>
              <button class="action-btn-secondary text-xs" @click="addToPlaybook(link, 'link')">
                <span class="btn-icon">+</span> Add
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-items="activeTab === 'patterns' ? filteredPatterns.length : activeTab === 'stories' ? filteredStories.length : activeTab === 'challenges' ? filteredChallenges.length : filteredLinks.length"
          :per-page-options="[12, 24, 48]"
          scroll-target-id="resources-content"
        />
      </div>
    </section>

    <!-- Add to Playbook Modal -->
    <transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Add to Playbook</h3>
            <button class="modal-close" @click="closeModal">×</button>
          </div>
          <div class="modal-content">
            <p class="text-sm text-secondary modal-subtitle">
              Select a playbook for <strong>{{ selectedResourceType === 'link' ? selectedResource?.name : selectedResource?.title }}</strong>
            </p>
            <div v-if="activePlaybooks.length > 0" class="playbook-list">
              <button
                v-for="(playbook, index) in activePlaybooks"
                :key="playbook.id"
                class="playbook-item"
                :data-accent="(index % 3) + 1"
                @click="selectPlaybook(playbook.id)"
              >
                <div class="playbook-info">
                  <div class="text-sm playbook-title">{{ playbook.patternTitle }}</div>
                  <div class="text-xs text-tertiary">{{ playbook.location }}</div>
                </div>
                <div class="playbook-progress">
                  <div class="text-xs text-tertiary">{{ playbook.progress }}%</div>
                </div>
              </button>
            </div>
            <div v-else class="empty-message">
              <div class="empty-icon">∅</div>
              <p class="text-sm text-secondary">No active playbooks</p>
              <button class="btn" @click="$router.push('/dashboard/playbooks')">Create Playbook</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { usePatterns } from '@/composables/usePatterns'
import { useStories } from '@/composables/useStories'
import { useChallenges } from '@/composables/useChallenges'
import { useResources } from '@/composables/useResources'
import Pagination from '@/components/Pagination.vue'

const { patterns: allPatterns } = usePatterns()
const { stories: allStories } = useStories()
const { challenges: allChallenges } = useChallenges()
const { resources: allLinks } = useResources()

const router = useRouter()
const playbooksStore = usePlaybooksStore()

const activeTab = ref<'patterns' | 'stories' | 'challenges' | 'links'>('patterns')
const searchQuery = ref('')
const showAddModal = ref(false)
const selectedResource = ref<any>(null)
const selectedResourceType = ref<'pattern' | 'story' | 'challenge' | 'link'>('pattern')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(12)

const activePlaybooks = computed(() => playbooksStore.activePlaybooks)

// Reset to page 1 when tab or search changes
watch([activeTab, searchQuery], () => {
  currentPage.value = 1
})

const filteredPatterns = computed(() => {
  if (!searchQuery.value) return allPatterns.value
  const query = searchQuery.value.toLowerCase()
  return allPatterns.value.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.addresses.some(a => a.toLowerCase().includes(query))
  )
})

const filteredStories = computed(() => {
  if (!searchQuery.value) return allStories.value
  const query = searchQuery.value.toLowerCase()
  return allStories.value.filter(s =>
    s.title.toLowerCase().includes(query) ||
    (s.excerpt && s.excerpt.toLowerCase().includes(query)) ||
    s.problem.toLowerCase().includes(query) ||
    s.location.toLowerCase().includes(query)
  )
})

const filteredChallenges = computed(() => {
  if (!searchQuery.value) return allChallenges.value
  const query = searchQuery.value.toLowerCase()
  return allChallenges.value.filter(c =>
    c.title.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query) ||
    c.context.toLowerCase().includes(query)
  )
})

const filteredLinks = computed(() => {
  if (!searchQuery.value) return allLinks.value
  const query = searchQuery.value.toLowerCase()
  return allLinks.value.filter(l =>
    l.name.toLowerCase().includes(query) ||
    l.location.toLowerCase().includes(query) ||
    l.description.toLowerCase().includes(query)
  )
})

// Paginated data
const paginatedPatterns = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPatterns.value.slice(start, end)
})

const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStories.value.slice(start, end)
})

const paginatedChallenges = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredChallenges.value.slice(start, end)
})

const paginatedLinks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLinks.value.slice(start, end)
})

const viewPattern = (id: number) => {
  router.push(`/patterns/${id}`)
}

const viewStory = (id: number) => {
  router.push(`/stories/${id}`)
}

const viewChallenge = (id: number) => {
  router.push(`/challenges/${id}`)
}

const openLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const addToPlaybook = (resource: any, type: 'pattern' | 'story' | 'challenge' | 'link') => {
  selectedResource.value = resource
  selectedResourceType.value = type
  showAddModal.value = true
}

const selectPlaybook = (playbookId: string) => {
  if (selectedResource.value) {
    const resource: any = {
      type: selectedResourceType.value,
      id: selectedResource.value.id,
      title: selectedResourceType.value === 'link' ? selectedResource.value.name : selectedResource.value.title
    }
    
    // Add URL for link resources
    if (selectedResourceType.value === 'link') {
      resource.url = selectedResource.value.url
    }
    
    playbooksStore.addResourceToPlaybook(playbookId, resource)
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

/* Header */
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

/* Tabs */
.tabs-section {
  background: var(--color-bg-primary);
  padding: 0 var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.tabs-section .container {
  padding: 0;
}

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

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent-1);
}

/* Content */
.page-content {
  padding: 3rem var(--container-padding);
  background: var(--color-bg-secondary);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
}

/* Resource Cards */
.resource-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.resource-card[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.resource-card[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.resource-card[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.resource-card:hover {
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.card-header {
  margin-bottom: 1rem;
}

.card-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.card-location {
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.card-description {
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

.card-tags {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tags-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: rgba(42, 42, 42, 0.05);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}

.card-meta {
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn-primary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  position: relative;
  z-index: 1;
  text-decoration: none;
  text-align: center;
  display: inline-block;
}

/* Default border swirl effect (inherited from global .btn) */
.action-btn-primary::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1));
  background-size: 300% 100%;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: -1;
  animation: borderSwirl 3s linear infinite;
}

.action-btn-primary:hover::before {
  opacity: 1;
}

.action-btn-primary:hover {
  color: var(--color-bg-primary);
  border-color: transparent;
}

/* Override for Challenges and Links - simple fade to black */
.action-btn-challenge::before,
.action-btn-link::before {
  background: var(--color-text-primary);
  animation: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn-challenge:hover::before,
.action-btn-link:hover::before {
  opacity: 1;
}

.action-btn-challenge:hover,
.action-btn-link:hover {
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
}

.action-btn-secondary {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn-secondary:hover {
  border-color: var(--color-accent-2);
  color: var(--color-text-primary);
  background: rgba(184, 212, 200, 0.05);
}

.btn-icon {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 42, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(42, 42, 42, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  border-radius: 50%;
}

.modal-close:hover {
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.05);
  transform: rotate(90deg);
}

.modal-content {
  padding: 2rem;
  overflow-y: auto;
  background: var(--color-bg-secondary);
}

.modal-subtitle {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.playbook-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playbook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.playbook-item[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.playbook-item[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.playbook-item[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.playbook-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(42, 42, 42, 0.08);
}

.playbook-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.playbook-title {
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.playbook-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-message {
  text-align: center;
  padding: 3rem 0;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-text-tertiary);
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-message p {
  margin-bottom: 1.5rem;
}

/* Link Card Specific Styles */
.link-card .link-url {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(42, 42, 42, 0.03);
  border-left: 2px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.02em;
  font-family: 'Courier New', monospace;
}

.link-icon {
  font-size: 1rem;
  color: var(--color-text-tertiary);
}

.link-card:hover .link-icon {
  color: var(--color-text-primary);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal {
  transform: scale(0.95) translateY(20px);
}

.modal-leave-to .modal {
  transform: scale(0.95) translateY(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .resources-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem var(--container-padding);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .tabs {
    gap: 1.5rem;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }

  .resource-card {
    padding: 2rem;
  }

  .modal {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>
