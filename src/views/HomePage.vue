<template>
  <div class="home-page">
    <template v-if="variant === 'horizon'">
      <HomeStage :theme="theme" :p="p" :b="b" :still="scrolling" @hover="onHover" />
      <div class="home-flow">
        <div data-theme="hero"><HeroHorizon :p="p" :hovered="hovered" /></div>
        <div data-theme="what"><WhatSection /></div>
        <div data-theme="how"><HowSection /></div>
        <div data-theme="proof"><ProofSection /></div>
        <div data-theme="off" class="home-flow__solid">
          <CTASection :steps="false" />
          <Footer />
        </div>
      </div>
    </template>
    <template v-else>
      <component :is="HEROES[variant]" />
      <FeaturedPatternsSection />
      <FeaturedStoriesSection />
      <CTASection />
      <Footer />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '@/components/layout/Footer.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import HeroStage from '@/components/sections/hero/HeroStage.vue'
import HeroLedger from '@/components/sections/hero/HeroLedger.vue'
import HeroHorizon from '@/components/sections/hero/HeroHorizon.vue'
import HomeStage, { type StageTheme } from '@/components/home/HomeStage.vue'
import WhatSection from '@/components/home/WhatSection.vue'
import HowSection from '@/components/home/HowSection.vue'
import ProofSection from '@/components/home/ProofSection.vue'
import FeaturedPatternsSection from '@/components/sections/FeaturedPatternsSection.vue'
import FeaturedStoriesSection from '@/components/sections/FeaturedStoriesSection.vue'
import CTASection from '@/components/sections/CTASection.vue'
import { allPatterns } from '@/utils/data/patterns'
import type { Pattern } from '@/types'

/**
 * The home page. The globe is a fixed stage behind the whole page; the
 * hero, then three panels that say what Pattern Language is, scroll over
 * it, each one taking the stage's wash to its own colour. The CTA and the
 * footer are opaque and slide over the top.
 *
 * The other hero candidates stay reachable at /?hero=stage|ledger, and the
 * old page at /?hero=classic, until the choice is final.
 */
const route = useRoute()
const HEROES: Record<string, unknown> = { stage: HeroStage, ledger: HeroLedger, classic: HeroSection }
const variant = computed(() => {
  const v = String(route.query.hero ?? '')
  return v in HEROES ? v : 'horizon'
})

/* ------------------------------------------------------------ the stage */

const theme = ref<StageTheme>('hero')
// p: the hero's copy lifting and the globe settling, over the first part of
// the pinned hero. b: the first panel's arrival, which takes the globe out of focus.
const p = ref(0)
const b = ref(0)
// the globe holds its turning while the page scrolls, and for a beat after
const scrolling = ref(false)
let scrollTimer = 0
let firstPanel: HTMLElement | null = null
const hovered = ref<Pattern | null>(null)
const onHover = (id: number | null) => {
  hovered.value = id === null ? null : (allPatterns.find((x) => x.id === id) ?? null)
}

let observer: IntersectionObserver | null = null
const onScroll = () => {
  const vh = window.innerHeight
  p.value = Math.min(1, Math.max(0, window.scrollY / (vh * 0.7)))
  if (!firstPanel) firstPanel = document.querySelector<HTMLElement>('.home-flow [data-theme="what"]')
  const top = firstPanel ? firstPanel.getBoundingClientRect().top : vh
  b.value = Math.min(1, Math.max(0, (vh - top) / (vh * 0.6)))
  scrolling.value = true
  window.clearTimeout(scrollTimer)
  scrollTimer = window.setTimeout(() => (scrolling.value = false), 600)
}
function watchPanels() {
  observer?.disconnect()
  if (variant.value !== 'horizon') return
  // A panel takes the stage once its top has passed a line a fifth of the
  // way down the screen, so the hero keeps the globe until the first panel
  // has all but arrived.
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) theme.value = ((e.target as HTMLElement).dataset.theme as StageTheme) ?? 'hero'
      }
    },
    { rootMargin: '-20% 0px -80% 0px', threshold: 0 }
  )
  document.querySelectorAll<HTMLElement>('.home-flow [data-theme]').forEach((el) => observer!.observe(el))
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  void nextTick(watchPanels)
})
watch(variant, () => void nextTick(watchPanels))
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.clearTimeout(scrollTimer)
  observer?.disconnect()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}
.home-flow {
  position: relative;
  z-index: 1;
}
/* the hero holds for most of a screen's scrolling, so the globe has settled before the first panel comes up */
.home-flow > [data-theme='hero'] {
  height: 175vh;
}
@media (max-width: 767px) {
  .home-flow > [data-theme='hero'] {
    height: 150svh;
  }
}
/* the flow lets the pointer through to the globe in the hero; the panels and the hero's links take it back */
.home-flow,
.home-flow > [data-theme='hero'] {
  pointer-events: none;
}
.home-flow > [data-theme]:not([data-theme='hero']) {
  pointer-events: auto;
}
/* the CTA and footer are solid; they slide over the stage */
.home-flow__solid {
  position: relative;
  background: var(--color-bg-primary);
}
</style>
