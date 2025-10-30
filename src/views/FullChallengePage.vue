<template>
  <div class="full-challenge-page">
    <!-- Hero Section -->
    <section class="challenge-hero gradient-bg">
      <div class="container">
        <div class="hero-label text-xs text-tertiary">Wicked Problem {{ String(challenge?.id).padStart(2, '0') }}</div>
        <h1 class="hero-title">{{ challenge?.title }}</h1>
        <p class="hero-description text-lg text-secondary">{{ challenge?.description }}</p>
      </div>
    </section>

    <!-- Context Section -->
    <section class="content-section">
      <div class="container">
        <div class="content-block">
          <h2 class="section-title">Context</h2>
          <p class="body-text">{{ challenge?.context }}</p>
        </div>
      </div>
    </section>

    <!-- Manifestations Section -->
    <section class="content-section alt-bg">
      <div class="container">
        <div class="content-block">
          <h2 class="section-title">How This Shows Up</h2>
          <ul class="manifestation-list">
            <li
              v-for="(manifestation, index) in challenge?.manifestations"
              :key="index"
              class="manifestation-item text-sm"
            >
              {{ manifestation }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Related Patterns Section -->
    <section class="content-section">
      <div class="container">
        <div class="content-block">
          <h2 class="section-title">Patterns That Address This Challenge</h2>
          <div class="related-patterns-grid">
            <div
              v-for="(patternTitle, index) in challenge?.relatedPatterns"
              :key="index"
              class="pattern-card"
              :data-accent="(index % 3) + 1"
              @click="navigateToPattern(patternTitle)"
            >
              <div class="pattern-number text-xs text-tertiary">
                {{ String(getPatternIdByTitle(patternTitle)).padStart(2, '0') }}
              </div>
              <h3 class="pattern-title text-sm">{{ patternTitle }}</h3>
              <div class="pattern-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section gradient-bg">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Address This Challenge?</h2>
          <p class="cta-description text-sm text-secondary">
            Explore the related patterns to find practical, community-tested approaches
          </p>
          <div class="cta-buttons">
            <button class="btn-primary" @click="$router.push('/patterns')">
              Browse All Patterns
            </button>
            <button class="btn-secondary" @click="$router.back()">
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allChallenges, allPatterns } from '@/utils/data'

const route = useRoute()
const router = useRouter()

const challengeId = computed(() => parseInt(route.params.id as string))
const challenge = computed(() => allChallenges.find(c => c.id === challengeId.value))

const getPatternIdByTitle = (title: string): number => {
  const pattern = allPatterns.find(p => p.title === title)
  return pattern?.id || 0
}

const navigateToPattern = (title: string) => {
  const patternId = getPatternIdByTitle(title)
  if (patternId) {
    router.push(`/patterns/${patternId}`)
  }
}
</script>

<style scoped>
.full-challenge-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Hero Section */
.challenge-hero {
  padding: 6rem var(--container-padding) 4rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.challenge-hero .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}

.hero-label {
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.hero-description {
  line-height: 1.7;
  max-width: 700px;
}

/* Content Sections */
.content-section {
  padding: 4rem var(--container-padding);
  background: var(--color-bg-primary);
}

.content-section.alt-bg {
  background: var(--color-bg-secondary);
}

.content-section .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}

.content-block {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 1.5rem;
}

.body-text {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

/* Manifestations */
.manifestation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.manifestation-item {
  padding: 1.25rem 1.5rem;
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-2);
  line-height: 1.7;
  transition: all var(--transition-base);
}

.manifestation-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(42, 42, 42, 0.05);
}

/* Related Patterns Grid */
.related-patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.pattern-card {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pattern-card[data-accent="1"] {
  border-left-color: var(--color-accent-1);
}

.pattern-card[data-accent="2"] {
  border-left-color: var(--color-accent-2);
}

.pattern-card[data-accent="3"] {
  border-left-color: var(--color-accent-3);
}

.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.pattern-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pattern-title {
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  flex: 1;
}

.pattern-arrow {
  font-size: 1.25rem;
  color: var(--color-text-tertiary);
  align-self: flex-end;
  transition: all var(--transition-base);
}

.pattern-card:hover .pattern-arrow {
  color: var(--color-text-primary);
  transform: translateX(4px);
}

/* CTA Section */
.cta-section {
  padding: 5rem var(--container-padding);
  text-align: center;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.cta-section .container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0;
}

.cta-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.cta-description {
  margin-bottom: 2.5rem;
  line-height: 1.7;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--color-text-primary);
  background: transparent;
  color: var(--color-text-primary);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-text-primary);
  transform: translateY(100%);
  transition: transform var(--transition-base);
  z-index: -1;
}

.btn-primary:hover::before {
  transform: translateY(0);
}

.btn-primary:hover {
  color: var(--color-bg-primary);
}

.btn-secondary {
  border-color: rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
}

.btn-secondary:hover {
  border-color: var(--color-accent-2);
  color: var(--color-text-primary);
  background: rgba(184, 212, 200, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .challenge-hero {
    padding: 4rem var(--container-padding) 3rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .content-section {
    padding: 3rem var(--container-padding);
  }

  .section-title {
    font-size: 1.25rem;
  }

  .related-patterns-grid {
    grid-template-columns: 1fr;
  }

  .cta-section {
    padding: 4rem var(--container-padding);
  }

  .cta-title {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
