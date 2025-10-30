<template>
  <div class="story-page">
    <Navbar />

    <div v-if="story">
      <!-- Hero -->
      <section class="story-hero" :style="{ backgroundColor: story.color }">
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
        <div class="color-overlay" :style="{ backgroundColor: story.color }"></div>
        <div class="container">
          <div class="hero-meta">
            <span class="story-location-tag text-xs">{{ story.location }}</span>
          </div>
          <h1 class="hero-title">{{ story.title }}</h1>
          <p class="hero-problem text-secondary">
            {{ story.problem }}
          </p>
        </div>
      </section>

      <!-- Story Content -->
      <section class="section story-content">
        <div class="container">
          <div class="content-grid">
            <!-- Main Content -->
            <div class="main-content">
              <!-- Markdown Story -->
              <div v-if="story.story" class="content-block story-body">
                <VueMarkdownRender :source="story.story" />
                
                <!-- Published Date -->
                <div v-if="story.publishedDate" class="published-date text-xs text-tertiary" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
                  Published {{ formatDate(story.publishedDate) }}
                </div>
              </div>

              <!-- Fallback if no story -->
              <div v-else class="content-block">
                <h2 class="section-subtitle">Problem</h2>
                <p class="text-secondary">{{ story.problem }}</p>
                
                <h2 class="section-subtitle" style="margin-top: 3rem;">Solution</h2>
                <p class="text-secondary">{{ story.solution }}</p>
              </div>

              <!-- References Section -->
              <div v-if="story.references && story.references.length > 0" class="content-block references-block">
                <h2 class="section-subtitle">References & Resources</h2>
                <div class="references-list">
                  <a
                    v-for="(url, index) in story.references"
                    :key="index"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reference-link"
                  >
                    <div class="reference-content">
                      <span class="reference-name text-sm">{{ extractDomain(url) }}</span>
                      <p class="reference-description text-xs text-secondary">{{ url }}</p>
                    </div>
                    <span class="reference-arrow">↗</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <aside class="sidebar">
              <div v-if="story.patterns && story.patterns.length > 0" class="sidebar-block">
                <h3 class="sidebar-title text-sm">Patterns Used</h3>
                <div class="related-list">
                  <router-link
                    v-for="patternTitle in story.patterns"
                    :key="patternTitle"
                    :to="getPatternRoute(patternTitle)"
                    class="related-link text-sm"
                  >
                    {{ patternTitle }}
                  </router-link>
                </div>
              </div>

              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Get Started</h3>
                <p class="text-xs text-tertiary" style="line-height: 1.7; margin-bottom: 1rem;">
                  Want to replicate this success in your community?
                </p>
                <router-link to="/signup" class="btn" style="width: 100%;">
                  Join Community
                </router-link>
              </div>

              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Explore</h3>
                <div class="explore-links">
                  <router-link to="/stories" class="explore-link text-xs">
                    ← All Stories
                  </router-link>
                  <router-link to="/patterns" class="explore-link text-xs">
                    Pattern Library →
                  </router-link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Story not found</p>
      <router-link to="/stories" class="btn" style="margin-top: 2rem;">
        Back to Stories
      </router-link>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import VueMarkdownRender from 'vue-markdown-render'
import { Navbar, Footer } from '@/components'
import { allStories, allPatterns } from '@/utils/data'

const route = useRoute()
const storyId = computed(() => Number(route.params.id))

const story = computed(() => 
  allStories.find(s => s.id === storyId.value)
)

const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

const getPatternRoute = (title: string) => {
  const pattern = allPatterns.find(p => 
    p.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(p.title.toLowerCase())
  )
  return pattern ? `/patterns/${pattern.id}` : '/patterns'
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
.story-page {
  min-height: 100vh;
}

.story-hero {
  padding: 12rem var(--container-padding) 6rem;
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

.hero-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.story-location-tag {
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: var(--font-weight-light);
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
  max-width: 900px;
}

.hero-byline {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-problem {
  font-size: 1.25rem;
  line-height: 1.7;
  max-width: 800px;
}

.story-content {
  background: var(--color-bg-secondary);
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

.story-body :deep(em) {
  font-style: italic;
  color: var(--color-text-tertiary);
}

.story-body :deep(a) {
  color: var(--color-accent-1);
  text-decoration: none;
  border-bottom: 1px solid var(--color-accent-1);
  transition: all var(--transition-base);
}

.story-body :deep(a:hover) {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

.story-body :deep(hr) {
  margin: 3rem 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.section-subtitle {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.content-block p {
  line-height: 1.8;
}

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

.sidebar-block .btn {
  text-decoration: none;
}

.sidebar-title {
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.related-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.75rem;
  transition: all var(--transition-base);
  border-left: 2px solid transparent;
}

.related-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border-left-color: var(--color-accent-1);
  padding-left: 1rem;
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

.references-block {
  margin-top: 4rem;
  border-top: 2px solid var(--color-border);
  padding-top: 3rem;
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reference-link {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-base);
  border-left: 3px solid transparent;
}

.reference-link:hover {
  background: var(--color-bg-primary);
  border-left-color: var(--color-accent-1);
  transform: translateX(4px);
}

.reference-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reference-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.reference-location {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.reference-description {
  line-height: 1.6;
  margin-top: 0.25rem;
}

.reference-arrow {
  font-size: 1.25rem;
  color: var(--color-text-tertiary);
  transition: all var(--transition-base);
}

.reference-link:hover .reference-arrow {
  color: var(--color-accent-1);
  transform: translate(4px, -4px);
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
