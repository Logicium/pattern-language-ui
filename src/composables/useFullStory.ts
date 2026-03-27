import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStories } from '@/composables/useStories'
import { usePatterns } from '@/composables/usePatterns'

export function useFullStory() {
  const { stories: allStories, fetchStories } = useStories()
  const { patterns: allPatterns } = usePatterns()
  const route = useRoute()

  const storyId = computed(() => Number(route.params.id))

  onMounted(async () => {
    await fetchStories(true)
  })

  const story = computed(() =>
    allStories.value.find(s => s.id === storyId.value)
  )

  const relatedStories = computed(() => {
    if (!story.value) return []
    return allStories.value.filter(s =>
      s.id !== story.value!.id &&
      s.patterns.some((p: string) => story.value!.patterns.includes(p))
    ).slice(0, 3)
  })

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getPatternRoute = (title: string) => {
    const pattern = allPatterns.value.find(p =>
      p.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(p.title.toLowerCase())
    )
    return pattern ? `/patterns/${pattern.id}` : '/patterns'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return { story, relatedStories, extractDomain, getPatternRoute, formatDate }
}
