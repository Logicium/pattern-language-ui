<template>
  <div class="pattern-page">
    <Navbar />

    <div v-if="pattern">
      <!-- Hero -->
      <section class="pattern-hero gradient-bg">
        <div class="container">
          <div class="hero-meta">
            <span class="pattern-number text-xs text-tertiary">Pattern {{ String(pattern.id).padStart(2, '0') }}</span>
            <span class="pattern-category text-xs text-tertiary">{{ pattern.category }}</span>
          </div>
          <h1 class="hero-title">{{ pattern.title }}</h1>
          <p class="hero-description text-secondary">
            {{ pattern.description }}
          </p>
          <div class="addresses-tags">
            <span class="text-xs text-tertiary">Addresses:</span>
            <span
              v-for="challenge in pattern.addresses"
              :key="challenge"
              class="address-tag text-xs"
            >
              {{ challenge }}
            </span>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <section class="section pattern-content">
        <div class="container">
          <div class="content-grid">
            <!-- Main Content -->
            <div class="main-content">
              <div v-if="pattern.problem" class="content-block">
                <h2 class="section-subtitle">Problem</h2>
                <p class="text-secondary">{{ pattern.problem }}</p>
              </div>

              <div v-if="pattern.context" class="content-block">
                <h2 class="section-subtitle">Context</h2>
                <p class="text-secondary">{{ pattern.context }}</p>
              </div>

              <div v-if="pattern.solution" class="content-block">
                <h2 class="section-subtitle">Solution</h2>
                <p class="text-secondary">{{ pattern.solution }}</p>
              </div>

              <div v-if="pattern.implementation && pattern.implementation.length > 0" class="content-block">
                <h2 class="section-subtitle">Implementation Suggestions</h2>
                <ul class="implementation-list">
                  <li
                    v-for="(item, index) in pattern.implementation"
                    :key="index"
                    class="text-sm text-secondary"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="pattern.examples && pattern.examples.length > 0" class="content-block">
                <h2 class="section-subtitle">Real-World Examples</h2>
                <div class="examples-grid">
                  <div
                    v-for="(example, index) in pattern.examples"
                    :key="index"
                    class="example-card"
                  >
                    <p class="text-sm text-secondary">{{ example }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <aside class="sidebar">
              <div v-if="pattern.relatedPatterns && pattern.relatedPatterns.length > 0" class="sidebar-block">
                <h3 class="sidebar-title text-sm">Related Patterns</h3>
                <div class="related-list">
                  <router-link
                    v-for="relatedTitle in pattern.relatedPatterns"
                    :key="relatedTitle"
                    :to="getPatternRoute(relatedTitle)"
                    class="related-link text-sm"
                  >
                    {{ relatedTitle }}
                  </router-link>
                </div>
              </div>

              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Start Here</h3>
                <p class="text-xs text-tertiary" style="line-height: 1.7; margin-bottom: 1rem;">
                  Ready to implement this pattern in your community?
                </p>
                <router-link to="/signup" class="btn" style="width: 100%;">
                  Create Profile
                </router-link>
              </div>

              <div class="sidebar-block">
                <h3 class="sidebar-title text-sm">Explore More</h3>
                <div class="explore-links">
                  <router-link to="/patterns" class="explore-link text-xs">
                    ← All Patterns
                  </router-link>
                  <router-link to="/stories" class="explore-link text-xs">
                    Success Stories →
                  </router-link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <!-- Related Stories (if available) -->
      <section v-if="relatedStories.length > 0" class="section related-stories-section">
        <div class="container">
          <h2 class="section-title mb-md">Success Stories Using This Pattern</h2>
          <div class="stories-grid">
            <div
              v-for="story in relatedStories"
              :key="story.id"
              class="story-card"
            >
              <div class="story-visual" :style="{ backgroundColor: story.color }">
                <div class="story-location text-xs">{{ story.location }}</div>
              </div>
              <div class="story-content">
                <h3 class="text-sm">{{ story.title }}</h3>
                <p class="text-xs text-secondary">{{ story.problem }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Pattern not found</p>
      <router-link to="/patterns" class="btn" style="margin-top: 2rem;">
        Back to Patterns
      </router-link>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Navbar, Footer } from '@/components'
import { allPatterns, allStories } from '@/utils/data'

const route = useRoute()
const patternId = computed(() => Number(route.params.id))

const pattern = computed(() => 
  allPatterns.find(p => p.id === patternId.value)
)

const relatedStories = computed(() => {
  if (!pattern.value) return []
  
  return allStories.filter(story => 
    story.patterns.some(p => 
      p.toLowerCase().includes(pattern.value!.title.toLowerCase().split(' ')[0])
    )
  ).slice(0, 3)
})

const getPatternRoute = (title: string) => {
  const relatedPattern = allPatterns.find(p => 
    p.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(p.title.toLowerCase())
  )
  return relatedPattern ? `/patterns/${relatedPattern.id}` : '/patterns'
}
</script>

<style scoped>
.pattern-page {
  min-height: 100vh;
}

.pattern-hero {
  padding: 12rem var(--container-padding) 6rem;
}

.hero-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.7;
  max-width: 800px;
  margin-bottom: 3rem;
}

.addresses-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.address-tag {
  padding: 0.5rem 1rem;
  background: rgba(232, 180, 160, 0.1);
  border: 1px solid var(--color-accent-1);
  letter-spacing: 0.05em;
}

.pattern-content {
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
  padding: 3rem;
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

.implementation-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.implementation-list li {
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.7;
}

.implementation-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-accent-1);
}

.examples-grid {
  display: grid;
  gap: 1.5rem;
}

.example-card {
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid var(--color-accent-2);
}

.example-card p {
  line-height: 1.7;
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

.related-stories-section {
  background: var(--color-bg-primary);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.story-card {
  background: var(--color-bg-secondary);
  transition: transform var(--transition-base);
}

.story-card:hover {
  transform: translateY(-4px);
}

.story-visual {
  height: 200px;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
}

.story-location {
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
  letter-spacing: 0.08em;
}

.story-content {
  padding: 2rem;
}

.story-content h3 {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.story-content p {
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .sidebar {
    position: static;
  }

  .stories-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .content-block {
    padding: 2rem;
  }

  .sidebar-block {
    padding: 1.5rem;
  }
}
</style>
