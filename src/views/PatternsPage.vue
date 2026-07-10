<template>
  <div class="patterns-page">
    <Navbar />

    <PageHero
      title="Pattern Library"
      variant="lattice"
      :subtitle="`${allPatterns.length} modular solutions for rural revitalization.<br>Mix, match, and adapt to your community's needs.`"
    />

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
import { Navbar, Footer, CTASection, PageHero, Pagination } from '@/components'
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
