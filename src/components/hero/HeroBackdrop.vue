<template>
  <RibbonCanvas v-if="variant === 'ribbon'" />
  <LatticeCanvas v-else-if="variant === 'lattice'" />
  <OrbitCanvas v-else-if="variant === 'orbit'" />
</template>

<script setup lang="ts">
import RibbonCanvas from '@/components/RibbonCanvas.vue'
import LatticeCanvas from '@/components/hero/LatticeCanvas.vue'
import OrbitCanvas from '@/components/hero/OrbitCanvas.vue'

export type HeroBackdropVariant = 'ribbon' | 'lattice' | 'orbit'

withDefaults(defineProps<{ variant?: HeroBackdropVariant }>(), {
  variant: 'ribbon',
})
</script>
