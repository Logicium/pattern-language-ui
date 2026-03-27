<template>
  <div class="stories-page">
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Success Stories</h1>
        <p class="text-sm text-secondary">Your completed implementations and generated stories</p>
      </div>
    </section>

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

    <section class="page-content">
      <div class="container">
        <!-- Draft Stories -->
        <div v-if="activeTab === 'drafts'">
          <div v-if="draftStories.length > 0" class="stories-grid">
            <DashboardStoryCard
              v-for="story in draftStories"
              :key="story.id"
              :story="story"
              :format-date="formatDate"
            />
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">∅</div>
            <h3>No draft stories</h3>
            <p class="text-secondary">Generate a success story from a completed playbook</p>
            <button class="btn" @click="activeTab = 'completed'">View Completed Playbooks</button>
          </div>
        </div>

        <!-- Published Stories -->
        <div v-else-if="activeTab === 'published'">
          <div v-if="publishedStories.length > 0" class="stories-grid">
            <DashboardStoryCard
              v-for="story in publishedStories"
              :key="story.id"
              :story="story"
              :format-date="formatDate"
            />
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">∅</div>
            <h3>No published stories yet</h3>
            <p class="text-secondary">Publish a draft story to share it with the community</p>
            <button class="btn" @click="activeTab = 'drafts'" v-if="draftStories.length > 0">View Draft Stories</button>
          </div>
        </div>

        <!-- Completed Playbooks -->
        <div v-else-if="activeTab === 'completed'">
          <div v-if="completedPlaybooks.length > 0" class="playbooks-grid">
            <CompletedPlaybookCard
              v-for="(playbook, index) in completedPlaybooks"
              :key="playbook.id"
              :playbook="playbook"
              :accent="(index % 3) + 1"
              :generating="!!isGenerating[playbook.id]"
              :format-date="formatDate"
              :get-duration="getDuration"
              @generate="generateStory"
            />
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">∅</div>
            <h3>No completed playbooks yet</h3>
            <p class="text-secondary">Complete a playbook to generate your first success story</p>
            <button class="btn" @click="$router.push('/dashboard/playbooks')">View Active Playbooks</button>
          </div>
        </div>
      </div>
    </section>

    <Toast :show="showToast" :message="toastMessage" @update:show="showToast = $event" />
  </div>
</template>

<script setup lang="ts">
import { Toast } from '@/components'
import DashboardStoryCard from '@/components/dashboard-stories/DashboardStoryCard.vue'
import CompletedPlaybookCard from '@/components/dashboard-stories/CompletedPlaybookCard.vue'
import { useDashboardStories } from '@/composables/useDashboardStories'

const {
  activeTab, draftStories, publishedStories, completedPlaybooks,
  isGenerating, showToast, toastMessage,
  generateStory, formatDate, getDuration
} = useDashboardStories()
</script>

<style scoped>
.stories-page {
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

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.playbooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

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

.empty-state p { margin-bottom: 2rem; }

@media (max-width: 1024px) {
  .tabs { flex-direction: column; }
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
  .playbooks-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 1.75rem; }
}
</style>
