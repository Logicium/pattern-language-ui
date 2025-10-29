<template>
  <section class="hero gradient-bg">
    <div class="hero-interactive">
      <PatternConstellation />
    </div>
    
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

      <router-link to="/patterns" class="floating-cta btn">Explore</router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTypingAnimation } from '@/composables/useTypingAnimation'
import { PatternConstellation } from '@/components'

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

.hero-container {
  padding-top: 3rem;
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

.hero-interactive {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 45%;
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
  .hero-title {
    font-size: 2.5rem;
  }
  
  .typing-container {
    font-size: 1rem;
  }
  
  .hero-interactive {
    height: 100%;
  }
}
</style>
