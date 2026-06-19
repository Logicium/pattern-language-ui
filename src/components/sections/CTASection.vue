<template>
  <section class="cta-section" aria-labelledby="cta-title">
    <div class="cta-divider top"></div>

    <div class="ribbon-bg" aria-hidden="true">
      <RibbonCanvas />
    </div>

    <div class="cta-container">
      <div class="cta-content">
        <h2 id="cta-title" class="cta-title">
          Ready to transform<br />your community?
        </h2>
        <p class="cta-lede">
          A growing library of proven patterns, paired with the people putting
          them to work in places like yours.
        </p>
        <div class="cta-actions">
          <router-link to="/signup" class="btn btn-lg btn-light">Create Profile</router-link>
        </div>
      </div>

      <ol class="cta-steps" aria-label="How it works">
        <li class="step step-1">
          <span class="step-num" aria-hidden="true">01</span>
          <div class="step-body">
            <span class="step-label">Discover</span>
            <p class="step-text">Browse a curated library of regenerative patterns drawn from real projects.</p>
          </div>
        </li>
        <li class="step step-2">
          <span class="step-num" aria-hidden="true">02</span>
          <div class="step-body">
            <span class="step-label">Design</span>
            <p class="step-text">Match each pattern to the people, place, and constraints of your community.</p>
          </div>
        </li>
        <li class="step step-3">
          <span class="step-num" aria-hidden="true">03</span>
          <div class="step-body">
            <span class="step-label">Collaborate</span>
            <p class="step-text">Connect with practitioners and document what works as you build it together.</p>
          </div>
        </li>
      </ol>
    </div>

    <div class="cta-divider bottom"></div>
  </section>
</template>

<script setup lang="ts">
import RibbonCanvas from '@/components/RibbonCanvas.vue'
</script>

<style scoped>
.cta-section {
  position: relative;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(232, 180, 160, 0.08), transparent 55%),
    radial-gradient(ellipse at 80% 70%, rgba(201, 184, 232, 0.08), transparent 55%),
    linear-gradient(135deg, var(--color-bg-dark) 0%, #1f1f1f 100%);
  padding: 9rem var(--container-padding);
  overflow: hidden;
  isolation: isolate;
}

.cta-divider {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--color-accent-1) 25%,
    var(--color-accent-2) 50%,
    var(--color-accent-3) 75%,
    transparent 100%);
  z-index: 2;
}

.cta-divider.top { top: 0; }
.cta-divider.bottom { bottom: 0; opacity: 0.5; }

.ribbon-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.45;
}

.cta-container {
  position: relative;
  z-index: 1;
  max-width: var(--container-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: clamp(3rem, 7vw, 8rem);
  align-items: center;
}

/* Left column */
.cta-content {
  color: var(--color-bg-primary);
}

.cta-title {
  font-size: clamp(2.25rem, 4.2vw, 3.5rem);
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-bg-primary);
  margin: 0 0 1.5rem;
}

.cta-lede {
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(253, 251, 247, 0.7);
  max-width: 30rem;
  margin: 0 0 2.5rem;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.75rem 2.25rem;
}

.btn-light {
  color: var(--color-bg-primary);
  border-color: var(--color-bg-primary);
  text-decoration: none;
}

.btn-light:hover {
  box-shadow: 0 0 30px rgba(184, 212, 200, 0.25);
}

/* Right column - steps */
.cta-steps {
  list-style: none;
  margin: 0;
  padding: 0;
}

.step {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1.75rem;
  align-items: baseline;
  padding: 1.4rem 0;
  border-top: 1px solid rgba(253, 251, 247, 0.08);
}

.step:first-child { border-top: none; padding-top: 0; }
.step:last-child { padding-bottom: 0; }

.step-num {
  font-size: 1rem;
  font-weight: var(--font-weight-light);
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.step-1 .step-num { color: var(--color-accent-1); }
.step-2 .step-num { color: var(--color-accent-2); }
.step-3 .step-num { color: var(--color-accent-3); }

.step-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.step-label {
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-bg-primary);
}

.step-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgba(253, 251, 247, 0.6);
}

@media (max-width: 1024px) {
  .cta-section { padding: 6rem var(--container-padding); }
  .cta-container {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
}

@media (max-width: 768px) {
  .cta-section { padding: 5rem var(--container-padding); }
  .cta-actions { gap: 1.25rem 1.75rem; }
  .ribbon-bg { opacity: 0.3; }
}
</style>
