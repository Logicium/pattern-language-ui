<template>
  <section class="ledger gradient-bg" :class="{ 'is-in': inView }">
    <div class="ledger__globe">
      <PatternSphere
        :place="{ cx: 0.8, cy: 0.56, r: 0.5, pcx: 0.5, pcy: 0.62, pr: 0.42 }"
        :labels="[7, 3]"
        :mask="false"
        :delay="0.6"
        :avoid="['.navbar', '.ledger__mast', '.ledger__title', '.ledger__sub', '.ledger__strip', '.beta-banner']"
      />
    </div>

    <div class="ledger__in">
      <p class="ledger__mast rise" style="--i: 0">
        <span>A library of patterns for rural places</span>
        <span>Cañon City, Colorado</span>
      </p>

      <h1 class="ledger__title">
        <span class="line" style="--i: 1"><span>Designing</span></span>
        <span class="line" style="--i: 2"><span>thriving rural</span></span>
        <span class="line" style="--i: 3"><span>communities</span></span>
      </h1>

      <div class="ledger__sub rise" style="--i: 4">
        <p class="ledger__q" aria-live="polite">
          <span class="dim">What if your town could</span><br />
          {{ currentTypedText }}<span class="caret" :class="{ 'is-blinking': !isTyping }" />
        </p>
        <router-link to="/patterns" class="ledger__lead">
          <span class="ledger__lead-rule" aria-hidden="true" />
          {{ content.hero.exploreLabel }} the library
        </router-link>
      </div>

      <dl class="ledger__strip rise" style="--i: 5">
        <div><dt>50</dt><dd>Patterns</dd></div>
        <div><dt>15</dt><dd>Wicked problems</dd></div>
        <div><dt>Nov 7</dt><dd>Community Solution Sprint</dd></div>
        <div><dt>Beta</dt><dd>Open now</dd></div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PatternSphere from '@/components/PatternSphere.vue'
import { useTypingAnimation } from '@/composables/useTypingAnimation'
import { content } from '@/data/site'

/**
 * Hero, variant "Ledger": a magazine front. The title at full size down the
 * left, the globe cut by the right edge of the page like a planet at a
 * window, and a strip of figures along the foot. The hairlines draw
 * themselves, then the lines of the title rise.
 */
const { currentTypedText, isTyping, startTypingAnimation } = useTypingAnimation()
const inView = ref(false)
onMounted(() => {
  requestAnimationFrame(() => (inView.value = true))
  startTypingAnimation()
})
</script>

<style scoped>
.ledger {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ledger__globe {
  position: absolute;
  inset: 0;
}
.ledger__in {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: var(--container-max);
  width: 100%;
  margin: 0 auto;
  padding: 7.5rem var(--container-padding) 6.5rem; /* the foot clears the beta notice */
  pointer-events: none;
}
.ledger__in a {
  pointer-events: auto;
}

/* masthead */
.ledger__mast {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin: 0 0 3.5rem;
  padding-bottom: 0.9rem;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  position: relative;
}
.ledger__mast::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--hairline-strong);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 1.4s cubic-bezier(0.2, 0.75, 0.15, 1) 0.2s;
}
.is-in .ledger__mast::after {
  transform: none;
}

/* the title */
.ledger__title {
  margin: 0 0 2.5rem;
  font-size: clamp(3.4rem, 1rem + 7.4vw, 8rem);
  font-weight: var(--font-weight-light);
  line-height: 0.96;
  letter-spacing: -0.045em;
  max-width: 11ch;
}
.line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.06em;
  margin-bottom: -0.06em;
}
.line > span {
  display: block;
  transform: translateY(108%);
  transition: transform 1.4s cubic-bezier(0.2, 0.75, 0.15, 1);
  transition-delay: calc(0.3s + var(--i) * 0.13s);
}
.is-in .line > span {
  transform: none;
}
.rise {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 1.1s ease, transform 1.2s cubic-bezier(0.2, 0.75, 0.15, 1);
  transition-delay: calc(0.4s + var(--i) * 0.16s);
}
.is-in .rise {
  opacity: 1;
  transform: none;
}

/* the question and the way in */
.ledger__sub {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.5rem 4rem;
  margin-bottom: auto;
}
.ledger__q {
  margin: 0;
  min-height: 3.2em;
  max-width: 24rem;
  font-size: 1.15rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.45;
}
.dim {
  color: var(--color-text-tertiary);
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
.ledger__lead {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  padding-bottom: 0.45rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  text-decoration: none;
}
.ledger__lead-rule {
  display: block;
  width: 2.4rem;
  height: 1px;
  background: currentColor;
  transition: width 0.5s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.ledger__lead:hover .ledger__lead-rule {
  width: 4rem;
}

/* the figures */
.ledger__strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 4rem 0 0;
  border-top: 1px solid var(--hairline-strong);
}
.ledger__strip > div {
  padding: 1.1rem 1.5rem 0 0;
}
.ledger__strip > div + div {
  border-left: 1px solid var(--hairline);
  padding-left: 1.5rem;
}
.ledger__strip dt {
  font-size: 1.9rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 0.45rem;
}
.ledger__strip dd {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .ledger__strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 1.5rem;
  }
  .ledger__strip > div:nth-child(3) {
    border-left: 0;
    padding-left: 0;
  }
}
@media (max-width: 767px) {
  .ledger__in {
    padding-top: 6.5rem;
    padding-bottom: 6.5rem;
  }
  .ledger__mast {
    margin-bottom: 2rem;
  }
  .ledger__mast span:last-child {
    display: none;
  }
  .ledger__title {
    font-size: clamp(2.6rem, 1rem + 9.5vw, 3.6rem);
    margin-bottom: 1.75rem;
  }
  .ledger__sub {
    gap: 1.25rem;
  }
  .ledger__q {
    font-size: 1.05rem;
  }
  /* the ball takes the middle of the phone; the figures wait below it */
  .ledger__strip {
    margin-top: calc(100svh - 20rem);
  }
}
</style>
