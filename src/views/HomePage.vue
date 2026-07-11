<template>
  <div class="home-page">
    <HeroSection />
    <FeaturedPatternsSection />
    <FeaturedStoriesSection />
    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/layout/Footer.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturedPatternsSection from '@/components/sections/FeaturedPatternsSection.vue'
import FeaturedStoriesSection from '@/components/sections/FeaturedStoriesSection.vue'
import CTASection from '@/components/sections/CTASection.vue'
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}
</style>
