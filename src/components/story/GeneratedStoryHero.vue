<template>
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
</template>

<script setup lang="ts">
defineProps<{ story: any }>()
</script>

<style scoped>
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

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-problem { font-size: 1rem; }
}
</style>
