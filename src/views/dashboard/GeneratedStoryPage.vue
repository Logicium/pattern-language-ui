<template>
  <div class="generated-story-page">
    <div v-if="story">
      <GeneratedStoryHero :story="story" />

      <section class="section story-content">
        <div class="container">
          <div class="content-grid">
            <div class="main-content">
              <GeneratedStoryEditForm
                v-if="isEditing"
                :editable-story="editableStory"
                @save="saveStory"
                @cancel="cancelEditing"
                @upload="uploadStoryImage"
              />

              <div v-else>
                <div v-if="story.story" class="content-block story-body">
                  <VueMarkdownRender :source="story.story" />
                </div>
                <div v-else class="content-block">
                  <h2 class="section-subtitle">Problem</h2>
                  <p class="text-secondary">{{ story.problem }}</p>
                  <h2 class="section-subtitle" style="margin-top: 3rem;">Solution</h2>
                  <p class="text-secondary">{{ story.solution }}</p>
                </div>
              </div>
            </div>

            <GeneratedStorySidebar
              :story="story"
              :is-editing="isEditing"
              :format-date="formatDate"
              @edit="startEditing"
              @publish="publishStory"
              @unpublish="unpublishStory"
              @delete="showDeleteModal = true"
            />
          </div>
        </div>
      </section>
    </div>

    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Story not found</p>
      <router-link to="/dashboard/success-stories" class="btn" style="margin-top: 2rem;">
        Back to Stories
      </router-link>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete Story"
      message="Are you sure you want to delete this success story? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDelete"
    />

    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import VueMarkdownRender from 'vue-markdown-render'
import { ConfirmModal, Toast } from '@/components'
import GeneratedStoryHero from '@/components/story/GeneratedStoryHero.vue'
import GeneratedStoryEditForm from '@/components/story/GeneratedStoryEditForm.vue'
import GeneratedStorySidebar from '@/components/story/GeneratedStorySidebar.vue'
import { useGeneratedStory } from '@/composables/useGeneratedStory'

const {
  story, isEditing, editableStory, showDeleteModal, showToast, toastMessage,
  startEditing, cancelEditing, saveStory, publishStory, unpublishStory,
  handleDelete, uploadStoryImage, formatDate
} = useGeneratedStory()
</script>

<style scoped>
.generated-story-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.story-content {
  background: var(--color-bg-secondary);
  padding: 4rem var(--container-padding);
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.content-block {
  background: var(--color-bg-primary);
  padding: 4rem;
}

.section-subtitle {
  font-size: 1.75rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

.story-body {
  font-size: 1.125rem;
  line-height: 1.9;
  letter-spacing: -0.01em;
}

.story-body :deep(h2) {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin: 3rem 0 1.5rem 0;
  letter-spacing: -0.02em;
}

.story-body :deep(h3) {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin: 2.5rem 0 1rem 0;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
}

.story-body :deep(p) {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.story-body :deep(strong) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .content-block { padding: 2rem; }
  .story-body { font-size: 1rem; }
}
</style>
