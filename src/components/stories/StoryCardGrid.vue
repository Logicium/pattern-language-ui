<template>
  <div class="stories-grid">
    <div
      v-for="story in stories"
      :key="story.id"
      class="story-card card"
    >
      <div class="story-visual" :style="{ backgroundColor: story.color }">
        <img
          v-if="story.image"
          :src="story.image"
          :alt="story.location"
          class="story-image"
        />
        <div class="color-overlay" :style="{ backgroundColor: story.color }"></div>
        <div class="story-location text-xs">{{ story.location }}</div>
      </div>
      <div class="story-content">
        <h3>{{ story.title }}</h3>
        <div class="story-section">
          <span class="story-label text-xs text-tertiary">Challenge</span>
          <p class="text-sm text-secondary">{{ story.problem }}</p>
        </div>
        <div class="story-section">
          <span class="story-label text-xs text-tertiary">Solution</span>
          <p class="text-sm text-secondary">{{ story.solution }}</p>
        </div>
        <div class="story-patterns">
          <span v-for="p in story.patterns" :key="p" class="tag text-xs text-secondary">
            {{ p }}
          </span>
        </div>
        <router-link :to="`/stories/${story.id}`" class="read-more-btn text-sm">
          Read More →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stories: any[]
}>()
</script>

<style scoped>
.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.story-card {
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-visual {
  height: 280px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;
  overflow: hidden;
}

.story-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
  mix-blend-mode: multiply;
}

.story-location {
  letter-spacing: 0.08em;
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
  backdrop-filter: blur(10px);
  color: var(--color-text-primary);
  position: relative;
  z-index: 1;
}

.story-content {
  padding: 2.5rem;
}

.story-content h3 {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.story-section {
  margin-bottom: 1.5rem;
}

.story-label {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.story-section p {
  line-height: 1.7;
}

.story-patterns {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
}

.read-more-btn {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
  border-bottom: 2px solid transparent;
}

.read-more-btn:hover {
  color: var(--color-accent-1);
  border-bottom-color: var(--color-accent-1);
}

@media (max-width: 1024px) {
  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
