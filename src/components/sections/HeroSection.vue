<template>
  <section class="hero gradient-bg">
    <div class="container hero-container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Building Thriving<br>Rural Communities
          </h1>
          <div class="typing-container">
            <span class="typed-text">{{ currentTypedText }}</span>
            <span class="cursor" :class="{ blinking: !isTyping }"></span>
          </div>
        </div>

        <div class="hero-description">
          <p class="text-secondary">
            A collaborative tool empowering rural communities<br>
            to design, plan, and implement innovative solutions<br>
            to complex challenges.
          </p>
        </div>
      </div>

      <div class="hero-interactive">
        <canvas ref="constellationCanvas" class="pattern-constellation"></canvas>
      </div>

      <button class="floating-cta btn">Explore</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTypingAnimation } from '@/composables/useTypingAnimation'
import { useConstellation } from '@/composables/useConstellation'

const constellationCanvas = ref<HTMLCanvasElement | null>(null)

const { currentTypedText, isTyping, startTypingAnimation } = useTypingAnimation()
const { initCanvas, cleanup } = useConstellation(constellationCanvas)

onMounted(() => {
  startTypingAnimation()
  initCanvas()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', initCanvas)
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
}

.hero-container {
  padding-top: 6rem;
  padding-bottom: 3rem;
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

.hero-interactive {
  height: 280px;
  position: relative;
  margin-top: 2rem;
}

.pattern-constellation {
  width: 100%;
  height: 100%;
  display: block;
}

.floating-cta {
  position: absolute;
  bottom: 3rem;
  right: var(--container-padding);
  padding: 0.875rem 1.75rem;
  letter-spacing: 0.08em;
}

@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .typing-container {
    font-size: 1rem;
  }
  
  .hero-interactive {
    height: 200px;
  }
}
</style>
