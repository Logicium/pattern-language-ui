<template>
  <div class="stories-page">
    <Navbar />

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

    <div v-if="loading" class="section featured-section">
      <div class="container">
        <p class="text-secondary">Loading stories...</p>
      </div>
    </div>

    <div v-else-if="error" class="section featured-section">
      <div class="container">
        <p class="text-secondary">{{ error }}</p>
      </div>
    </div>

    <FeaturedStory v-else-if="featuredStory" :story="featuredStory" />

    <section class="section all-stories-section">
      <div class="container">
        <div id="stories-header" class="section-header">
          <span class="section-number">{{ allOtherStories.length }}</span>
          <h2 class="section-title">More Stories</h2>
        </div>

        <StoryCardGrid :stories="paginatedStories" />

        <Pagination
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-items="allOtherStories.length"
          :per-page-options="perPageOptions"
          scroll-target-id="stories-header"
        />
      </div>
    </section>

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
import { ref, computed, onMounted } from 'vue'
import { Navbar, Footer, CTASection, RibbonCanvas, Pagination } from '@/components'
import FeaturedStory from '@/components/stories/FeaturedStory.vue'
import StoryCardGrid from '@/components/stories/StoryCardGrid.vue'
import { useStories } from '@/composables/useStories'

const { stories: allStories, loading, error, fetchStories } = useStories()

onMounted(() => { fetchStories(true) })

const featuredStory = computed(() => allStories.value[0])
const currentPage = ref(1)
const itemsPerPage = ref(9)
const perPageOptions = [6, 9, 12, 18]

const allOtherStories = computed(() => allStories.value.slice(1))

const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allOtherStories.value.slice(start, end)
})
</script>

<style scoped>
.stories-page { min-height: 100vh; }

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

.all-stories-section {
  background: var(--color-bg-secondary);
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

.share-text h2 { margin-bottom: 2rem; }

.share-text p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.share-action { text-align: center; }

@media (max-width: 1024px) {
  .share-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .stories-hero { padding: 10rem var(--container-padding) 4rem; }
  .share-action { text-align: left; }
}
</style>
