<template>
  <aside class="sidebar">
    <div class="sidebar-block">
      <h3 class="sidebar-title text-sm">Story Actions</h3>
      <div class="story-actions">
        <button 
          v-if="!isEditing"
          @click="$emit('edit')"
          class="btn-secondary btn-sm"
          style="width: 100%;"
        >
          Edit Story
        </button>
        
        <button 
          v-if="!story.published"
          @click="$emit('publish')"
          class="btn btn-sm"
          style="width: 100%;"
        >
          Publish
        </button>
        
        <button 
          v-else
          @click="$emit('unpublish')"
          class="btn-secondary btn-sm"
          style="width: 100%;"
        >
          Unpublish
        </button>
        
        <button 
          @click="$emit('delete')"
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
</template>

<script setup lang="ts">
defineProps<{
  story: any
  isEditing: boolean
  formatDate: (dateString: string) => string
}>()

defineEmits<{
  'edit': []
  'publish': []
  'unpublish': []
  'delete': []
}>()
</script>

<style scoped>
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

@media (max-width: 1024px) {
  .sidebar { position: static; }
}

@media (max-width: 768px) {
  .sidebar-block { padding: 1.5rem; }
}
</style>
