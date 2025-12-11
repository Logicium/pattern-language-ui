import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Challenge } from '@/types'
import { challengesApi } from '@/services/api'

export const useChallengesStore = defineStore('challenges', () => {
  const challenges = ref<Challenge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Load from localStorage on store creation
  const stored = localStorage.getItem('challenges')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      challenges.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
    } catch (e) {
      console.error('Failed to parse stored challenges:', e)
      localStorage.removeItem('challenges')
    }
  }

  async function fetchChallenges(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (challenges.value.length > 0 && !forceRefresh) {
      // Return existing data immediately, but fetch in background
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await challengesApi.getAll()
      challenges.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('challenges', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch challenges'
      console.error('Error fetching challenges:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await challengesApi.getAll()
      challenges.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('challenges', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      console.error('Background fetch failed:', e)
      // Silently fail - we already have data
    }
  }

  async function searchChallenges(query: string) {
    loading.value = true
    error.value = null
    
    try {
      const data = await challengesApi.search(query)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to search challenges'
      console.error('Error searching challenges:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  function getChallengeById(id: number): Challenge | undefined {
    return challenges.value.find(c => c.id === id)
  }

  function clearCache() {
    challenges.value = []
    lastFetched.value = null
    localStorage.removeItem('challenges')
  }

  return {
    challenges,
    loading,
    error,
    lastFetched,
    fetchChallenges,
    searchChallenges,
    getChallengeById,
    clearCache
  }
})
