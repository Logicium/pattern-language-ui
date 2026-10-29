<template>
  <section class="hero gradient-bg">
    <div class="hero-interactive">
      <PatternSphere :avoid="['.hero-text', '.hero-description p', '.floating-cta', '.beta-banner']" />
    </div>
    
    <div class="container hero-container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            {{ content.hero.titleLead }}<br>{{ content.hero.titleTrail }}
          </h1>
          <div class="typing-container">
            <span class="typed-text">{{ currentTypedText }}</span>
            <span class="cursor" :class="{ blinking: !isTyping }"></span>
          </div>
        </div>

        <div class="hero-description">
          <p class="text-secondary">
            {{ content.hero.descLead }}<br>
            {{ content.hero.descMid }}<br>
            {{ content.hero.descTrail }}
          </p>
        </div>
      </div>

      <router-link to="/patterns" class="floating-cta btn">{{ content.hero.exploreLabel }}</router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTypingAnimation } from '@/composables/useTypingAnimation'
import { content } from '@/data/site'
import PatternSphere from '@/components/PatternSphere.vue'

const { currentTypedText, isTyping, startTypingAnimation } = useTypingAnimation()

onMounted(() => {
  startTypingAnimation()
})
</script>

<style scoped>
.hero {
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* the copy sits over the globe; only the copy itself takes the pointer, so the globe stays touchable around it */
.hero-container {
  pointer-events: none;
  padding-bottom: 3rem;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}

.typing-container {
  font-size: 1.125rem;
  color: var(--color-accent-warm);
  min-height: 40px;
  letter-spacing: -0.01em;
  padding: 1rem 1.5rem;
  background: rgba(232, 180, 160, 0.08);
  border-left: 2px solid var(--color-accent-1);
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.125rem;
  background: var(--color-accent-warm);
  margin-left: 4px;
  vertical-align: middle;
}

.cursor.blinking {
  animation: blink 1.2s infinite;
}

.hero-description {
  display: flex;
  align-items: flex-end;
}

.hero-description p {
  line-height: 1.8;
}

.hero-text,
.hero-description p,
.floating-cta {
  pointer-events: auto;
}

/* the globe takes the whole hero; it places itself low and to the right */
.hero-interactive {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.floating-cta {
  position: absolute;
  bottom: 3rem;
  right: var(--container-padding);
  padding: 0.875rem 1.75rem;
  letter-spacing: 0.08em;
  z-index: 2;
  text-decoration: none;
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
}

@media (max-width: 768px) {
  /*
   * Phones: the hero flows from the top instead of centring in a fixed
   * 100vh box. Centred, a hero taller than the visible area spilled upward
   * under the logo; flowing, it can only grow downward.
   */
  .hero {
    max-height: none;
    min-height: 100svh;
    justify-content: flex-start;
    padding-top: 7.5rem;
    padding-bottom: 6.5rem; /* clears the beta notice */
  }

  .hero-container {
    padding-bottom: 0;
  }

  .hero-content {
    gap: 2.5rem;
    margin-bottom: 2rem;
  }

  .hero-title {
    font-size: clamp(2.1rem, 1.2rem + 4.2vw, 2.5rem);
    margin-bottom: 1.5rem;
  }

  .typing-container {
    font-size: 1rem;
  }

  /* hand-set line breaks orphan single words at phone widths */
  .hero-description br {
    display: none;
  }

  .hero-description p {
    line-height: 1.65;
  }

  .floating-cta {
    position: static;
    align-self: flex-start;
    display: inline-block;
  }
}
</style>
