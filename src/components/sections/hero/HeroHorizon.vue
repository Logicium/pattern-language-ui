<template>
  <section class="horizon" :class="{ 'is-in': inView }" :style="{ '--p': p.toFixed(3) }">
    <div class="horizon__copy">
      <h1 class="horizon__title">
        <span class="line" style="--i: 0"><span>{{ content.hero.titleLead }}</span></span>
        <span class="line" style="--i: 1"><span>{{ content.hero.titleTrail }}</span></span>
      </h1>

      <p class="horizon__q rise" style="--i: 2" aria-live="polite">
        <span class="horizon__q-lead">What if your town could</span>
        <span :key="phraseKey" class="horizon__phrase" :class="{ 'is-out': phraseOut }">
          <span v-for="(w, i) in phraseWords" :key="i" class="w" :style="{ '--w': i }">{{ w }}</span>
        </span>
      </p>

      <div class="horizon__ctas rise" style="--i: 3">
        <router-link to="/patterns" class="cta cta--solid">
          {{ content.hero.exploreLabel }} the library
          <span class="cta__arrow" aria-hidden="true">→</span>
        </router-link>
        <router-link to="/hackathon" class="cta">
          Join the Solution Sprint
          <span class="cta__when">Nov 7</span>
        </router-link>
      </div>
    </div>

    <div class="horizon__foot rise" style="--i: 5">
      <span class="horizon__scroll">
        <span class="horizon__scroll-line" aria-hidden="true" />
        Scroll
      </span>
      <Transition name="swap" mode="out-in">
        <span v-if="hovered" :key="hovered.id" class="horizon__readout">
          <span class="num">{{ String(hovered.id).padStart(2, '0') }}</span> {{ hovered.title }}
        </span>
        <span v-else key="idle" class="horizon__readout dim">Fifty patterns on the horizon</span>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { content } from '@/data/site'
import { typingPhrases } from '@/utils/data'
import type { Pattern } from '@/types'

/**
 * The home hero's copy: the title over the horizon, the question, the ways
 * in. The globe itself lives in HomeStage, the fixed layer behind the whole
 * page; `p` is how far the first screen has scrolled, which lifts the copy
 * away while the stage raises the globe. The nav holds its links back until
 * the page scrolls, so nothing competes with the ball.
 */
const props = withDefaults(defineProps<{ p?: number; hovered?: Pattern | null }>(), { p: 0, hovered: null })
const inView = ref(false)

// One phrase at a time, arriving word by word out of a blur the way PAL's
// replies do, held, then let go.
const phraseIdx = ref(0)
const phraseKey = ref(0)
const phraseOut = ref(false)
const phraseWords = computed(() => (typingPhrases[phraseIdx.value] ?? '').split(' '))
let phraseTimer = 0
function nextPhrase() {
  phraseOut.value = true
  phraseTimer = window.setTimeout(() => {
    phraseIdx.value = (phraseIdx.value + 1) % typingPhrases.length
    phraseKey.value++
    phraseOut.value = false
    phraseTimer = window.setTimeout(nextPhrase, 4200)
  }, 700)
}

onMounted(() => {
  document.body.classList.add('nav-quiet')
  requestAnimationFrame(() => (inView.value = true))
  phraseTimer = window.setTimeout(nextPhrase, 5200)
})
onBeforeUnmount(() => {
  document.body.classList.remove('nav-quiet')
  window.clearTimeout(phraseTimer)
})
</script>

<style scoped>
.horizon {
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 640px;
}
.horizon__copy {
  position: absolute;
  left: 0;
  right: 0;
  top: 17vh;
  z-index: 1;
  text-align: center;
  padding: 0 var(--container-padding);
  pointer-events: none;
  /* lifts away as the page scrolls, a little faster than the page */
  transform: translateY(calc(var(--p, 0) * -12vh));
  opacity: calc(1 - var(--p, 0) * 1.7);
}
.horizon__copy a {
  pointer-events: auto;
}
.horizon__title {
  margin: 0 0 1.5rem;
  font-size: clamp(2.8rem, 1rem + 5.4vw, 6.4rem);
  font-weight: var(--font-weight-light);
  line-height: 1;
  letter-spacing: -0.045em;
}
.line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
.line > span {
  display: block;
  transform: translateY(108%);
  transition: transform 1.4s cubic-bezier(0.2, 0.75, 0.15, 1);
  transition-delay: calc(0.25s + var(--i) * 0.14s);
}
.is-in .line > span {
  transform: none;
}
.rise {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 1.1s ease, transform 1.2s cubic-bezier(0.2, 0.75, 0.15, 1);
  transition-delay: calc(0.5s + var(--i) * 0.16s);
}
.is-in .rise {
  opacity: 1;
  transform: none;
}

/* the question */
.horizon__q {
  margin: 0 auto 2.1rem;
  max-width: 36rem;
  min-height: 3.4em;
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.5;
}
.horizon__q-lead {
  display: block;
  color: var(--color-text-tertiary);
}
.horizon__phrase {
  display: block;
  color: var(--color-accent-warm);
  transition: opacity 0.7s ease, filter 0.7s ease;
}
.horizon__phrase.is-out {
  opacity: 0;
  filter: blur(6px);
}
.horizon__phrase .w {
  display: inline-block;
  margin-right: 0.28em;
  animation: word-in 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: calc(var(--w) * 0.11s);
}
@keyframes word-in {
  from {
    opacity: 0;
    filter: blur(7px);
    transform: translateY(0.18em);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: none;
  }
}

/* the ways in */
.horizon__ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.95rem 1.5rem;
  border: 1px solid var(--color-text-primary);
  font-size: 0.86rem;
  letter-spacing: 0.03em;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
}
.cta:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}
.cta--solid {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}
.cta--solid:hover {
  background: var(--color-accent-warm);
  border-color: var(--color-accent-warm);
}
.cta__arrow {
  display: inline-block;
  transition: transform 0.35s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.cta:hover .cta__arrow {
  transform: translateX(4px);
}
.cta__when {
  padding-left: 0.7rem;
  border-left: 1px solid currentColor;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.7;
}

/* the foot: scroll cue left, readout right */
.horizon__foot {
  position: absolute;
  left: var(--container-padding);
  right: var(--container-padding);
  bottom: 2.75rem;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  pointer-events: none;
}
.is-in .horizon__foot {
  opacity: calc(1 - var(--p, 0) * 2.5);
}
.horizon__scroll {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  color: var(--color-text-secondary);
}
.horizon__scroll-line {
  position: relative;
  display: block;
  width: 1px;
  height: 3.2rem;
  background: var(--hairline-strong);
  overflow: hidden;
}
.horizon__scroll-line::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 40%;
  background: var(--color-text-primary);
  animation: drip 2.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes drip {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(260%);
  }
}
.dim {
  color: var(--color-text-tertiary);
}
.horizon__readout .num {
  color: var(--color-accent-warm);
  margin-right: 0.4em;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.35s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .horizon__scroll-line::after,
  .horizon__phrase .w {
    animation: none;
  }
}
@media (max-width: 767px) {
  .horizon {
    min-height: 100svh;
    height: 100svh;
  }
  .horizon__copy {
    top: 6.5rem;
    text-align: left;
  }
  .horizon__title {
    font-size: clamp(2.3rem, 1rem + 7vw, 3rem);
  }
  .horizon__q {
    margin-left: 0;
    font-size: 1.1rem;
  }
  .horizon__ctas {
    justify-content: flex-start;
  }
  .cta {
    padding: 0.85rem 1.2rem;
  }
  .horizon__foot {
    bottom: 6.5rem;
    transition: opacity 0.3s ease;
  }
  .horizon__readout {
    display: none;
  }
}
</style>
