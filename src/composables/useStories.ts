import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStoriesStore } from '@/stores/stories'

export function useStories() {
  const store = useStoriesStore()
  const { stories, loading, error } = storeToRefs(store)

  return {
    stories: computed(() => store.stories),
    loading,
    error,
    fetchStories: store.fetchStories,
    getStoryById: store.getStoryById,
    searchStories: store.searchStories,
  }
}
