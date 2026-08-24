<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { RibbonCanvas } from '@/components'
import '@/components/presentation/presentation.css'

import SlideTitle from '@/components/presentation/slides/SlideTitle.vue'
import SlideHost from '@/components/presentation/slides/SlideHost.vue'
import SlideHackathon from '@/components/presentation/slides/SlideHackathon.vue'
import SlideWeekend from '@/components/presentation/slides/SlideWeekend.vue'
import SlideCommunity from '@/components/presentation/slides/SlideCommunity.vue'
import SlideWinners from '@/components/presentation/slides/SlideWinners.vue'
import SlideSpark from '@/components/presentation/slides/SlideSpark.vue'
import SlideBridge from '@/components/presentation/slides/SlideBridge.vue'
import SlideLanguage from '@/components/presentation/slides/SlideLanguage.vue'
import SlidePlatform from '@/components/presentation/slides/SlidePlatform.vue'
import SlidePal from '@/components/presentation/slides/SlidePal.vue'
import SlideAnatomy from '@/components/presentation/slides/SlideAnatomy.vue'
import SlideCottonwood from '@/components/presentation/slides/SlideCottonwood.vue'
import SlideSixPatterns from '@/components/presentation/slides/SlideSixPatterns.vue'
import SlideJunction from '@/components/presentation/slides/SlideJunction.vue'
import SlideLearning from '@/components/presentation/slides/SlideLearning.vue'
import SlideDemo from '@/components/presentation/slides/SlideDemo.vue'
import SlideSept19 from '@/components/presentation/slides/SlideSept19.vue'
import SlideOffer from '@/components/presentation/slides/SlideOffer.vue'
import SlideClosing from '@/components/presentation/slides/SlideClosing.vue'

type DeckTheme = 'htf' | 'pl'

const slides: Array<{ component: unknown; theme: DeckTheme }> = [
  { component: SlideTitle, theme: 'htf' },
  { component: SlideHost, theme: 'htf' },
  { component: SlideHackathon, theme: 'htf' },
  { component: SlideWeekend, theme: 'htf' },
  { component: SlideCommunity, theme: 'htf' },
  { component: SlideWinners, theme: 'htf' },
  { component: SlideSpark, theme: 'htf' },
  { component: SlideBridge, theme: 'pl' },
  { component: SlideLanguage, theme: 'pl' },
  { component: SlidePlatform, theme: 'pl' },
  { component: SlidePal, theme: 'pl' },
  { component: SlideAnatomy, theme: 'pl' },
  { component: SlideCottonwood, theme: 'pl' },
  { component: SlideSixPatterns, theme: 'pl' },
  { component: SlideJunction, theme: 'pl' },
  { component: SlideLearning, theme: 'pl' },
  { component: SlideDemo, theme: 'pl' },
  { component: SlideSept19, theme: 'pl' },
  { component: SlideOffer, theme: 'pl' },
  { component: SlideClosing, theme: 'pl' }
]

const BRIDGE_INDEX = slides.findIndex((s) => s.component === SlideBridge)

const route = useRoute()
const router = useRouter()

useHead({ title: 'Hack Trinidad Forward → Pattern Language' })

function clampIndex(value: number) {
  return Math.min(slides.length - 1, Math.max(0, value))
}

const initial = Number.parseInt(String(route.query.slide ?? '1'), 10)
const index = ref(clampIndex(Number.isNaN(initial) ? 0 : initial - 1))
const direction = ref<'next' | 'prev'>('next')
const hintFaded = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const currentSlide = computed(() => slides[index.value]!)
const theme = computed<DeckTheme>(() => currentSlide.value.theme)

// The ribbon canvas (three.js) mounts one slide before the brand transition so
// it is already flowing when the pixel curtain dissolves.
const ribbonMounted = ref(index.value >= BRIDGE_INDEX - 1)
watch(index, (i) => {
  if (i >= BRIDGE_INDEX - 1) ribbonMounted.value = true
})

// The bridge slide supplies its own pixel-curtain reveal, so slide movement
// would fight it — cross-fade only when entering or leaving that slide.
const transitionName = computed(() => {
  const isBridge = index.value === BRIDGE_INDEX
  const cameFromBridge = previousIndex.value === BRIDGE_INDEX
  if (isBridge || cameFromBridge) return 'deck-fade'
  return direction.value === 'next' ? 'deck-next' : 'deck-prev'
})

const previousIndex = ref(index.value)

function go(target: number) {
  const next = clampIndex(target)
  if (next === index.value) return
  direction.value = next > index.value ? 'next' : 'prev'
  previousIndex.value = index.value
  index.value = next
  hintFaded.value = true
  router.replace({ query: { ...route.query, slide: String(next + 1) } })
}

const nextSlide = () => go(index.value + 1)
const prevSlide = () => go(index.value - 1)

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    rootEl.value?.requestFullscreen()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
    case 'Enter':
      e.preventDefault()
      nextSlide()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault()
      prevSlide()
      break
    case 'Home':
      e.preventDefault()
      go(0)
      break
    case 'End':
      e.preventDefault()
      go(slides.length - 1)
      break
    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break
  }
}

// Swipe navigation for tablets / phones.
let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const dx = touch.clientX - touchStartX
  if (Math.abs(dx) < 60) return
  if (dx < 0) nextSlide()
  else prevSlide()
}

const FONT_ID = 'pres-space-grotesk'
let hintTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  // Space Grotesk carries the Hack Trinidad Forward poster brand; load it for
  // this page only rather than site-wide.
  if (!document.getElementById(FONT_ID)) {
    const link = document.createElement('link')
    link.id = FONT_ID
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&display=swap'
    document.head.appendChild(link)
  }

  for (const src of [
    '/presentation/htf-logo.png',
    '/presentation/kisora.jpeg',
    '/presentation/joze-cube.jpg',
    '/demo/cottonwood-springs.svg'
  ]) {
    new Image().src = src
  }

  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
  hintTimer = setTimeout(() => {
    hintFaded.value = true
  }, 6000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  if (hintTimer) clearTimeout(hintTimer)
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})
</script>

<template>
  <div
    ref="rootEl"
    class="pres"
    :class="`pres--${theme}`"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="pres-bg pres-bg--htf" :class="{ 'is-active': theme === 'htf' }" />
    <div class="pres-bg pres-bg--pl" :class="{ 'is-active': theme === 'pl' }">
      <RibbonCanvas v-if="ribbonMounted" />
    </div>

    <div class="pres-stage">
      <Transition :name="transitionName">
        <div :key="index" class="pres-slide">
          <component :is="currentSlide.component" />
        </div>
      </Transition>
    </div>

    <button
      class="pres-tap pres-tap--prev"
      aria-label="Previous slide"
      @click="prevSlide"
    />
    <button class="pres-tap pres-tap--next" aria-label="Next slide" @click="nextSlide" />

    <footer class="pres-hud">
      <span class="pres-hud__counter"
        >{{ String(index + 1).padStart(2, '0') }} — {{ String(slides.length).padStart(2, '0') }}</span
      >
      <span class="pres-hud__track">
        <span
          class="pres-hud__fill"
          :style="{ width: `${((index + 1) / slides.length) * 100}%` }"
        />
      </span>
      <span class="pres-hud__hint" :class="{ 'is-faded': hintFaded }"
        >&larr; &rarr; navigate &nbsp;·&nbsp; F fullscreen</span
      >
    </footer>
  </div>
</template>
