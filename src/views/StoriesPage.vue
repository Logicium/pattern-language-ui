<template>
  <div class="stories-page">
    <Navbar />
    
    <!-- Hero -->
    <section class="stories-hero gradient-bg">
      <RibbonCanvas />
      <div class="container">
        <h1 class="hero-title">Success Stories</h1>
        <p class="hero-subtitle text-secondary">
          Real communities. Real challenges. Real solutions.<br>
          See how pattern languages transform rural places.
        </p>
      </div>
    </section>

    <!-- Featured Story -->
    <section v-if="featuredStory" class="section featured-section">
      <div class="container">
        <span class="label text-xs text-tertiary">Featured</span>
        <div class="featured-story">
          <div class="featured-visual" :style="{ backgroundColor: featuredStory.color }">
            <img 
              v-if="featuredStory.image" 
              :src="featuredStory.image" 
              :alt="featuredStory.location"
              class="featured-image"
            />
            <div class="color-overlay" :style="{ backgroundColor: featuredStory.color }"></div>
            <div class="featured-location text-sm">{{ featuredStory.location }}</div>
          </div>
          <div class="featured-content">
            <h2>{{ featuredStory.title }}</h2>
            <div class="story-detail">
              <span class="detail-label text-xs text-tertiary">Challenge</span>
              <p class="text-secondary">{{ featuredStory.problem }}</p>
            </div>
            <div class="story-detail">
              <span class="detail-label text-xs text-tertiary">Solution</span>
              <p class="text-secondary">{{ featuredStory.solution }}</p>
            </div>
            <div class="story-patterns">
              <span class="detail-label text-xs text-tertiary">Patterns Used</span>
              <div class="pattern-list">
                <span v-for="p in featuredStory.patterns" :key="p" class="pattern-badge text-xs">
                  {{ p }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- All Stories -->
    <section class="section all-stories-section">
      <div class="container">
        <div id="stories-header" class="section-header">
          <span class="section-number">{{ allOtherStories.length }}</span>
          <h2 class="section-title">More Stories</h2>
        </div>

        <div class="stories-grid">
          <div
            v-for="story in paginatedStories"
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
            </div>
          </div>
        </div>

        <Pagination
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-items="allOtherStories.length"
          :per-page-options="perPageOptions"
          scroll-target-id="stories-header"
        />
      </div>
    </section>

    <!-- Share Your Story -->
    <section class="section share-section">
      <div class="container share-content">
        <div class="share-text">
          <h2 class="section-title">Share Your Story</h2>
          <p class="text-secondary">
            Working on rural regeneration in your community? We'd love to hear about 
            the patterns you're using, the challenges you're facing, and the wins you're seeing.
          </p>
          <p class="text-secondary">
            Your story could inspire and guide other communities on their journey.
          </p>
        </div>
        <div class="share-action">
          <button class="btn btn-lg">Submit Your Story</button>
        </div>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Navbar, Footer, CTASection, RibbonCanvas, Pagination } from '@/components'
import { allStories } from '@/utils/data'

const featuredStory = allStories[0]
const currentPage = ref(1)
const itemsPerPage = ref(9)
const perPageOptions = [6, 9, 12, 18]

// Get stories excluding the featured one
const allOtherStories = computed(() => allStories.slice(1))

// Paginated stories
const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allOtherStories.value.slice(start, end)
})
</script>

<style scoped>
.stories-page {
  min-height: 100vh;
}

.stories-hero {
  padding: 12rem var(--container-padding) 6rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.8;
  position: relative;
  z-index: 1;
}

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

.featured-location {
  background: rgba(253, 251, 247, 0.95);
  padding: 0.75rem 1.5rem;
  backdrop-filter: blur(10px);
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
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

.all-stories-section {
  background: var(--color-bg-secondary);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.story-card {
  overflow: hidden;
  transition: transform 0.3s ease;
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

.story-location {
  letter-spacing: 0.08em;
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
  backdrop-filter: blur(10px);
  color: var(--color-text-primary);
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

.share-section {
  background: var(--color-bg-primary);
}

.share-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 6rem;
  align-items: center;
}

.share-text h2 {
  margin-bottom: 2rem;
}

.share-text p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.share-action {
  text-align: center;
}

@media (max-width: 1024px) {
  .featured-story,
  .share-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .featured-visual {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .stories-hero {
    padding: 10rem var(--container-padding) 4rem;
  }

  .stories-grid {
    grid-template-columns: 1fr;
  }

  .featured-content h2 {
    font-size: 2rem;
  }

  .share-action {
    text-align: left;
  }
}
</style>
