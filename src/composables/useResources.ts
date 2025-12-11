import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useResourcesStore } from '@/stores/resources'

export function useResources() {
  const store = useResourcesStore()
  const { resources, loading, error } = storeToRefs(store)

  return {
    resources: computed(() => store.resources),
    loading,
    error,
    fetchResources: store.fetchResources,
    getResourceById: store.getResourceById,
    searchResources: store.searchResources,
  }
}
