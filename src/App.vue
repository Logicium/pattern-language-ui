<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <Transition name="page-blur" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <BetaBanner />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import BetaBanner from '@/components/layout/BetaBanner.vue'
</script>

<style>
@import '@/assets/styles/global.css';
@import '@/assets/styles/buttons.css';
@import '@/assets/styles/forms.css';
@import '@/assets/styles/layouts.css';
@import '@/assets/styles/components.css';

/* The shell clips bleed from page-blur's transform/blur so no scrollbars flash during transition. */
.app-shell {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: clip;
}

.page-blur-enter-active,
.page-blur-leave-active {
  transition: opacity 360ms ease, filter 360ms ease, transform 360ms ease;
  transform-origin: center center;
  will-change: opacity, filter, transform;
}

.page-blur-enter-from {
  opacity: 0;
  filter: blur(12px);
  transform: scale(1.006);
}

.page-blur-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: scale(0.997);
}

.page-blur-enter-to,
.page-blur-leave-from {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .page-blur-enter-active,
  .page-blur-leave-active {
    transition: opacity 200ms ease;
  }
  .page-blur-enter-from,
  .page-blur-leave-to {
    filter: none;
    transform: none;
  }
}
</style>