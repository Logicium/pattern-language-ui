import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlaybooksStore } from '@/stores/playbooks'
import { userStoriesApi } from '@/services/api'

export type StoriesTab = 'drafts' | 'published' | 'completed'

export function useDashboardStories() {
  const router = useRouter()
  const playbooksStore = usePlaybooksStore()

  const activeTab = ref<StoriesTab>('drafts')
  const userStories = ref<any[]>([])
  const isGenerating = ref<Record<number | string, boolean>>({})
  const showToast = ref(false)
  const toastMessage = ref('')

  onMounted(async () => {
    playbooksStore.fetchPlaybooks()
    try {
      userStories.value = await userStoriesApi.getAll()
    } catch (error) {
      console.error('Failed to fetch user stories:', error)
    }
  })

  const completedPlaybooks = computed(() => playbooksStore.completedPlaybooks)
  const draftStories = computed(() => userStories.value.filter(s => !s.published))
  const publishedStories = computed(() => userStories.value.filter(s => s.published))

  const generateStory = async (playbookId: number | string) => {
    if (typeof playbookId !== 'number') return

    isGenerating.value[playbookId] = true
    try {
      const story = await userStoriesApi.generateFromPlaybook(playbookId)
      toastMessage.value = 'Success story generated!'
      showToast.value = true
      userStories.value = await userStoriesApi.getAll()
      activeTab.value = 'drafts'
      setTimeout(() => {
        router.push(`/dashboard/success-stories/${story.id}`)
      }, 1000)
    } catch (error) {
      console.error('Failed to generate success story:', error)
      toastMessage.value = 'Failed to generate success story'
      showToast.value = true
    } finally {
      isGenerating.value[playbookId] = false
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getDuration = (playbook: any) => {
    const start = new Date(playbook.startDate)
    const end = new Date(playbook.completedDate!)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 30) return `${diffDays}d`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`
    return `${Math.floor(diffDays / 365)}y`
  }

  return {
    activeTab, draftStories, publishedStories, completedPlaybooks,
    isGenerating, showToast, toastMessage,
    generateStory, formatDate, getDuration
  }
}
