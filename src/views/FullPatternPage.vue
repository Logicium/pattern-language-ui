<template>
  <div class="pattern-page">
    <Navbar v-if="!isModal" />

    <div v-if="pattern">
      <section class="pattern-hero gradient-bg">
        <HeroBackdrop variant="lattice" />
        <ModalBackButton
          v-if="!isModal"
          overlay
          class="hero-back"
          label="All Patterns"
          @back="$router.push('/patterns')"
        />
        <div class="container">
          <div class="hero-meta">
            <span class="pattern-number text-xs text-tertiary">Pattern {{ String(pattern.id).padStart(2, '0') }}</span>
            <span class="pattern-category text-xs text-tertiary">{{ pattern.category }}</span>
          </div>
          <h1 class="hero-title">{{ pattern.title }}</h1>
          <p class="hero-description text-secondary">{{ pattern.description }}</p>
          <div class="addresses-tags">
            <span class="text-xs text-tertiary">Addresses:</span>
            <router-link
              v-for="challenge in pattern.addresses"
              :key="challenge"
              :to="getChallengeRoute(challenge)"
              class="address-tag text-xs"
            >
              {{ challenge }}
            </router-link>
          </div>
        </div>
      </section>

      <section class="section pattern-content">
        <div class="container">
          <div class="content-grid">
            <FullPatternContent :pattern="pattern" :all-patterns="allPatterns" />
            <FullPatternSidebar
              :pattern="pattern"
              :get-pattern-route="getPatternRoute"
              :prev-pattern="prevPattern"
              :next-pattern="nextPattern"
            />
          </div>
        </div>
      </section>

      <section class="pattern-map-section">
        <PatternLocationMap :stories="mapStories" />
      </section>

      <section v-if="relatedStories.length > 0" class="section related-stories-section">
        <div class="container">
          <h2 class="section-title mb-md">Success Stories Using This Pattern</h2>
          <div class="stories-grid">
            <router-link
              v-for="story in relatedStories"
              :key="story.id"
              :to="`/stories/${story.id}`"
              class="story-card"
            >
              <div class="story-visual" :style="{ backgroundColor: story.color }">
                <img v-if="story.image" :src="story.image" :alt="story.location" class="story-image" />
                <div class="color-overlay" :style="{ backgroundColor: story.color }"></div>
                <div class="story-location text-xs">{{ story.location }}</div>
              </div>
              <div class="story-info">
                <h3 class="text-sm">{{ story.title }}</h3>
                <p class="text-xs text-secondary">{{ story.problem }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Pattern not found</p>
      <router-link to="/patterns" class="btn" style="margin-top: 2rem;">Back to Patterns</router-link>
    </div>

    <Footer v-if="!isModal" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Navbar, Footer, HeroBackdrop, ModalBackButton } from '@/components'
import FullPatternContent from '@/components/full-pattern/FullPatternContent.vue'
import FullPatternSidebar from '@/components/full-pattern/FullPatternSidebar.vue'
import PatternLocationMap from '@/components/full-pattern/PatternLocationMap.vue'
import { useFullPattern } from '@/composables/useFullPattern'
import { usePatterns } from '@/composables/usePatterns'
import { useStories } from '@/composables/useStories'
import { useSeo } from '@/composables/useSeo'

interface Props {
  patternData?: any
  isModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isModal: false
})

const { pattern, relatedStories, getPatternRoute, getChallengeRoute } = useFullPattern(props.patternData)
const { patterns: allPatterns } = usePatterns()
const { stories: allStories } = useStories()

// Modal usage renders inside another page, which owns the document head.
if (!props.isModal) {
  useSeo({
    title: () => pattern.value?.title,
    description: () => pattern.value && `${pattern.value.description} ${pattern.value.problem || ''}`,
    path: () => pattern.value && `/patterns/${pattern.value.id}`,
    type: 'article'
  })
}

// Previous / next neighbors in the pattern list (by store order).
const currentIndex = computed(() => {
  if (!pattern.value) return -1
  return allPatterns.value.findIndex((p: any) => p.id === pattern.value!.id)
})
const prevPattern = computed(() => {
  const i = currentIndex.value
  const len = allPatterns.value.length
  if (i < 0 || len === 0) return null
  return allPatterns.value[(i - 1 + len) % len]
})
const nextPattern = computed(() => {
  const i = currentIndex.value
  const len = allPatterns.value.length
  if (i < 0 || len === 0) return null
  return allPatterns.value[(i + 1) % len]
})

// Map section uses every story whose patterns include this one, not capped at 3.
const mapStories = computed(() => {
  if (!pattern.value) return []
  const patternTitle = pattern.value.title.toLowerCase()
  return allStories.value.filter((story: any) =>
    story.patterns.some((p: string) => p.toLowerCase() === patternTitle),
  )
})
</script>

<style scoped>
.pattern-page { min-height: 100vh; }

.pattern-hero {
  padding: 12rem var(--container-padding) 6rem;
  position: relative;
  overflow: hidden;
}

/* Below the fixed navbar, above the lattice backdrop */
.pattern-hero .hero-back {
  top: 7rem;
  z-index: 2;
}

.pattern-hero .container { position: relative; z-index: 1; }

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
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.address-tag:hover {
  background: var(--color-accent-1);
  color: var(--color-bg-primary);
  transform: translateY(-2px);
}

.pattern-content { background: var(--color-bg-secondary); }

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

.pattern-map-section { background: var(--color-bg-primary); }

.section-label {
  display: block;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.section-heading {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.section-blurb {
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0 0 1.5rem;
  max-width: 48ch;
}

.related-stories-section { background: var(--color-bg-secondary); }

.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.story-card {
  background: var(--color-bg-secondary);
  transition: transform var(--transition-base);
  text-decoration: none;
  color: inherit;
  display: block;
}

.story-card:hover { transform: translateY(-4px); }

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

.story-info { padding: 2rem; }

.story-info h3 {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.story-info p { line-height: 1.6; }

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; gap: 3rem; }
  .stories-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-description { font-size: 1rem; }
}
</style>
