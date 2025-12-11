import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CaseStudy } from '@/types'
import { storiesApi } from '@/services/api'

export const useStoriesStore = defineStore('stories', () => {
  const stories = ref<CaseStudy[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Load from localStorage on store creation
  const stored = localStorage.getItem('stories')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      stories.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
    } catch (e) {
      console.error('Failed to parse stored stories:', e)
      localStorage.removeItem('stories')
    }
  }

  async function fetchStories(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (stories.value.length > 0 && !forceRefresh) {
      // Return existing data immediately, but fetch in background
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await storiesApi.getAll()
      stories.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('stories', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch stories'
      console.error('Error fetching stories:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await storiesApi.getAll()
      stories.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('stories', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      console.error('Background fetch failed:', e)
      // Silently fail - we already have data
    }
  }

  async function searchStories(query: string) {
    loading.value = true
    error.value = null
    
    try {
      const data = await storiesApi.search(query)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to search stories'
      console.error('Error searching stories:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  function getStoryById(id: number): CaseStudy | undefined {
    return stories.value.find(s => s.id === id)
  }

  function clearCache() {
    stories.value = []
    lastFetched.value = null
    localStorage.removeItem('stories')
  }

  return {
    stories,
    loading,
    error,
    lastFetched,
    fetchStories,
    searchStories,
    getStoryById,
    clearCache
  }
})
