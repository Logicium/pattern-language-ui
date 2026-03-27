<template>
  <div class="story-page">
    <Navbar />

    <div v-if="story">
      <FullStoryHero :story="story" :get-pattern-route="getPatternRoute" />

      <section class="section story-content">
        <div class="container">
          <div class="content-grid">
            <FullStoryContent
              :story="story"
              :extract-domain="extractDomain"
              :format-date="formatDate"
            />
            <FullStorySidebar :related-stories="relatedStories" />
          </div>
        </div>
      </section>
    </div>

    <div v-else class="container" style="padding: 10rem 0; text-align: center;">
      <p class="text-secondary">Story not found</p>
      <router-link to="/stories" class="btn" style="margin-top: 2rem;">Back to Stories</router-link>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Navbar, Footer } from '@/components'
import FullStoryHero from '@/components/full-story/FullStoryHero.vue'
import FullStoryContent from '@/components/full-story/FullStoryContent.vue'
import FullStorySidebar from '@/components/full-story/FullStorySidebar.vue'
import { useFullStory } from '@/composables/useFullStory'

const { story, relatedStories, extractDomain, getPatternRoute, formatDate } = useFullStory()
</script>

<style scoped>
.story-page {
  min-height: 100vh;
}

.story-content {
  background: var(--color-bg-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}
</style>
