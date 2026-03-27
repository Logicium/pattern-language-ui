<template>
  <div class="full-challenge-page">
    <section class="challenge-hero gradient-bg">
      <div class="container">
        <div class="hero-label text-xs text-tertiary">Wicked Problem {{ String(challenge?.id).padStart(2, '0') }}</div>
        <h1 class="hero-title">{{ challenge?.title }}</h1>
        <p class="hero-description text-lg text-secondary">{{ challenge?.description }}</p>
      </div>
    </section>

    <ChallengeContent
      v-if="challenge"
      :challenge="challenge"
      :get-pattern-id="getPatternIdByTitle"
      @navigate-pattern="navigateToPattern"
    />

    <section v-if="!isModal" class="cta-section gradient-bg">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Address This Challenge?</h2>
          <p class="cta-description text-sm text-secondary">
            Explore the related patterns to find practical, community-tested approaches
          </p>
          <div class="cta-buttons">
            <button class="btn-primary" @click="$router.push('/patterns')">Browse All Patterns</button>
            <button class="btn-secondary" @click="$router.back()">Back to Resources</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChallenges } from '@/composables/useChallenges'
import { usePatterns } from '@/composables/usePatterns'
import ChallengeContent from '@/components/full-challenge/ChallengeContent.vue'

interface Props {
  challengeData?: any
  isModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isModal: false
})

const { challenges: allChallenges } = useChallenges()
const { patterns: allPatterns } = usePatterns()
const route = useRoute()
const router = useRouter()

const challengeId = computed(() => props.challengeData?.id || parseInt(route.params.id as string))
const challenge = computed(() => props.challengeData || allChallenges.value.find(c => c.id === challengeId.value))

const getPatternIdByTitle = (title: string): number => {
  const pattern = allPatterns.value.find(p => p.title === title)
  return pattern?.id || 0
}

const navigateToPattern = (title: string) => {
  const patternId = getPatternIdByTitle(title)
  if (patternId) router.push(`/patterns/${patternId}`)
}
</script>

<style scoped>
.full-challenge-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

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

.btn-primary:hover::before { transform: translateY(0); }
.btn-primary:hover { color: var(--color-bg-primary); }

.btn-secondary {
  border-color: rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
}

.btn-secondary:hover {
  border-color: var(--color-accent-2);
  color: var(--color-text-primary);
  background: rgba(184, 212, 200, 0.05);
}

@media (max-width: 768px) {
  .challenge-hero { padding: 4rem var(--container-padding) 3rem; }
  .hero-title { font-size: 2rem; }
  .cta-section { padding: 4rem var(--container-padding); }
  .cta-title { font-size: 1.5rem; }
  .cta-buttons { flex-direction: column; }
  .btn-primary, .btn-secondary { width: 100%; }
}
</style>
