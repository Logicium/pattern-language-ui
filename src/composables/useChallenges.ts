import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useChallengesStore } from '@/stores/challenges'

export function useChallenges() {
  const store = useChallengesStore()
  const { challenges, loading, error } = storeToRefs(store)

  return {
    challenges: computed(() => store.challenges),
    loading,
    error,
    fetchChallenges: store.fetchChallenges,
    getChallengeById: store.getChallengeById,
    searchChallenges: store.searchChallenges,
  }
}
