import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePatterns } from '@/composables/usePatterns'
import { useStories } from '@/composables/useStories'
import { useChallenges } from '@/composables/useChallenges'

export function useFullPattern(patternData?: any) {
  const { patterns: allPatterns } = usePatterns()
  const { stories: allStories } = useStories()
  const { challenges: allChallenges } = useChallenges()
  const route = useRoute()

  const patternId = computed(() => patternData?.id || Number(route.params.id))

  const pattern = computed(() =>
    patternData || allPatterns.value.find(p => p.id === patternId.value)
  )

  const relatedStories = computed(() => {
    if (!pattern.value) return []
    const patternTitle = pattern.value.title.toLowerCase()
    return allStories.value.filter(story =>
      story.patterns.some((p: string) => p.toLowerCase() === patternTitle)
    ).slice(0, 3)
  })

  const getPatternRoute = (title: string) => {
    const relatedPattern = allPatterns.value.find(p =>
      p.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(p.title.toLowerCase())
    )
    return relatedPattern ? `/patterns/${relatedPattern.id}` : '/patterns'
  }

  const getChallengeRoute = (title: string) => {
    const challenge = allChallenges.value.find(c =>
      c.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(c.title.toLowerCase())
    )
    return challenge ? `/challenges/${challenge.id}` : '/patterns'
  }

  return { pattern, relatedStories, getPatternRoute, getChallengeRoute }
}
