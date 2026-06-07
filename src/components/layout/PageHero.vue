<template>
  <section class="page-hero gradient-bg" :class="`page-hero--${align}`">
    <HeroBackdrop v-if="ribbon" :variant="variant" />
    <div class="container">
      <p v-if="label" class="hero-label text-xs text-tertiary">{{ label }}</p>
      <h1 class="hero-title">{{ title }}</h1>
      <p v-if="subtitle" class="hero-subtitle text-secondary" v-html="subtitle"></p>
      <div v-if="$slots.default" class="hero-extras">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import HeroBackdrop, { type HeroBackdropVariant } from '@/components/hero/HeroBackdrop.vue'

withDefaults(
  defineProps<{
    title: string
    label?: string
    subtitle?: string
    ribbon?: boolean
    align?: 'center' | 'left'
    variant?: HeroBackdropVariant
  }>(),
  { ribbon: true, align: 'center', variant: 'ribbon' },
)
</script>

<style scoped>
.page-hero {
  padding: 12rem var(--container-padding) 6rem;
  position: relative;
  overflow: hidden;
}

.page-hero--center { text-align: center; }
.page-hero--left { text-align: left; }

.container { position: relative; z-index: 1; }

.hero-label {
  display: block;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.8;
  max-width: 60ch;
}

.page-hero--center .hero-subtitle {
  margin-left: auto;
  margin-right: auto;
}

.hero-extras { margin-top: 2.5rem; }

.page-hero--center .hero-extras {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-hero { padding: 10rem var(--container-padding) 4rem; }
  .hero-title { font-size: 2.5rem; }
}
</style>
