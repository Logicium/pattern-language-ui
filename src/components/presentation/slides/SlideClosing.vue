<script setup lang="ts">
import BrandLogo from '@/components/layout/BrandLogo.vue'
</script>

<template>
  <div class="slide">
    <BrandLogo to="" mark-only :size="90" class="rise" style="--d: 0.1s" />
    <h2 class="pld-display pld-display--xl rise" style="--d: 0.3s">
      Help your town<br />find its pattern.
    </h2>
    <p class="pld-body center rise" style="--d: 0.6s">
      A hackathon lasts 48 hours. A pattern language lasts as long as the community that
      speaks it. Thank you, SoCo Startup Week.
    </p>
    <div class="pld-accent-line rise" style="--d: 0.85s" />
    <p class="contact rise" style="--d: 1s">
      Kisora Thomas &amp; Joze Petrich &nbsp;·&nbsp; ruralpatternlanguage.com &nbsp;·&nbsp;
      September 19 — Cañon City
    </p>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: clamp(1.2rem, 3vh, 2rem);
}

.center {
  max-width: 48ch;
}

.contact {
  margin: 0;
  font-size: clamp(0.8rem, 1.1vw, 0.95rem);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 300;
  color: var(--color-text-tertiary);
}
</style>
