import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Link } from '@/types'
import { resourcesApi } from '@/services/api'

export const useResourcesStore = defineStore('resources', () => {
  const resources = ref<Link[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Load from localStorage on store creation
  const stored = localStorage.getItem('resources')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      resources.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
    } catch (e) {
      console.error('Failed to parse stored resources:', e)
      localStorage.removeItem('resources')
    }
  }

  async function fetchResources(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (resources.value.length > 0 && !forceRefresh) {
      // Return existing data immediately, but fetch in background
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await resourcesApi.getAll()
      resources.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('resources', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch resources'
      console.error('Error fetching resources:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await resourcesApi.getAll()
      resources.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('resources', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      console.error('Background fetch failed:', e)
      // Silently fail - we already have data
    }
  }

  async function searchResources(query: string) {
    loading.value = true
    error.value = null
    
    try {
      const data = await resourcesApi.search(query)
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to search resources'
      console.error('Error searching resources:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  function getResourceById(id: number): Link | undefined {
    return resources.value.find(r => r.id === id)
  }

  function clearCache() {
    resources.value = []
    lastFetched.value = null
    localStorage.removeItem('resources')
  }

  return {
    resources,
    loading,
    error,
    lastFetched,
    fetchResources,
    searchResources,
    getResourceById,
    clearCache
  }
})
