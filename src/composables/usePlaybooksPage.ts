import { ref, computed, onMounted } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'
import { playbooksApi } from '@/services/api'

export type PlaybooksTab = 'active' | 'completed' | 'paused' | 'local'

export function usePlaybooksPage() {
  const playbooksStore = usePlaybooksStore()

  const activeTab = ref<PlaybooksTab>('active')
  const localPlaybooks = ref<any[]>([])

  const activePlaybooks = computed(() => playbooksStore.activePlaybooks)
  const completedPlaybooks = computed(() => playbooksStore.completedPlaybooks)
  const pausedPlaybooks = computed(() => playbooksStore.pausedPlaybooks)

  const loadLocalPlaybooks = async () => {
    try {
      localPlaybooks.value = await playbooksApi.getLocalPublished()
    } catch (error) {
      console.error('Failed to load local playbooks:', error)
      localPlaybooks.value = []
    }
  }

  onMounted(() => {
    playbooksStore.fetchPlaybooks()
    loadLocalPlaybooks()
  })

  const filteredPlaybooks = computed(() => {
    switch (activeTab.value) {
      case 'active': return activePlaybooks.value
      case 'completed': return completedPlaybooks.value
      case 'paused': return pausedPlaybooks.value
      case 'local': return localPlaybooks.value
      default: return []
    }
  })

  const completedTasksCount = (playbook: any) => {
    return playbook.tasks.filter((t: any) => t.completed).length
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(date)
  }

  return {
    activeTab, localPlaybooks,
    activePlaybooks, completedPlaybooks, pausedPlaybooks,
    filteredPlaybooks, completedTasksCount, formatDate
  }
}
