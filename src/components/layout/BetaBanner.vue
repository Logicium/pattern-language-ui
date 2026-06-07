<template>
  <Transition name="beta-banner">
    <div v-if="visible" class="beta-banner" role="status">
      <div class="beta-banner-inner">
        <span class="beta-dot" aria-hidden="true"></span>
        <span class="beta-text text-xs">
          <strong class="beta-label">Beta</strong>
          <span class="beta-message">— You're early. Things may shift.</span>
          <router-link to="/beta" class="beta-link">What this means</router-link>
        </span>
        <button
          type="button"
          class="beta-close"
          aria-label="Dismiss announcement"
          @click="dismiss"
        >×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'pl_beta_banner_dismissed_v1'
const visible = ref(false)

onMounted(() => {
  try {
    visible.value = localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
  try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
}
</script>

<style scoped>
.beta-banner {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  max-width: calc(100vw - 2rem);
}

.beta-banner-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.625rem 0.75rem 0.625rem 1rem;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  font-family: var(--font-family);
}

.beta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent-1);
  box-shadow: 0 0 0 0 rgba(232, 180, 160, 0.7);
  animation: betaPulse 2s ease-out infinite;
  flex-shrink: 0;
}

@keyframes betaPulse {
  0% { box-shadow: 0 0 0 0 rgba(232, 180, 160, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(232, 180, 160, 0); }
  100% { box-shadow: 0 0 0 0 rgba(232, 180, 160, 0); }
}

.beta-text {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  letter-spacing: 0.01em;
}

.beta-label {
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: var(--font-weight-medium);
  color: var(--color-accent-1);
}

.beta-message { color: rgba(253, 251, 247, 0.85); }

.beta-link {
  color: var(--color-bg-primary);
  text-decoration: underline;
  text-decoration-color: rgba(253, 251, 247, 0.4);
  transition: text-decoration-color var(--transition-base);
}

.beta-link:hover { text-decoration-color: var(--color-bg-primary); }

.beta-close {
  background: none;
  border: none;
  color: rgba(253, 251, 247, 0.6);
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  margin-left: 0.25rem;
  transition: color var(--transition-base);
}

.beta-close:hover { color: var(--color-bg-primary); }

.beta-banner-enter-active,
.beta-banner-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.beta-banner-enter-from,
.beta-banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

@media (max-width: 640px) {
  .beta-banner-inner {
    padding: 0.5rem 0.5rem 0.5rem 0.875rem;
    gap: 0.5rem;
  }

  .beta-message { display: none; }
}
</style>
