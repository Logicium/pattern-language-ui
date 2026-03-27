import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { citiesApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useChallenges } from '@/composables/useChallenges'

export function useFullCityPage() {
  const route = useRoute()
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const { challenges: allChallenges } = useChallenges()

  const city = ref<any>(null)
  const loading = ref(true)
  const error = ref('')
  const generating = ref(false)
  const showChallengeModal = ref(false)
  const selectedChallengeId = ref<number | null>(null)

  const selectedChallenge = computed(() =>
    allChallenges.value.find(c => c.id === selectedChallengeId.value) ?? null
  )

  const normalizedProblems = computed(() => {
    if (!city.value?.wickedProblems) return []
    return city.value.wickedProblems.map((wp: any) => {
      if (typeof wp === 'string') {
        return { description: wp, challengeId: null, challengeTitle: null }
      }
      return {
        description: wp.description,
        challengeId: wp.challengeId ?? null,
        challengeTitle: wp.challengeTitle ?? null,
      }
    })
  })

  const breakdown = computed(() => city.value?.readinessBreakdown ?? null)

  function openChallenge(challengeId: number) {
    selectedChallengeId.value = challengeId
    showChallengeModal.value = true
  }

  function extractDomain(url: string): string {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  }

  async function fetchCity() {
    try {
      city.value = await citiesApi.getById(+route.params.id!)
    } catch {
      error.value = 'Failed to load city. Please try again.'
    } finally {
      loading.value = false
    }
  }

  async function generate() {
    generating.value = true
    try {
      await citiesApi.generateInfo(+route.params.id!)
      await fetchCity()
    } catch {
      error.value = 'Failed to generate city info. Please try again.'
    } finally {
      generating.value = false
    }
  }

  onMounted(fetchCity)

  return {
    city, loading, error, generating,
    isAuthenticated,
    showChallengeModal, selectedChallengeId, selectedChallenge,
    normalizedProblems, breakdown,
    openChallenge, extractDomain, generate
  }
}
