<template>
  <div class="patterns-page">
    <Navbar />

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

    <PatternSearchFilters
      v-model:search-query="searchQuery"
      :active-filters="activeFilters"
      :common-challenges="commonChallenges"
      @toggle="toggleFilter"
      @remove="removeFilter"
      @clear="clearSearch"
    />

    <section class="section results-section">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <p class="text-secondary">Loading patterns...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p class="text-secondary">{{ error }}</p>
        </div>

        <template v-else>
          <div id="results-header" class="results-header">
            <span class="text-sm text-secondary">
              {{ filteredPatterns.length }} {{ filteredPatterns.length === 1 ? 'pattern' : 'patterns' }} found
            </span>
          </div>

          <PatternResultsGrid
            :patterns="paginatedPatterns"
            @toggle-filter="toggleFilter"
          />

          <Pagination
            v-if="filteredPatterns.length > itemsPerPage"
            v-model:current-page="currentPage"
            v-model:items-per-page="itemsPerPage"
            :total-items="filteredPatterns.length"
            :per-page-options="perPageOptions"
            scroll-target-id="results-header"
          />

          <div v-if="filteredPatterns.length === 0" class="empty-state">
            <p class="text-secondary">No patterns match your search. Try different terms or clear filters.</p>
          </div>
        </template>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Navbar, Footer, CTASection, RibbonCanvas, Pagination } from '@/components'
import PatternSearchFilters from '@/components/patterns/PatternSearchFilters.vue'
import PatternResultsGrid from '@/components/patterns/PatternResultsGrid.vue'
import { usePatternsPage } from '@/composables/usePatternsPage'

const {
  allPatterns, loading, error,
  searchQuery, activeFilters, currentPage, itemsPerPage, perPageOptions,
  commonChallenges, filteredPatterns, paginatedPatterns,
  toggleFilter, removeFilter, clearSearch
} = usePatternsPage()
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

.results-section {
  background: var(--color-bg-secondary);
}

.results-header {
  margin-bottom: 3rem;
}

.empty-state {
  text-align: center;
  padding: 6rem 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .patterns-hero {
    padding: 10rem var(--container-padding) 4rem;
  }
}
</style>
