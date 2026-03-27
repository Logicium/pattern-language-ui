import { ref, computed, watch } from 'vue'
import { usePatterns } from '@/composables/usePatterns'

export function usePatternsPage() {
  const { patterns: allPatterns, loading, error } = usePatterns()

  const searchQuery = ref('')
  const activeFilters = ref<string[]>([])
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const perPageOptions = [9, 12, 15, 24]

  const commonChallenges = computed(() => {
    const challenges = new Set<string>()
    allPatterns.value.forEach(pattern => {
      pattern.addresses.forEach((addr: string) => challenges.add(addr))
    })
    return Array.from(challenges).sort()
  })

  const filteredPatterns = computed(() => {
    let results = allPatterns.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      results = results.filter(pattern =>
        pattern.title.toLowerCase().includes(query) ||
        pattern.description.toLowerCase().includes(query) ||
        pattern.addresses.some((addr: string) => addr.toLowerCase().includes(query))
      )
    }

    if (activeFilters.value.length > 0) {
      results = results.filter(pattern =>
        activeFilters.value.some(filter => pattern.addresses.includes(filter))
      )
    }

    return results
  })

  const paginatedPatterns = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return filteredPatterns.value.slice(start, start + itemsPerPage.value)
  })

  watch([searchQuery, activeFilters], () => {
    currentPage.value = 1
  }, { deep: true })

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

  const clearSearch = () => { searchQuery.value = '' }

  return {
    allPatterns, loading, error,
    searchQuery, activeFilters, currentPage, itemsPerPage, perPageOptions,
    commonChallenges, filteredPatterns, paginatedPatterns,
    toggleFilter, removeFilter, clearSearch
  }
}
