<template>
  <RibbonCanvas v-if="variant === 'ribbon'" />
  <LatticeCanvas v-else-if="variant === 'lattice'" />
  <OrbitCanvas v-else-if="variant === 'orbit'" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Async so three.js stays out of the initial bundle and loads after first paint.
const RibbonCanvas = defineAsyncComponent(() => import('@/components/RibbonCanvas.vue'))
const LatticeCanvas = defineAsyncComponent(() => import('@/components/hero/LatticeCanvas.vue'))
const OrbitCanvas = defineAsyncComponent(() => import('@/components/hero/OrbitCanvas.vue'))

export type HeroBackdropVariant = 'ribbon' | 'lattice' | 'orbit'

withDefaults(defineProps<{ variant?: HeroBackdropVariant }>(), {
  variant: 'ribbon',
})
</script>
