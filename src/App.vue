<template>
  <div class="app-shell">
    <!-- One persistent navbar outside the page transition — pages don't
         mount their own, so it never flickers between navigations. -->
    <Navbar v-if="showNavbar" />
    <RouterView v-slot="{ Component }">
      <Transition name="page-blur" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <BetaBanner />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import Navbar from '@/components/layout/Navbar.vue'
import BetaBanner from '@/components/layout/BetaBanner.vue'
import { useSeo, SITE_NAME } from '@/composables/useSeo'

const route = useRoute()

const showNavbar = computed(() =>
  route.matched.length > 0 &&
  !route.meta.requiresAuth &&
  !route.meta.noNavbar
)

useHead({
  titleTemplate: (title?: string) =>
    title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Designing Thriving Rural Communities`
})

// Route-level defaults from router meta; detail pages override with entity data via useSeo.
useSeo({
  title: () => route.meta.seoTitle as string | undefined,
  description: () => route.meta.seoDescription as string | undefined,
  path: () => route.path,
  noindex: () => route.meta.noindex as boolean | undefined
})
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