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

  const loadPublicPlaybook = async () => {
    try {
      loading.value = true
      allLocalPlaybooks.value = await playbooksApi.getLocalPublished()
      const foundPlaybook = allLocalPlaybooks.value.find(p => p.id.toString() === playbookId.value)
      if (foundPlaybook) {
        localPlaybookData.value = foundPlaybook
      }
    } catch (error) {
      console.error('Failed to load public playbook:', error)
    } finally {
      loading.value = false
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

  const togglePause = () => {
    if (playbook.value) {
      const newStatus = playbook.value.status === 'paused' ? 'active' : 'paused'
      playbooksStore.updatePlaybook(playbook.value.id, {
        status: newStatus as 'active' | 'paused'
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
  onMounted(async () => {
    await playbooksStore.fetchPlaybooks(true)
    const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === playbookId.value)
    if (!userPlaybook) {
      await loadPublicPlaybook()
    }
    loadMembers()
  })

  watch(() => route.params.id, async (newId) => {
    if (newId) {
      localPlaybookData.value = null
      const userPlaybook = playbooksStore.playbooks.find(p => p.id.toString() === newId)
      if (!userPlaybook) {
        await loadPublicPlaybook()
      }
      loadMembers()
    }
  })

  watch(() => playbook.value?.id, (newId) => {
    if (newId) {
      loadMembers()
    }
  })

  return {
    loading,
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
    togglePause,
    generateSuccessStory,
    handleDelete,
    refreshPlaybook,
    loadMembers,
    playbooksStore,
    authStore,
  }
}
