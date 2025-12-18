<template>
  <div class="generated-story-page">
    <div v-if="story">
      <!-- Hero -->
      <section class="story-hero" :style="{ backgroundColor: story.color || '#b8d4c8' }">
        <img 
          v-if="story.image" 
          :src="story.image" 
          :alt="story.location"
          class="hero-image"
        />
        <img 
          v-if="story.image" 
          :src="story.image" 
          :alt="story.location"
          class="hero-image-blurred"
        />
        <div class="color-overlay" :style="{ backgroundColor: story.color || '#b8d4c8' }"></div>
        <div class="container">
          <div class="hero-meta">
            <span class="story-location-tag text-xs">{{ story.location }}</span>
            <span 
              class="status-badge text-xs" 
              :class="story.published ? 'status-published' : 'status-draft'"
            >
              {{ story.published ? 'Published' : 'Draft' }}
            </span>
          </div>
          <h1 class="hero-title">{{ story.title }}</h1>
          <p class="hero-problem text-secondary">
            {{ story.problem }}
          </p>
          <div v-if="story.patterns && story.patterns.length > 0" class="patterns-tags">
            <span class="text-xs text-tertiary">Patterns Used:</span>
            <span
              v-for="patternTitle in story.patterns"
              :key="patternTitle"
              class="pattern-tag text-xs"
            >
              {{ patternTitle }}
            </span>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="section story-content">
        <div class="container">
          <div class="content-grid">
            <!-- Main Content -->
            <div class="main-content">
              <!-- Edit Mode -->
              <div v-if="isEditing" class="content-block">
                <h2 class="section-subtitle">Edit Story</h2>
                
                <div class="form-group">
                  <label class="text-xs text-tertiary">Title</label>
                  <input
                    v-model="editableStory.title"
                    type="text"
                    class="form-input"
                    placeholder="Story title..."
                  />
                </div>

                <div class="form-group">
                  <label class="text-xs text-tertiary">Problem Statement</label>
                  <textarea
                    v-model="editableStory.problem"
                    class="form-textarea"
                    rows="2"
                    placeholder="Brief problem description..."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="text-xs text-tertiary">Solution Summary</label>
                  <textarea
                    v-model="editableStory.solution"
                    class="form-textarea"
                    rows="2"
                    placeholder="Brief solution description..."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="text-xs text-tertiary">Full Story (Markdown)</label>
                  <textarea
                    v-model="editableStory.story"
                    class="story-textarea"
                    rows="20"
                    placeholder="Write your inspiring success story in markdown format..."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="text-xs text-tertiary">Color (Hex)</label>
                  <input
                    v-model="editableStory.color"
                    type="text"
                    class="form-input"
                    placeholder="#b8d4c8"
                  />
                </div>

                <div class="form-group">
                  <label class="text-xs text-tertiary">Image URL</label>
                  <input
                    v-model="editableStory.image"
                    type="text"
                    class="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                  <div v-if="editableStory.image" class="image-preview" style="margin-top: 1rem;">
                    <img :src="editableStory.image" alt="Story image preview" style="max-width: 100%; border-radius: 4px;" />
                  </div>
                  <p class="text-xs text-tertiary" style="margin-top: 0.5rem; opacity: 0.7;">
                    Paste an image URL or use the file upload button below
                  </p>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    style="display: none;"
                    @change="handleImageUpload"
                  />
                  <button 
                    type="button"
                    @click="triggerFileInput"
                    class="btn-secondary btn-sm"
                    style="margin-top: 0.75rem; width: auto;"
                  >
                    Upload Image File
                  </button>
                </div>

                <div class="form-actions" style="margin-top: 2rem;">
                  <button @click="saveStory" class="btn">Save Changes</button>
                  <button @click="cancelEditing" class="btn-text text-xs">Cancel</button>
                </div>
              </div>

              <!-- View Mode -->
              <div v-else>
                <!-- Markdown Story -->
                <div v-if="story.story" class="content-block story-body">
                  <VueMarkdownRender :source="story.story" />
                </div>

                <!-- Fallback if no story -->
                <div v-else class="content-block">
                  <h2 class="section-subtitle">Problem</h2>
                  <p class="text-secondary">{{ story.problem }}</p>
                  
                  <h2 class="section-subtitle" style="margin-top: 3rem;">Solution</h2>
                  <p class="text-secondary">{{ story.solution }}</p>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <aside class="sidebar">
              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Story Actions</h3>
                <div class="story-actions">
                  <button 
                    v-if="!isEditing"
                    @click="startEditing"
                    class="btn-secondary btn-sm"
                    style="width: 100%;"
                  >
                    Edit Story
                  </button>
                  
                  <button 
                    v-if="!story.published"
                    @click="publishStory"
                    class="btn btn-sm"
                    style="width: 100%;"
                  >
                    Publish
                  </button>
                  
                  <button 
                    v-else
                    @click="unpublishStory"
                    class="btn-secondary btn-sm"
                    style="width: 100%;"
                  >
                    Unpublish
                  </button>
                  
                  <button 
                    @click="showDeleteModal = true"
                    class="btn-secondary btn-sm btn-danger"
                    style="width: 100%;"
                  >
                    Delete Story
                  </button>
                </div>
              </div>

              <div v-if="story.playbookId" class="sidebar-block">
                <h3 class="sidebar-title text-sm">Source Playbook</h3>
                <p class="text-xs text-tertiary" style="line-height: 1.7; margin-bottom: 1rem;">
                  This story was generated from a completed playbook.
                </p>
                <router-link 
                  :to="`/dashboard/playbooks/${story.playbookId}`" 
                  class="btn-secondary btn-sm"
                  style="width: 100%; text-decoration: none;"
                >
                  View Playbook
                </router-link>
              </div>

              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Publishing Info</h3>
                <div class="publish-info">
                  <div class="info-item">
                    <span class="text-xs text-tertiary">Status</span>
                    <span class="text-sm">{{ story.published ? 'Published' : 'Draft' }}</span>
                  </div>
                  <div v-if="story.publishedDate" class="info-item">
                    <span class="text-xs text-tertiary">Published</span>
                    <span class="text-sm">{{ formatDate(story.publishedDate) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="text-xs text-tertiary">Created</span>
                    <span class="text-sm">{{ formatDate(story.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Navigation</h3>
                <div class="explore-links">
                  <router-link to="/dashboard/success-stories" class="explore-link text-xs">
                    ← All Stories
                  </router-link>
                  <router-link to="/dashboard/playbooks" class="explore-link text-xs">
                    Playbooks →
                  </router-link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>

    <!-- Not Found State -->
    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Story not found</p>
      <router-link to="/dashboard/success-stories" class="btn" style="margin-top: 2rem;">
        Back to Stories
      </router-link>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete Story"
      message="Are you sure you want to delete this success story? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      :danger="true"
      @confirm="handleDelete"
    />

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
import { useRoute, useRouter } from 'vue-router'
import VueMarkdownRender from 'vue-markdown-render'
import { userStoriesApi, uploadApi } from '@/services/api'
import { ConfirmModal, Toast } from '@/components'

const route = useRoute()
const router = useRouter()

const storyId = computed(() => Number(route.params.id))
const story = ref<any>(null)
const isEditing = ref(false)
const editableStory = ref<any>({})
const showDeleteModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// Fetch story on mount
onMounted(async () => {
  try {
    story.value = await userStoriesApi.getById(storyId.value)
  } catch (error) {
    console.error('Failed to fetch story:', error)
  }
})

const startEditing = () => {
  editableStory.value = { ...story.value }
  isEditing.value = true
}

const cancelEditing = () => {
  editableStory.value = {}
  isEditing.value = false
}

const saveStory = async () => {
  try {
    const updated = await userStoriesApi.update(story.value.id, editableStory.value)
    story.value = updated
    isEditing.value = false
    toastMessage.value = 'Story updated successfully'
    showToast.value = true
  } catch (error) {
    console.error('Failed to update story:', error)
    toastMessage.value = 'Failed to update story'
    showToast.value = true
  }
}

const publishStory = async () => {
  try {
    const updated = await userStoriesApi.update(story.value.id, {
      published: true,
      publishedDate: new Date().toISOString().split('T')[0]
    })
    story.value = updated
    toastMessage.value = 'Story published successfully'
    showToast.value = true
  } catch (error) {
    console.error('Failed to publish story:', error)
    toastMessage.value = 'Failed to publish story'
    showToast.value = true
  }
}

const unpublishStory = async () => {
  try {
    const updated = await userStoriesApi.update(story.value.id, {
      published: false,
      publishedDate: null as any
    })
    story.value = updated
    toastMessage.value = 'Story unpublished'
    showToast.value = true
  } catch (error) {
    console.error('Failed to unpublish story:', error)
    toastMessage.value = 'Failed to unpublish story'
    showToast.value = true
  }
}

const handleDelete = async () => {
  try {
    await userStoriesApi.delete(story.value.id)
    router.push('/dashboard/success-stories')
  } catch (error) {
    console.error('Failed to delete story:', error)
    toastMessage.value = 'Failed to delete story'
    showToast.value = true
  }
}

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    toastMessage.value = 'Please select an image file'
    showToast.value = true
    return
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toastMessage.value = 'Image size must be less than 5MB'
    showToast.value = true
    return
  }
  
  try {
    // Show loading message
    toastMessage.value = 'Uploading image...'
    showToast.value = true
    
    // Upload to backend (Vercel Blob)
    const result = await uploadApi.uploadImage(file)
    
    // Store the blob URL instead of base64
    editableStory.value.image = result.url
    
    toastMessage.value = 'Image uploaded successfully'
    showToast.value = true
  } catch (error) {
    console.error('Failed to upload image:', error)
    toastMessage.value = error instanceof Error ? error.message : 'Failed to upload image'
    showToast.value = true
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.generated-story-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.story-hero {
  padding: 8rem var(--container-padding) 6rem;
  position: relative;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  z-index: 0;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%);
}

.hero-image-blurred {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) blur(12px);
  z-index: 0;
  mask-image: linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, transparent 100%);
}

.color-overlay {
  position: absolute;
  inset: 0;
  mix-blend-mode: multiply;
  opacity: 0.85;
  pointer-events: none;
  z-index: 1;
}

.story-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, var(--color-bg-secondary) 100%);
  pointer-events: none;
  z-index: 2;
}

.story-hero .container {
  position: relative;
  z-index: 3;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
}

.hero-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.story-location-tag,
.status-badge {
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
  font-weight: var(--font-weight-medium);
}

.status-published {
  background: rgba(184, 212, 200, 0.95) !important;
  color: var(--color-text-primary);
}

.status-draft {
  background: rgba(42, 42, 42, 0.1) !important;
  color: var(--color-text-secondary);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: var(--font-weight-light);
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
  max-width: 900px;
}

.hero-problem {
  font-size: 1.25rem;
  line-height: 1.7;
  max-width: 800px;
  margin-bottom: 3rem;
}

.patterns-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.pattern-tag {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  letter-spacing: 0.05em;
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

/* Markdown Styling */
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

/* Forms */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-input,
.form-textarea,
.story-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-family);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  transition: border-color var(--transition-base);
}

.story-textarea {
  font-size: 1rem;
  line-height: 1.8;
}

.form-input:focus,
.form-textarea:focus,
.story-textarea:focus {
  outline: none;
  border-color: var(--color-accent-2);
}

.form-textarea,
.story-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-self: start;
  position: sticky;
  top: 6rem;
}

.sidebar-block {
  background: var(--color-bg-primary);
  padding: 2rem;
}

.sidebar-title {
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.story-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-sm {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  text-align: center;
}

.btn-secondary {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  text-align: center;
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.btn-secondary.btn-danger {
  border-color: rgba(232, 180, 160, 0.3);
  color: var(--color-accent-warm);
}

.btn-secondary.btn-danger:hover {
  border-color: var(--color-accent-1);
  background: rgba(232, 180, 160, 0.05);
}

.publish-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.explore-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.explore-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color var(--transition-base);
  letter-spacing: 0.05em;
}

.explore-link:hover {
  color: var(--color-text-primary);
}

.btn-text {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color var(--transition-base);
  padding: 0;
}

.btn-text:hover {
  color: var(--color-text-primary);
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-problem {
    font-size: 1rem;
  }

  .content-block {
    padding: 2rem;
  }

  .story-body {
    font-size: 1rem;
  }

  .sidebar-block {
    padding: 1.5rem;
  }
}
</style>
