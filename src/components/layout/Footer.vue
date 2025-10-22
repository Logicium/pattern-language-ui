<template>
  <footer class="footer">
    <div class="footer-divider"></div>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-brand">PatternLanguage.ai</div>
          <p class="text-sm text-secondary">Community-led regeneration<br>for rural America</p>
        </div>
        <div class="footer-col">
          <span class="footer-title">Resources</span>
          <a href="#">Pattern Library</a>
          <a href="#">Workshop Guide</a>
          <a href="#">Documentation</a>
        </div>
        <div class="footer-col">
          <span class="footer-title">Community</span>
          <a href="#">Network</a>
          <a href="#">Events</a>
          <a href="#">Support</a>
        </div>
        <div class="footer-col">
          <span class="footer-title">Contact</span>
          <a href="#">hello@patternlanguage.ai</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="text-xs text-tertiary">© 2025 PatternLanguage.ai</span>
        <span class="text-xs text-tertiary">Inspired by Christopher Alexander & Emergent Campus</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  background: var(--color-bg-primary);
  padding: 6rem 0 3rem;
  position: relative;
}

.footer-divider {
  position: absolute;
  top: 0;
  left: var(--container-padding);
  right: var(--container-padding);
  height: 1px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.footer-brand {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
}

.footer-title {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
  margin-bottom: 1.25rem;
}

.footer-col a {
  display: block;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  transition: color var(--transition-base);
}

.footer-col a:hover {
  color: var(--color-text-primary);
}

.footer-bottom {
  padding-top: 3rem;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  justify-content: space-between;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
