<template>
  <section class="section case-studies-section">
    <div class="container">
      <div class="section-header">
        <span class="section-number">02</span>
        <h2 class="section-title">Success Stories</h2>
      </div>

      <div class="studies-grid">
        <div
          v-for="study in studies"
          :key="study.id"
          class="study-card card"
        >
          <div class="study-visual" :style="{ backgroundColor: study.color }">
            <div class="study-location text-xs">{{ study.location }}</div>
          </div>
          <div class="study-content">
            <h3>{{ study.title }}</h3>
            <div class="study-section">
              <span class="study-label text-xs text-tertiary">Challenge</span>
              <p class="text-sm text-secondary">{{ study.problem }}</p>
            </div>
            <div class="study-section">
              <span class="study-label text-xs text-tertiary">Solution</span>
              <p class="text-sm text-secondary">{{ study.solution }}</p>
            </div>
            <div class="study-patterns">
              <span v-for="p in study.patterns" :key="p" class="tag text-xs text-secondary">
                {{ p }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="explore-more">
        <router-link to="/stories" class="btn btn-lg">
          Explore All Stories
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { caseStudies } from '@/utils/data'

const studies = caseStudies.slice(0, 3)
</script>

<style scoped>
.case-studies-section {
  background: var(--color-bg-secondary);
}

.studies-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.study-card {
  overflow: hidden;
}

.study-visual {
  height: 280px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 2rem;
}

.study-location {
  letter-spacing: 0.08em;
  background: rgba(253, 251, 247, 0.95);
  padding: 0.5rem 1rem;
  backdrop-filter: blur(10px);
  color: var(--color-text-primary);
}

.study-content {
  padding: 2.5rem;
}

.study-content h3 {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.study-section {
  margin-bottom: 1.5rem;
}

.study-label {
  display: block;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.study-section p {
  line-height: 1.7;
}

.study-patterns {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
}

.explore-more {
  margin-top: 4rem;
  text-align: center;
}

.explore-more a {
  text-decoration: none;
}

@media (max-width: 1024px) {
  .studies-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .study-content {
    padding: 2rem;
  }
  
  .study-visual {
    height: 200px;
  }
}
</style>
