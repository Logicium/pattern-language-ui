<template>
  <div class="logout-page gradient-bg">
    <RibbonCanvas />
    <div class="logout-content">
      <BrandLogo :mark-only="true" :size="56" class="logout-mark" />
      <p class="eyebrow text-xs text-tertiary">Signed out</p>
      <h1 class="logout-title">You're signed out.</h1>
      <p class="logout-sub text-secondary">
        Come back when you're ready.<br>
        Your playbooks will be waiting.
      </p>

      <div class="logout-actions">
        <router-link to="/login" class="btn btn-primary">Sign back in</router-link>
        <router-link to="/" class="btn-link text-xs">Return home</router-link>
      </div>

      <p class="auto-redirect text-xs text-tertiary">
        Redirecting to login in {{ countdown }}s…
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RibbonCanvas } from '@/components'
import BrandLogo from '@/components/layout/BrandLogo.vue'

const router = useRouter()
const countdown = ref(5)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      if (timer) clearInterval(timer)
      router.push('/login')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.logout-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem var(--container-padding);
  position: relative;
  overflow: hidden;
}

.logout-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 480px;
}

.logout-mark { margin-bottom: 2rem; }

.eyebrow {
  display: block;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.logout-title {
  font-size: 2.75rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.logout-sub {
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.logout-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 3rem;
}

.btn-link {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  text-decoration: none;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}

.btn-link:hover { color: var(--color-text-primary); }

.auto-redirect {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .logout-title { font-size: 2rem; }
}
</style>
