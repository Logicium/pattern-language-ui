<template>
  <div class="not-found-page gradient-bg">
    <RibbonCanvas />
    <div class="nf-content">
      <BrandLogo :mark-only="true" :size="56" class="nf-mark" />
      <p class="eyebrow text-xs text-tertiary">404 — Pattern not found</p>
      <h1 class="nf-title">This page is missing<br>from the language.</h1>
      <p class="nf-sub text-secondary">
        The link you followed may be broken, or the page may have moved.<br>
        Try one of the paths below.
      </p>

      <div class="nf-actions">
        <router-link to="/" class="btn btn-primary">Return home</router-link>
        <router-link to="/patterns" class="btn-link text-xs">Browse patterns</router-link>
        <router-link to="/stories" class="btn-link text-xs">Read stories</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RibbonCanvas } from '@/components'
import BrandLogo from '@/components/layout/BrandLogo.vue'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem var(--container-padding);
  position: relative;
  overflow: hidden;
}

.nf-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 560px;
}

.nf-mark { margin-bottom: 2rem; }

.eyebrow {
  display: block;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.nf-title {
  font-size: 3rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}

.nf-sub {
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.nf-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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

@media (max-width: 768px) {
  .nf-title { font-size: 2.25rem; }
}
</style>
