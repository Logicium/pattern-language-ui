import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { useAuthStore } from '@/stores/auth'
import { useChallenges } from '@/composables/useChallenges'
import { usePatterns } from '@/composables/usePatterns'
import { userStoriesApi, playbooksApi } from '@/services/api'
import type { PlaybookMember } from '@/types/collaboration'

export function usePlaybookData() {
  const route = useRoute()
  const router = useRouter()
  const playbooksStore = usePlaybooksStore()
  const authStore = useAuthStore()
  const { challenges: allChallenges } = useChallenges()
  const { patterns: allPatterns } = usePatterns()

  const loading = ref(false)
  // Page-level load lifecycle: spinner while true, error message when set,
  // "not found" only when neither applies and no playbook matched.
  const pageLoading = ref(true)
  const loadError = ref<string | null>(null)
  const localPlaybookData = ref<any>(null)
  const allLocalPlaybooks = ref<any[]>([])
  const members = ref<PlaybookMember[]>([])
  const showToast = ref(false)
  const toastMessage = ref('')
  const isGenerating = ref(false)

  const playbookId = computed(() => route.params.id as string)

  const playbook = computed(() => {
    const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === playbookId.value)
    if (userPlaybook) return userPlaybook
    return localPlaybookData.value
  })

  const userRole = computed(() => {
    if (!authStore.user || !playbook.value) return null
    const member = members.value.find(m => String(m.user.id) === String(authStore.user?.id))
    return member?.role || null
  })

  const isUserMember = computed(() => {
    if (!authStore.user || !playbook.value) return false
    return members.value.some(m => String(m.user.id) === String(authStore.user?.id))
  })

  const completedTasksCount = computed(() => {
    if (!playbook.value) return 0
    return playbook.value.tasks.filter((t: any) => t.completed).length
  })

  // Throws on API failure so the caller can distinguish "failed to load"
  // from "loaded fine but no such playbook".
  const loadPublicPlaybook = async () => {
    // Any published playbook (not just local ones) can be viewed
    allLocalPlaybooks.value = await playbooksApi.getAllPublished()
    const foundPlaybook = allLocalPlaybooks.value.find(p => p.id.toString() === playbookId.value)
    if (foundPlaybook) {
      localPlaybookData.value = foundPlaybook
    }
  }

  const loadPlaybook = async () => {
    pageLoading.value = true
    loadError.value = null
    localPlaybookData.value = null
    try {
      await playbooksStore.fetchPlaybooks(true)
      if (playbooksStore.error) {
        throw new Error(playbooksStore.error)
      }
      const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === playbookId.value)
      if (!userPlaybook) {
        await loadPublicPlaybook()
      }
      loadMembers()
    } catch (error: any) {
      console.error('Failed to load playbook:', error)
      loadError.value = error?.message || 'Failed to load playbook'
    } finally {
      pageLoading.value = false
    }
  }

  const loadMembers = async () => {
    if (!playbook.value || typeof playbook.value.id !== 'number') return
    try {
      members.value = await playbooksApi.getMembers(playbook.value.id)
    } catch (error) {
      console.error('Failed to load members:', error)
      members.value = []
    }
  }

  const refreshPlaybook = async () => {
    await playbooksStore.fetchPlaybooks()
    await loadMembers()
  }

  // Actions
  const markComplete = () => {
    if (playbook.value) {
      playbooksStore.updatePlaybook(playbook.value.id, {
        status: 'completed',
        completedDate: new Date().toISOString().split('T')[0]
      })
    }
  }

  const generateSuccessStory = async () => {
    if (!playbook.value || typeof playbook.value.id !== 'number') return
    isGenerating.value = true
    try {
      const story = await userStoriesApi.generateFromPlaybook(playbook.value.id)
      toastMessage.value = 'Success story generated!'
      showToast.value = true
      setTimeout(() => {
        router.push(`/dashboard/success-stories/${story.id}`)
      }, 1000)
    } catch (error) {
      console.error('Failed to generate success story:', error)
      toastMessage.value = 'Failed to generate success story'
      showToast.value = true
    } finally {
      isGenerating.value = false
    }
  }

  const handleDelete = () => {
    if (playbook.value) {
      playbooksStore.deletePlaybook(playbook.value.id)
      router.push('/dashboard/playbooks')
    }
  }

  // Pattern & Challenge modals
  const showPatternModal = ref(false)
  const showChallengeModal = ref(false)
  const selectedPattern = ref<any>(null)
  const selectedChallenge = ref<any>(null)

  const openPatternModal = (patternId: number) => {
    selectedPattern.value = allPatterns.value.find(p => p.id === patternId)
    if (selectedPattern.value) {
      showPatternModal.value = true
    }
  }

  const openChallengeModal = (challengeId: number) => {
    selectedChallenge.value = allChallenges.value.find(c => c.id === challengeId)
    if (selectedChallenge.value) {
      showChallengeModal.value = true
    }
  }

  // Lifecycle
  onMounted(loadPlaybook)

  watch(() => route.params.id, async (newId) => {
    if (newId) {
      await loadPlaybook()
    }
  })

  watch(() => playbook.value?.id, (newId) => {
    if (newId) {
      loadMembers()
    }
  })

  return {
    loading,
    pageLoading,
    loadError,
    loadPlaybook,
    playbook,
    playbookId,
    members,
    userRole,
    isUserMember,
    completedTasksCount,
    showToast,
    toastMessage,
    isGenerating,
    showPatternModal,
    showChallengeModal,
    selectedPattern,
    selectedChallenge,
    openPatternModal,
    openChallengeModal,
    markComplete,
    generateSuccessStory,
    handleDelete,
    refreshPlaybook,
    loadMembers,
    playbooksStore,
    authStore,
  }
}
