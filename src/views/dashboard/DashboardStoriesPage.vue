<template>
  <div class="stories-page">
    <!-- Header -->
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Success Stories</h1>
        <p class="text-sm text-secondary">Your completed implementations and generated stories</p>
      </div>
    </section>

    <!-- Tabs -->
    <section class="tabs-section">
      <div class="container">
        <div class="tabs">
          <button
            :class="['tab text-xs', { active: activeTab === 'drafts' }]"
            @click="activeTab = 'drafts'"
          >
            Draft Stories ({{ draftStories.length }})
          </button>
          <button
            :class="['tab text-xs', { active: activeTab === 'published' }]"
            @click="activeTab = 'published'"
          >
            Published Stories ({{ publishedStories.length }})
          </button>
          <button
            :class="['tab text-xs', { active: activeTab === 'completed' }]"
            @click="activeTab = 'completed'"
          >
            Completed Playbooks ({{ completedPlaybooks.length }})
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="page-content">
      <div class="container">
        <!-- Draft Stories Tab -->
        <div v-if="activeTab === 'drafts'">
          <div v-if="draftStories.length > 0" class="stories-grid">
            <router-link
              v-for="story in draftStories"
              :key="story.id"
              :to="`/dashboard/success-stories/${story.id}`"
              class="story-card draft-card"
              :style="{ backgroundColor: story.color || '#b8d4c8' }"
            >
              <div class="story-overlay"></div>
              <div class="story-content">
                <div class="story-meta">
                  <span class="story-location text-xs">{{ story.location }}</span>
                  <span class="story-status text-xs status-draft">Draft</span>
                </div>
                <h2 class="story-title">{{ story.title }}</h2>
                <p class="story-problem text-sm">{{ story.problem }}</p>
                <div v-if="story.patterns && story.patterns.length > 0" class="story-patterns">
                  <span 
                    v-for="pattern in story.patterns.slice(0, 2)" 
                    :key="pattern"
                    class="pattern-pill text-xs"
                  >
                    {{ pattern }}
                  </span>
                </div>
              </div>
            </router-link>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">∅</div>
            <h3>No draft stories</h3>
            <p class="text-secondary">Generate a success story from a completed playbook</p>
            <button class="btn" @click="activeTab = 'completed'">
              View Completed Playbooks
            </button>
          </div>
        </div>

        <!-- Published Stories Tab -->
        <div v-else-if="activeTab === 'published'">
          <div v-if="publishedStories.length > 0" class="stories-grid">
            <router-link
              v-for="story in publishedStories"
              :key="story.id"
              :to="`/dashboard/success-stories/${story.id}`"
              class="story-card published-card"
              :style="{ backgroundColor: story.color || '#b8d4c8' }"
            >
              <div class="story-overlay"></div>
              <div class="story-content">
                <div class="story-meta">
                  <span class="story-location text-xs">{{ story.location }}</span>
                  <span class="story-status text-xs status-published">Published</span>
                </div>
                <h2 class="story-title">{{ story.title }}</h2>
                <p class="story-problem text-sm">{{ story.problem }}</p>
                <div v-if="story.patterns && story.patterns.length > 0" class="story-patterns">
                  <span 
                    v-for="pattern in story.patterns.slice(0, 2)" 
                    :key="pattern"
                    class="pattern-pill text-xs"
                  >
                    {{ pattern }}
                  </span>
                </div>
                <div v-if="story.publishedDate" class="publish-date text-xs text-tertiary">
                  Published {{ formatDate(story.publishedDate) }}
                </div>
              </div>
            </router-link>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">∅</div>
            <h3>No published stories yet</h3>
            <p class="text-secondary">Publish a draft story to share it with the community</p>
            <button class="btn" @click="activeTab = 'drafts'" v-if="draftStories.length > 0">
              View Draft Stories
            </button>
          </div>
        </div>

        <!-- Completed Playbooks Tab -->
        <div v-else-if="activeTab === 'completed'">
          <div v-if="completedPlaybooks.length > 0" class="playbooks-grid">
            <div
              v-for="(playbook, index) in completedPlaybooks"
              :key="playbook.id"
              class="playbook-card"
              :data-accent="(index % 3) + 1"
            >
              <!-- Pattern Number -->
              <div class="playbook-header">
                <h3 class="playbook-title">{{ playbook.patternTitle }}</h3>
                <div class="completion-badge text-xs">
                  ✓ Complete
                </div>
              </div>

              <div class="playbook-location text-sm text-secondary">{{ playbook.location }}</div>

              <!-- Meta Info -->
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

              <!-- Stats -->
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

              <!-- Actions -->
              <div class="playbook-actions">
                <button 
                  @click="generateStory(playbook.id)"
                  :disabled="isGenerating[playbook.id]"
                  class="action-btn-primary text-xs"
                >
                  {{ isGenerating[playbook.id] ? 'GENERATING...' : 'GENERATE STORY' }}
                </button>
                <router-link 
                  :to="`/dashboard/playbooks/${playbook.id}`" 
                  class="action-btn-secondary text-xs"
                >
                  VIEW PLAYBOOK
                </router-link>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">∅</div>
            <h3>No completed playbooks yet</h3>
            <p class="text-secondary">Complete a playbook to generate your first success story</p>
            <button class="btn" @click="$router.push('/dashboard/playbooks')">
              View Active Playbooks
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { userStoriesApi } from '@/services/api'
import { Toast } from '@/components'

const router = useRouter()
const playbooksStore = usePlaybooksStore()

const activeTab = ref<'drafts' | 'published' | 'completed'>('drafts')
const userStories = ref<any[]>([])
const isGenerating = ref<Record<number | string, boolean>>({})
const showToast = ref(false)
const toastMessage = ref('')

// Fetch data on mount
onMounted(async () => {
  playbooksStore.fetchPlaybooks()
  try {
    userStories.value = await userStoriesApi.getAll()
  } catch (error) {
    console.error('Failed to fetch user stories:', error)
  }
})

const completedPlaybooks = computed(() => playbooksStore.completedPlaybooks)
const draftStories = computed(() => userStories.value.filter(s => !s.published))
const publishedStories = computed(() => userStories.value.filter(s => s.published))

const generateStory = async (playbookId: number | string) => {
  if (typeof playbookId !== 'number') return
  
  isGenerating.value[playbookId] = true
  try {
    const story = await userStoriesApi.generateFromPlaybook(playbookId)
    toastMessage.value = 'Success story generated!'
    showToast.value = true
    
    // Refresh user stories list
    userStories.value = await userStoriesApi.getAll()
    
    // Switch to drafts tab and navigate to story
    activeTab.value = 'drafts'
    setTimeout(() => {
      router.push(`/dashboard/success-stories/${story.id}`)
    }, 1000)
  } catch (error) {
    console.error('Failed to generate success story:', error)
    toastMessage.value = 'Failed to generate success story'
    showToast.value = true
  } finally {
    isGenerating.value[playbookId] = false
  }
}

const getDuration = (playbook: any) => {
  const start = new Date(playbook.startDate)
  const end = new Date(playbook.completedDate!)
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays}d`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
  return `${Math.floor(diffDays / 365)}y`
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
.stories-page {
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

/* Header */
.page-header {
  padding: 3rem var(--container-padding);
}

.page-header .container,
.page-content .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
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

/* Stories Grid (for draft and published) */
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.story-card {
  position: relative;
  padding: 3rem 2rem;
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
  transition: transform var(--transition-base);
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-overlay {
  position: absolute;
  inset: 0;
  background: rgba(42, 42, 42, 0.05);
  mix-blend-mode: multiply;
}

.story-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.story-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.story-location {
  padding: 0.375rem 0.75rem;
  background: rgba(253, 251, 247, 0.95);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.story-status {
  padding: 0.375rem 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  font-size: 0.75rem;
}

.status-published {
  background: rgba(184, 212, 200, 0.95);
  color: var(--color-text-primary);
}

.status-draft {
  background: rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
}

.story-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin-bottom: 0.5rem;
  color: #2a2a2a;
}

.story-problem {
  line-height: 1.6;
  color: #2a2a2a;
  flex: 1;
}

.story-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pattern-pill {
  padding: 0.375rem 0.75rem;
  background: rgba(253, 251, 247, 0.9);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  color: #2a2a2a;
}

.publish-date {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(42, 42, 42, 0.1);
  color: #2a2a2a;
}

/* Playbooks Grid (for completed playbooks) */
.playbooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.playbook-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.playbook-card[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.playbook-card[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.playbook-card[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

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

.playbook-location {
  margin-bottom: 1.5rem;
}

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

.meta-value {
  font-weight: var(--font-weight-medium);
}

.playbook-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.stat-item {
  text-align: center;
}

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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 6rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .tabs {
    flex-direction: column;
  }

  .tab {
    max-width: none;
    border-bottom: 1px solid rgba(42, 42, 42, 0.08);
    border-left: 2px solid transparent;
  }

  .tab.active {
    border-bottom-color: rgba(42, 42, 42, 0.08);
    border-left-color: var(--color-accent-2);
  }
}

@media (max-width: 768px) {
  .stories-grid,
  .playbooks-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .playbook-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .playbook-actions {
    flex-direction: column;
  }

  .action-btn-primary,
  .action-btn-secondary {
    width: 100%;
  }
}
</style>
