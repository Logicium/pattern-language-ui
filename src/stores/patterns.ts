import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Pattern } from '@/types'
import { patternsApi } from '@/services/api'

export const usePatternsStore = defineStore('patterns', () => {
  const patterns = ref<Pattern[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Load from localStorage on store creation
  const stored = localStorage.getItem('patterns')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      patterns.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
    } catch (e) {
      console.error('Failed to parse stored patterns:', e)
      localStorage.removeItem('patterns')
    }
  }

  async function fetchPatterns(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (patterns.value.length > 0 && !forceRefresh) {
      // Return existing data immediately, but fetch in background
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await patternsApi.getAll()
      patterns.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('patterns', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch patterns'
      console.error('Error fetching patterns:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await patternsApi.getAll()
      patterns.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('patterns', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      console.error('Background fetch failed:', e)
      // Silently fail - we already have data
    }
  }

  async function searchPatterns(query: string) {
    loading.value = true
    error.value = null
    
    try {
      const data = await patternsApi.search(query)
      // Don't update the main store for search results
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to search patterns'
      console.error('Error searching patterns:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  function getPatternById(id: number): Pattern | undefined {
    return patterns.value.find(p => p.id === id)
  }

  function clearCache() {
    patterns.value = []
    lastFetched.value = null
    localStorage.removeItem('patterns')
  }

  return {
    patterns,
    loading,
    error,
    lastFetched,
    fetchPatterns,
    searchPatterns,
    getPatternById,
    clearCache
  }
})
