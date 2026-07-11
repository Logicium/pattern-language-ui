import { ref, computed, watch } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'
import { useAuthStore } from '@/stores/auth'
import { useRouteTab } from '@/composables/useRouteTab'
import { useRoutePage } from '@/composables/useRoutePage'
import { usePatterns } from '@/composables/usePatterns'
import { useStories } from '@/composables/useStories'
import { useChallenges } from '@/composables/useChallenges'
import { useResources } from '@/composables/useResources'
import { normalizeStateCode, stateFromLocation } from '@/utils/states'

export type ResourceTab = 'patterns' | 'stories' | 'challenges' | 'local' | 'national' | 'all'
export type ResourceType = 'pattern' | 'story' | 'challenge' | 'link'

export const LINK_TABS: ResourceTab[] = ['local', 'national', 'all']

const RESOURCE_TABS: readonly ResourceTab[] = ['patterns', 'stories', 'challenges', 'local', 'national', 'all']

export function useResourcesPage() {
  const { patterns: allPatterns } = usePatterns()
  const { stories: allStories } = useStories()
  const { challenges: allChallenges } = useChallenges()
  const { resources: allLinks } = useResources()
  const playbooksStore = usePlaybooksStore()

  const activeTab = useRouteTab<ResourceTab>(RESOURCE_TABS, 'patterns')
  const currentPage = useRoutePage()
  const searchQuery = ref('')
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

  const authStore = useAuthStore()

  // Local = town/county/state-level resources for the user's own state.
  // Everything is compared as normalized 2-letter codes — never substrings,
  // and tolerant of "Trinidad Colorado"-style freeform profile values.
  const userStateCode = computed(() =>
    normalizeStateCode(authStore.user?.state) ?? stateFromLocation(authStore.user?.location)
  )

  const linkStateCode = (l: any): string | null =>
    normalizeStateCode(l.state) ?? stateFromLocation(l.location)

  const isLocalLink = (l: any) => {
    if (l.scope === 'national') return false
    const linkState = linkStateCode(l)
    if (!linkState || !userStateCode.value) return false
    return linkState === userStateCode.value
  }

  const isNationalLink = (l: any) =>
    l.scope === 'national' ||
    (!l.scope && (l.category === 'Federal Resource' || l.category === 'Pattern Language Resource'))

  const localLinks = computed(() => filteredLinks.value.filter(isLocalLink))
  const nationalLinks = computed(() => filteredLinks.value.filter(isNationalLink))

  const tabCounts = computed(() => ({
    patterns: filteredPatterns.value.length,
    stories: filteredStories.value.length,
    challenges: filteredChallenges.value.length,
    local: localLinks.value.length,
    national: nationalLinks.value.length,
    all: filteredLinks.value.length,
  }))

  const currentFilteredItems = computed(() => {
    switch (activeTab.value) {
      case 'patterns': return filteredPatterns.value
      case 'stories': return filteredStories.value
      case 'challenges': return filteredChallenges.value
      case 'local': return localLinks.value
      case 'national': return nationalLinks.value
      case 'all': return filteredLinks.value
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
