import { ref, computed, watch } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'
import { usePatterns } from '@/composables/usePatterns'
import { useStories } from '@/composables/useStories'
import { useChallenges } from '@/composables/useChallenges'
import { useResources } from '@/composables/useResources'

export type ResourceTab = 'patterns' | 'stories' | 'challenges' | 'links'
export type ResourceType = 'pattern' | 'story' | 'challenge' | 'link'

export function useResourcesPage() {
  const { patterns: allPatterns } = usePatterns()
  const { stories: allStories } = useStories()
  const { challenges: allChallenges } = useChallenges()
  const { resources: allLinks } = useResources()
  const playbooksStore = usePlaybooksStore()

  const activeTab = ref<ResourceTab>('patterns')
  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const showAddModal = ref(false)
  const selectedResource = ref<any>(null)
  const selectedResourceType = ref<ResourceType>('pattern')

  const activePlaybooks = computed(() => playbooksStore.activePlaybooks)

  watch([activeTab, searchQuery], () => { currentPage.value = 1 })

  const filteredPatterns = computed(() => {
    if (!searchQuery.value) return allPatterns.value
    const query = searchQuery.value.toLowerCase()
    return allPatterns.value.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.addresses.some(a => a.toLowerCase().includes(query))
    )
  })

  const filteredStories = computed(() => {
    if (!searchQuery.value) return allStories.value
    const query = searchQuery.value.toLowerCase()
    return allStories.value.filter(s =>
      s.title.toLowerCase().includes(query) ||
      (s.excerpt && s.excerpt.toLowerCase().includes(query)) ||
      s.problem.toLowerCase().includes(query) ||
      s.location.toLowerCase().includes(query)
    )
  })

  const filteredChallenges = computed(() => {
    if (!searchQuery.value) return allChallenges.value
    const query = searchQuery.value.toLowerCase()
    return allChallenges.value.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.context.toLowerCase().includes(query)
    )
  })

  const filteredLinks = computed(() => {
    if (!searchQuery.value) return allLinks.value
    const query = searchQuery.value.toLowerCase()
    return allLinks.value.filter(l =>
      l.name.toLowerCase().includes(query) ||
      l.location.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query)
    )
  })

  const tabCounts = computed(() => ({
    patterns: filteredPatterns.value.length,
    stories: filteredStories.value.length,
    challenges: filteredChallenges.value.length,
    links: filteredLinks.value.length,
  }))

  const currentFilteredItems = computed(() => {
    switch (activeTab.value) {
      case 'patterns': return filteredPatterns.value
      case 'stories': return filteredStories.value
      case 'challenges': return filteredChallenges.value
      case 'links': return filteredLinks.value
    }
  })

  const currentPaginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return currentFilteredItems.value.slice(start, start + itemsPerPage.value)
  })

  const addToPlaybook = (resource: any, type: ResourceType) => {
    selectedResource.value = resource
    selectedResourceType.value = type
    showAddModal.value = true
  }

  const selectPlaybook = (playbookId: string | number) => {
    if (selectedResource.value) {
      const resource: any = {
        type: selectedResourceType.value,
        id: selectedResource.value.id,
        title: selectedResourceType.value === 'link' ? selectedResource.value.name : selectedResource.value.title
      }
      if (selectedResourceType.value === 'link') {
        resource.url = selectedResource.value.url
      }
      playbooksStore.addResourceToPlaybook(playbookId, resource)
      closeModal()
    }
  }

  const closeModal = () => {
    showAddModal.value = false
    selectedResource.value = null
  }

  return {
    activeTab, searchQuery, currentPage, itemsPerPage,
    tabCounts, currentFilteredItems, currentPaginatedItems,
    showAddModal, selectedResource, selectedResourceType, activePlaybooks,
    addToPlaybook, selectPlaybook, closeModal
  }
}
