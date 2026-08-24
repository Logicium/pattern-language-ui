<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHead } from '@unhead/vue'
import { RibbonCanvas } from '@/components'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import { useAuthStore } from '@/stores/auth'
import { useDemoCitizen } from '@/composables/useDemoCitizen'

/**
 * The door into the sandbox. Nobody should linger here: it mints (or resumes)
 * a Cottonwood Springs citizen and hands off to the dashboard.
 */
useHead({ title: 'Entering Cottonwood Springs' })

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const { entering, error, enterDemo } = useDemoCitizen()

onMounted(() => {
  // Already inside the sandbox, or signed in for real — don't touch either.
  if (isAuthenticated.value) {
    router.replace('/dashboard')
    return
  }
  void enterDemo()
})
</script>

<template>
  <div class="demo-entry">
    <RibbonCanvas />

    <div class="panel">
      <BrandLogo to="" mark-only :size="72" />

      <template v-if="error">
        <h1 class="title">We couldn't open the demo</h1>
        <p class="body">{{ error }}</p>
        <div class="actions">
          <button class="btn" :disabled="entering" @click="enterDemo()">Try again</button>
          <router-link to="/cities" class="btn-text">Browse cities instead</router-link>
        </div>
      </template>

      <template v-else>
        <h1 class="title">Moving you in&hellip;</h1>
        <p class="body">
          Setting you up as a citizen of Cottonwood Springs — a fictional town built for
          exactly this. You'll get a name, a dashboard, and PAL.
        </p>
        <div class="pulse" aria-hidden="true">
          <span /><span /><span />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.demo-entry {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-bg-primary);
  padding: var(--spacing-md);
}

.panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  max-width: 42ch;
}

.title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin: 0.5rem 0 0;
}

.body {
  margin: 0;
  font-weight: var(--font-weight-normal);
  line-height: 1.65;
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.pulse {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.pulse span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: demoPulse 1.2s ease-in-out infinite;
}

.pulse span:nth-child(1) { background: var(--color-accent-1); }
.pulse span:nth-child(2) { background: var(--color-accent-2); animation-delay: 0.15s; }
.pulse span:nth-child(3) { background: var(--color-accent-3); animation-delay: 0.3s; }

@keyframes demoPulse {
  0%, 100% { opacity: 0.25; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
  .pulse span { animation: none; opacity: 0.8; }
}
</style>
