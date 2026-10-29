<template>
  <section class="stage gradient-bg" :class="{ 'is-in': inView }">
    <div class="stage__globe">
      <PatternSphere
        :place="{ cx: 0.5, cy: 0.52, r: 0.37, pcx: 0.5, pcy: 0.68, pr: 0.42 }"
        :labels="[10, 4]"
        :mask="false"
        :delay="0.5"
        :avoid="['.navbar', '.stage__title', '.stage__lead', '.stage__ask', '.stage__readout', '.beta-banner']"
        @hover="onHover"
      />
    </div>

    <div class="stage__copy">
      <h1 class="stage__title">
        <span class="line" style="--i: 0"><span>{{ content.hero.titleLead }}</span></span>
        <span class="line" style="--i: 1"><span>{{ content.hero.titleTrail }}</span></span>
      </h1>
      <router-link to="/patterns" class="stage__lead rise" style="--i: 3">
        <span class="stage__lead-rule" aria-hidden="true" />
        {{ content.hero.exploreLabel }} the library
      </router-link>
    </div>

    <div class="stage__ask rise" style="--i: 2" aria-live="polite">
      <p class="stage__ask-lead">What if your town could</p>
      <p class="stage__ask-q">{{ currentTypedText }}<span class="caret" :class="{ 'is-blinking': !isTyping }" /></p>
    </div>

    <p class="stage__readout rise" style="--i: 4">
      <Transition name="swap" mode="out-in">
        <span v-if="hovered" :key="hovered.id" class="stage__readout-in">
          <span class="num">{{ String(hovered.id).padStart(2, '0') }}</span>
          <span class="sep">/</span>{{ hovered.title }}<span class="sep">/</span><span class="dim">{{ hovered.category }}</span>
        </span>
        <span v-else key="idle" class="stage__readout-in dim">Fifty patterns. Turn the globe, or follow a name.</span>
      </Transition>
    </p>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PatternSphere from '@/components/PatternSphere.vue'
import { useTypingAnimation } from '@/composables/useTypingAnimation'
import { content } from '@/data/site'
import { allPatterns } from '@/utils/data/patterns'
import type { Pattern } from '@/types'

/**
 * Hero, variant "Stage": the globe alone at the centre of the page, the
 * title and the question in the corners beneath it, and a readout that
 * names whatever is under the pointer. The nav holds its links back until
 * the page scrolls, so nothing competes with the ball.
 */
const { currentTypedText, isTyping, startTypingAnimation } = useTypingAnimation()
const hovered = ref<Pattern | null>(null)
const inView = ref(false)
const onHover = (id: number | null) => {
  hovered.value = id === null ? null : (allPatterns.find((p) => p.id === id) ?? null)
}

onMounted(() => {
  document.body.classList.add('nav-quiet')
  requestAnimationFrame(() => (inView.value = true))
  startTypingAnimation()
})
onBeforeUnmount(() => document.body.classList.remove('nav-quiet'))
</script>

<style scoped>
.stage {
  position: relative;
  height: 100vh;
  min-height: 640px;
  overflow: hidden;
}
.stage__globe {
  position: absolute;
  inset: 0;
}

/* the copy: bottom left */
.stage__copy {
  position: absolute;
  left: var(--container-padding);
  bottom: 3.25rem;
  z-index: 1;
  pointer-events: none;
}
.stage__title {
  font-size: clamp(2rem, 1rem + 2.9vw, 4.1rem);
  font-weight: var(--font-weight-light);
  line-height: 1.02;
  letter-spacing: -0.035em;
  margin: 0 0 1.6rem;
}
.line {
  display: block;
  overflow: hidden;
}
.line > span {
  display: block;
  transform: translateY(110%);
  transition: transform 1.3s cubic-bezier(0.2, 0.75, 0.15, 1);
  transition-delay: calc(0.35s + var(--i) * 0.14s);
}
.is-in .line > span {
  transform: none;
}
.rise {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 1.1s ease, transform 1.1s cubic-bezier(0.2, 0.75, 0.15, 1);
  transition-delay: calc(0.55s + var(--i) * 0.18s);
}
.is-in .rise {
  opacity: 1;
  transform: none;
}
.stage__lead {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  pointer-events: auto;
  font-size: 0.9rem;
  letter-spacing: 0.01em;
  color: var(--color-text-primary);
  text-decoration: none;
}
.stage__lead-rule {
  display: block;
  width: 2.4rem;
  height: 1px;
  background: currentColor;
  transition: width 0.5s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.stage__lead:hover .stage__lead-rule {
  width: 4rem;
}

/* the question: bottom right */
.stage__ask {
  position: absolute;
  right: var(--container-padding);
  bottom: 3.25rem;
  z-index: 1;
  max-width: 24rem;
  text-align: right;
  pointer-events: none;
}
.stage__ask-lead {
  margin: 0 0 0.35rem;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}
.stage__ask-q {
  margin: 0;
  min-height: 2.6em;
  font-size: 1.2rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.3;
  color: var(--color-text-primary);
}
.caret {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin-left: 3px;
  background: var(--color-accent-warm);
  vertical-align: -0.15em;
}
.caret.is-blinking {
  animation: blink 1.2s infinite;
}

/* the readout: top centre, a caption over the ball */
.stage__readout {
  position: absolute;
  left: 50%;
  top: 7.6rem;
  z-index: 1;
  margin: 0;
  transform: translateX(-50%);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
}
.is-in .stage__readout {
  transform: translateX(-50%);
}
.stage__readout-in {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6em;
}
.num {
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}
.sep,
.dim {
  color: var(--color-text-tertiary);
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.35s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
}

@media (max-width: 1100px) {
  .stage__readout {
    display: none;
  }
}
@media (max-width: 767px) {
  .stage {
    height: auto;
    min-height: 100svh;
  }
  .stage__copy {
    position: static;
    padding: 7rem var(--container-padding) 0;
  }
  .stage__title {
    font-size: clamp(2rem, 1.1rem + 4.4vw, 2.5rem);
    margin-bottom: 1rem;
  }
  .stage__globe {
    position: absolute;
    inset: 0;
  }
  /* phones: title, question and the way in at the top; the ball has the rest */
  .stage__ask {
    position: static;
    order: -1;
    padding: 0 var(--container-padding);
    max-width: none;
    text-align: left;
  }
  .stage__copy {
    padding-bottom: 0;
  }
  .stage__copy .stage__lead {
    margin-top: 0.25rem;
  }
  .stage__ask {
    margin-top: 1.5rem;
  }
}
</style>
