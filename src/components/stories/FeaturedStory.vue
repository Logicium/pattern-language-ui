<template>
  <section class="section featured-section">
    <div class="container">
      <span class="label text-xs text-tertiary">Featured</span>
      <div class="featured-story">
        <div class="featured-visual" :style="{ backgroundColor: story.color }">
          <img
            v-if="story.image"
            :src="story.image"
            :alt="story.location"
            class="featured-image"
          />
          <div class="color-overlay" :style="{ backgroundColor: story.color }"></div>
          <div class="featured-location text-sm">{{ story.location }}</div>
        </div>
        <div class="featured-content">
          <h2>{{ story.title }}</h2>
          <div class="story-detail">
            <span class="detail-label text-xs text-tertiary">Challenge</span>
            <p class="text-secondary">{{ story.problem }}</p>
          </div>
          <div class="story-detail">
            <span class="detail-label text-xs text-tertiary">Solution</span>
            <p class="text-secondary">{{ story.solution }}</p>
          </div>
          <div class="story-patterns">
            <span class="detail-label text-xs text-tertiary">Patterns Used</span>
            <div class="pattern-list">
              <span v-for="p in story.patterns" :key="p" class="pattern-badge text-xs">
                {{ p }}
              </span>
            </div>
          </div>
          <router-link :to="`/stories/${story.id}`" class="btn featured-story-btn">
            Read Full Story
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  story: any
}>()
</script>

<style scoped>
.featured-section {
  background: var(--color-bg-primary);
}

.label {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.featured-story {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.featured-visual {
  height: 500px;
  display: flex;
  align-items: flex-end;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.featured-image {
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

.featured-location {
  background: rgba(253, 251, 247, 0.95);
  padding: 0.75rem 1.5rem;
  backdrop-filter: blur(10px);
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
  position: relative;
  z-index: 1;
}

.featured-content h2 {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 3rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.story-detail {
  margin-bottom: 2.5rem;
}

.detail-label {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.story-detail p {
  line-height: 1.8;
}

.story-patterns {
  margin-top: 3rem;
}

.pattern-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.pattern-badge {
  padding: 0.5rem 1rem;
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  letter-spacing: 0.05em;
}

.featured-story-btn {
  margin-top: 2rem;
  text-decoration: none;
  display: inline-block;
}

@media (max-width: 1024px) {
  .featured-story {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .featured-visual {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .featured-content h2 {
    font-size: 2rem;
  }
}
</style>
