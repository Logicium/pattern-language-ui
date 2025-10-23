<template>
  <div class="patterns-page">
    <Navbar />
    
    <!-- Hero -->
    <section class="patterns-hero gradient-bg">
      <RibbonCanvas />
      <div class="container">
        <h1 class="hero-title">Pattern Library</h1>
        <p class="hero-subtitle text-secondary">
          {{ allPatterns.length }} modular solutions for rural revitalization.<br>
          Mix, match, and adapt to your community's needs.
        </p>
      </div>
    </section>

    <!-- Search & Filters -->
    <section class="section search-section">
      <div class="container">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search patterns by name or challenge..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn text-xs">
            Clear
          </button>
        </div>
        
        <div v-if="activeFilters.length > 0" class="active-filters">
          <span class="text-xs text-tertiary">Filtering by:</span>
          <button
            v-for="filter in activeFilters"
            :key="filter"
            @click="removeFilter(filter)"
            class="filter-tag text-xs"
          >
            {{ filter }} ×
          </button>
        </div>

        <div class="filter-section">
          <span class="text-xs text-tertiary">Common Challenges:</span>
          <div class="filter-buttons">
            <button
              v-for="challenge in commonChallenges"
              :key="challenge"
              @click="toggleFilter(challenge)"
              class="filter-btn text-xs"
              :class="{ active: activeFilters.includes(challenge) }"
            >
              {{ challenge }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results -->
    <section class="section results-section">
      <div class="container">
        <div class="results-header">
          <span class="text-sm text-secondary">
            {{ filteredPatterns.length }} {{ filteredPatterns.length === 1 ? 'pattern' : 'patterns' }} found
          </span>
        </div>

        <div v-if="filteredPatterns.length > 0" class="patterns-grid">
          <div
            v-for="(pattern, index) in filteredPatterns"
            :key="pattern.id"
            class="pattern-card"
            :data-accent="(index % 3) + 1"
          >
            <div class="pattern-header">
              <span class="pattern-id text-xs text-tertiary">
                {{ String(pattern.id).padStart(2, '0') }}
              </span>
            </div>
            <h3>{{ pattern.title }}</h3>
            <p class="text-sm text-secondary">{{ pattern.description }}</p>
            <div class="pattern-tags">
              <span
                v-for="addr in pattern.addresses"
                :key="addr"
                class="tag text-xs"
                @click="toggleFilter(addr)"
              >
                {{ addr }}
              </span>
            </div>
            <router-link :to="`/patterns/${pattern.id}`" class="learn-more text-xs">
              Learn More
            </router-link>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="text-secondary">No patterns match your search. Try different terms or clear filters.</p>
        </div>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Navbar, Footer, CTASection, RibbonCanvas } from '@/components'
import { allPatterns } from '@/utils/data'

const searchQuery = ref('')
const activeFilters = ref<string[]>([])

// Extract unique challenges
const commonChallenges = computed(() => {
  const challenges = new Set<string>()
  allPatterns.forEach(pattern => {
    pattern.addresses.forEach(addr => challenges.add(addr))
  })
  return Array.from(challenges).sort()
})

// Filter patterns
const filteredPatterns = computed(() => {
  let results = allPatterns

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(pattern =>
      pattern.title.toLowerCase().includes(query) ||
      pattern.description.toLowerCase().includes(query) ||
      pattern.addresses.some(addr => addr.toLowerCase().includes(query))
    )
  }

  // Apply filters
  if (activeFilters.value.length > 0) {
    results = results.filter(pattern =>
      activeFilters.value.some(filter => pattern.addresses.includes(filter))
    )
  }

  return results
})

const toggleFilter = (filter: string) => {
  const index = activeFilters.value.indexOf(filter)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filter)
  }
}

const removeFilter = (filter: string) => {
  const index = activeFilters.value.indexOf(filter)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>

<style scoped>
.patterns-page {
  min-height: 100vh;
}

.patterns-hero {
  padding: 12rem var(--container-padding) 6rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.8;
  position: relative;
  z-index: 1;
}

.search-section {
  background: var(--color-bg-primary);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.search-bar {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent-1);
  background: var(--color-bg-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color var(--transition-base);
}

.clear-btn:hover {
  color: var(--color-text-primary);
}

.active-filters {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 0.5rem 1rem;
  background: var(--color-accent-1);
  color: var(--color-bg-primary);
  border: none;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
}

.filter-tag:hover {
  background: var(--color-accent-warm);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
}

.filter-btn:hover {
  border-color: var(--color-accent-1);
  color: var(--color-text-primary);
}

.filter-btn.active {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
}

.results-section {
  background: var(--color-bg-secondary);
}

.results-header {
  margin-bottom: 3rem;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.pattern-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
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

.pattern-header {
  margin-bottom: 1rem;
}

.pattern-id {
  letter-spacing: 0.1em;
}

.pattern-card h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.pattern-card p {
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.pattern-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: rgba(42, 42, 42, 0.05);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag:hover {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
}

.learn-more {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  padding-bottom: 3px;
  border-bottom: 2px solid var(--color-text-primary);
  transition: color var(--transition-base);
  position: relative;
}

.learn-more::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1));
  background-size: 300% 100%;
  transition: width var(--transition-base);
  animation: borderSwirl 3s linear infinite;
}

.learn-more:hover {
  color: var(--color-accent-1);
}

.learn-more:hover::after {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 6rem 0;
}

@media (max-width: 1024px) {
  .patterns-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .patterns-hero {
    padding: 10rem var(--container-padding) 4rem;
  }

  .patterns-grid {
    grid-template-columns: 1fr;
  }

  .filter-buttons {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
