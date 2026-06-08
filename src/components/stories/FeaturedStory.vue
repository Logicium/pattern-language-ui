<template>
  <section
    class="section featured-section"
    :aria-label="`Featured stories: ${activeStory.title}`"
  >
    <div class="container">
      <div class="section-header">
        <span class="section-number">{{ stories.length }}</span>
        <h2 class="section-title">Featured Stories</h2>
      </div>

      <Transition name="fade" mode="out-in">
        <div class="featured-slide" :key="activeStory.id">
          <img
            v-if="activeStory.image"
            :src="activeStory.image"
            :alt="activeStory.location"
            class="featured-image"
          />
          <div
            class="image-tint"
            :style="{ backgroundColor: activeStory.color }"
            aria-hidden="true"
          ></div>

          <div class="image-patterns" aria-label="Patterns used">
            <span
              v-for="p in activeStory.patterns"
              :key="p"
              class="pattern-badge"
              :style="{
                background: hexToRgba(activeStory.color, 0.85),
                borderColor: hexToRgba(activeStory.color, 0.6)
              }"
            >{{ p }}</span>
          </div>

          <div class="text-panel">
            <div class="text-panel-inner">
              <div class="eyebrow">
                <span class="eyebrow-label">Featured</span>
                <span class="eyebrow-dot" aria-hidden="true">·</span>
                <span class="eyebrow-location">{{ activeStory.location }}</span>
              </div>

              <h3 class="featured-title">{{ activeStory.title }}</h3>

              <div class="story-detail">
                <span class="detail-label">Challenge</span>
                <p>{{ activeStory.problem }}</p>
              </div>
              <div class="story-detail">
                <span class="detail-label">Solution</span>
                <p>{{ activeStory.solution }}</p>
              </div>

              <router-link
                :to="`/stories/${activeStory.id}`"
                class="btn featured-story-btn"
              >Read Full Story</router-link>
            </div>
          </div>
        </div>
      </Transition>

      <nav class="featured-bar" aria-label="Featured story selector">
        <button
          v-for="(s, i) in stories"
          :key="s.id"
          type="button"
          class="bar-item"
          :class="{ 'is-active': i === activeIndex }"
          :aria-current="i === activeIndex ? 'true' : undefined"
          @click="selectStory(i)"
        >
          <span
            class="bar-progress"
            aria-hidden="true"
            :style="{
              transform: `scaleX(${barFill(i)})`,
              transitionDuration: i === activeIndex && isPlaying ? '0.1s' : '0s',
              backgroundImage: barGradient(i)
            }"
          ></span>
          <span class="bar-num">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="bar-location">{{ s.location }}</span>
          <span class="bar-title">{{ s.title }}</span>
        </button>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  stories: any[]
}>()

const AUTO_INTERVAL = 7000

const activeIndex = ref(0)
const activeStory = computed(() => props.stories[activeIndex.value])
const isPlaying = ref(true)
const progress = ref(0)

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const v = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function barFill(i: number) {
  if (i < activeIndex.value) return 1
  if (i > activeIndex.value) return 0
  return isPlaying.value ? progress.value : 1
}

function barGradient(i: number) {
  const stories = props.stories
  const cur = stories[i]?.color || '#2a2a2a'
  const prev = stories[i - 1]?.color || cur
  return `linear-gradient(to right, ${prev}, ${cur})`
}

let rafId: number | null = null
let startTime = 0

function tick(now: number) {
  if (!isPlaying.value) return
  if (!startTime) startTime = now
  const elapsed = now - startTime
  progress.value = Math.min(elapsed / AUTO_INTERVAL, 1)
  if (progress.value >= 1) {
    startTime = 0
    progress.value = 0
    activeIndex.value = (activeIndex.value + 1) % props.stories.length
  }
  rafId = requestAnimationFrame(tick)
}

function stopAuto() {
  isPlaying.value = false
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function selectStory(i: number) {
  stopAuto()
  progress.value = 0
  startTime = 0
  activeIndex.value = i
}

watch(() => props.stories.length, () => {
  if (activeIndex.value >= props.stories.length) activeIndex.value = 0
})

onMounted(() => {
  if (props.stories.length > 1) {
    rafId = requestAnimationFrame(tick)
  }
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.featured-section {
  background: var(--color-bg-primary);
  position: relative;
}

.featured-slide {
  position: relative;
  width: 100%;
  height: clamp(420px, 56vh, 580px);
  overflow: hidden;
}

.featured-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.image-tint {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  mix-blend-mode: multiply;
  z-index: 1;
}

.image-patterns {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: calc(50% - 3rem);
}

.image-patterns .pattern-badge {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.75rem;
  color: var(--color-text-primary);
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  border: 1px solid transparent;
}

.text-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  background: rgba(253, 251, 247, 0.55);
  backdrop-filter: blur(36px) saturate(140%);
  -webkit-backdrop-filter: blur(36px) saturate(140%);
  border-left: 1px solid rgba(42, 42, 42, 0.08);
}

.text-panel-inner {
  padding: 2.5rem clamp(2rem, 4vw, 3.5rem);
  width: 100%;
  max-width: 640px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  margin-bottom: 1.25rem;
}

.eyebrow-label { font-weight: 600; }
.eyebrow-dot { opacity: 0.5; }
.eyebrow-location { color: var(--color-text-secondary); }

.featured-title {
  font-size: clamp(1.5rem, 2.4vw, 2.25rem);
  font-weight: var(--font-weight-light);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0 0 1.5rem;
  color: var(--color-text-primary);
}

.story-detail {
  margin-bottom: 1.1rem;
}

.detail-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 0.4rem;
}

.story-detail p {
  margin: 0;
  line-height: 1.65;
  color: var(--color-text-primary);
}

.featured-story-btn {
  margin-top: 1rem;
  text-decoration: none;
  display: inline-block;
}

/* Selector bar */
.featured-bar {
  display: grid;
  grid-template-columns: repeat(v-bind('stories.length'), 1fr);
  border-top: 1px solid rgba(42, 42, 42, 0.12);
  background: var(--color-bg-primary);
}

.bar-item {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 1rem;
  row-gap: 0.25rem;
  align-items: baseline;
  padding: 1.1rem clamp(1.25rem, 3vw, 2.5rem);
  background: transparent;
  border: none;
  border-right: 1px solid rgba(42, 42, 42, 0.08);
  text-align: left;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.25s ease, background-color 0.25s ease;
  font: inherit;
}

.bar-item:last-child { border-right: none; }

.bar-item:hover {
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.025);
}

.bar-progress {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-text-primary);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.1s linear;
  will-change: transform;
}

.bar-item.is-active {
  color: var(--color-text-primary);
}

.bar-num {
  grid-row: 1 / span 2;
  grid-column: 1;
  align-self: center;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.bar-item.is-active .bar-num { color: var(--color-text-primary); }

.bar-location {
  grid-row: 1;
  grid-column: 2;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.bar-title {
  grid-row: 2;
  grid-column: 2;
  font-size: 0.95rem;
  font-weight: var(--font-weight-light);
  line-height: 1.3;
  letter-spacing: -0.005em;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .featured-slide {
    height: auto;
    min-height: 520px;
  }
  .text-panel {
    position: absolute;
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 65%;
    border-left: none;
    border-top: 1px solid rgba(42, 42, 42, 0.08);
  }
  .text-panel-inner {
    padding: 2.5rem 2rem;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .featured-slide {
    min-height: 600px;
  }
  .text-panel { height: 70%; }
  .featured-title { font-size: 1.6rem; }

  .bar-item {
    padding: 1rem;
    grid-template-columns: auto 1fr;
    column-gap: 0.6rem;
  }
  .bar-title { display: none; }
  .bar-location { font-size: 0.65rem; }
}
</style>
