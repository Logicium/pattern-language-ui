<template>
  <div class="legal-page">
    <Navbar />

    <PageHero
      label="Legal"
      :title="title"
      :subtitle="`Last updated ${updated}`"
    />

    <section class="section legal-content">
      <div class="container narrow">
        <slot />
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Navbar, Footer, PageHero } from '@/components'

defineProps<{ title: string; updated: string }>()
</script>

<style scoped>
.legal-page { min-height: 100vh; }

.legal-content { background: var(--color-bg-primary); }

.container.narrow {
  max-width: 760px;
  margin: 0 auto;
}

.legal-content :slotted(h2) {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin: 3rem 0 1rem;
  letter-spacing: -0.01em;
}

.legal-content :slotted(h2:first-child) { margin-top: 0; }

.legal-content :slotted(h3) {
  font-size: 1.125rem;
  font-weight: var(--font-weight-medium);
  margin: 2rem 0 0.75rem;
  color: var(--color-text-primary);
}

.legal-content :slotted(p) {
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 1.25rem;
}

.legal-content :slotted(ul) {
  margin: 0 0 1.5rem 1.5rem;
  color: var(--color-text-secondary);
}

.legal-content :slotted(li) {
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

.legal-content :slotted(a) {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-decoration-color: rgba(42, 42, 42, 0.3);
  transition: text-decoration-color var(--transition-base);
}

.legal-content :slotted(a:hover) {
  text-decoration-color: var(--color-text-primary);
}
</style>
