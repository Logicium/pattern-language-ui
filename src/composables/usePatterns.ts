import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePatternsStore } from '@/stores/patterns'

export function usePatterns() {
  const store = usePatternsStore()
  const { patterns, loading, error } = storeToRefs(store)

  return {
    patterns: computed(() => store.patterns),
    loading,
    error,
    fetchPatterns: store.fetchPatterns,
    getPatternById: store.getPatternById,
    searchPatterns: store.searchPatterns,
  }
}
