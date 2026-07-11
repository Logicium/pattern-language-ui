import { ref, computed, watch, onMounted } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'
import { playbooksApi } from '@/services/api'
import { useRouteTab } from '@/composables/useRouteTab'

export type PlaybooksTab = 'active' | 'completed' | 'local' | 'all'

const PLAYBOOKS_TABS: readonly PlaybooksTab[] = ['active', 'completed', 'local', 'all']

// Session key remembering the list tab, so a playbook's back button can
// return to the exact tab the user browsed last.
export const PLAYBOOKS_LAST_TAB_KEY = 'playbooks-last-tab'

export function usePlaybooksPage() {
  const playbooksStore = usePlaybooksStore()

  const activeTab = useRouteTab<PlaybooksTab>(PLAYBOOKS_TABS, 'active')

  watch(activeTab, tab => sessionStorage.setItem(PLAYBOOKS_LAST_TAB_KEY, tab), { immediate: true })
  const localPlaybooks = ref<any[]>([])
  const allPublishedPlaybooks = ref<any[]>([])

  const activePlaybooks = computed(() => playbooksStore.activePlaybooks)
  const completedPlaybooks = computed(() => playbooksStore.completedPlaybooks)

  const loadLocalPlaybooks = async () => {
    try {
      localPlaybooks.value = await playbooksApi.getLocalPublished()
    } catch (error) {
      console.error('Failed to load local playbooks:', error)
      localPlaybooks.value = []
    }
  }

  const loadAllPublishedPlaybooks = async () => {
    try {
      allPublishedPlaybooks.value = await playbooksApi.getAllPublished()
    } catch (error) {
      console.error('Failed to load all published playbooks:', error)
      allPublishedPlaybooks.value = []
    }
  }

  onMounted(() => {
    playbooksStore.fetchPlaybooks()
    loadLocalPlaybooks()
    loadAllPublishedPlaybooks()
  })

  const filteredPlaybooks = computed(() => {
    switch (activeTab.value) {
      case 'active': return activePlaybooks.value
      case 'completed': return completedPlaybooks.value
      case 'local': return localPlaybooks.value
      case 'all': return allPublishedPlaybooks.value
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
    activeTab, localPlaybooks, allPublishedPlaybooks,
    activePlaybooks, completedPlaybooks,
    filteredPlaybooks, completedTasksCount, formatDate
  }
}
