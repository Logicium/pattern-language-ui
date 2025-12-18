import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserStory } from '@/types'
import { userStoriesApi } from '@/services/api'

export const useUserStoriesStore = defineStore('userStories', () => {
  const userStories = ref<UserStory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Load from localStorage on store creation
  const stored = localStorage.getItem('userStories')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      userStories.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
    } catch (e) {
      console.error('Failed to parse stored user stories:', e)
      localStorage.removeItem('userStories')
    }
  }

  async function fetchUserStories(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (userStories.value.length > 0 && !forceRefresh) {
      // Return existing data immediately, but fetch in background
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await userStoriesApi.getAll()
      userStories.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('userStories', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch user stories'
      console.error('Error fetching user stories:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await userStoriesApi.getAll()
      userStories.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('userStories', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      console.error('Background fetch failed:', e)
      // Silently fail - we already have data
    }
  }

  async function createUserStory(data: { 
    title: string
    problem: string
    solution: string
    story?: string
    patterns?: string[]
    location?: string
    color?: string
    image?: string
    published?: boolean 
  }) {
    loading.value = true
    error.value = null
    
    try {
      const newStory = await userStoriesApi.create({
        title: data.title,
        problem: data.problem,
        solution: data.solution,
        story: data.story,
        patterns: data.patterns || [],
        location: data.location,
        color: data.color,
        image: data.image,
        published: data.published || false
      })
      
      // Add to local store
      userStories.value.push(newStory)
      
      // Persist to localStorage
      saveToLocalStorage()
      
      return newStory
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create user story'
      console.error('Error creating user story:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateUserStory(id: number, updates: Partial<UserStory>) {
    loading.value = true
    error.value = null
    
    try {
      const updated = await userStoriesApi.update(id, updates)
      
      // Update in local store
      const index = userStories.value.findIndex(s => s.id === id)
      if (index !== -1) {
        userStories.value[index] = { ...userStories.value[index], ...updated }
      }
      
      // Persist to localStorage
      saveToLocalStorage()
      
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update user story'
      console.error('Error updating user story:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteUserStory(id: number) {
    loading.value = true
    error.value = null
    
    try {
      await userStoriesApi.delete(id)
      
      // Remove from local store
      userStories.value = userStories.value.filter(s => s.id !== id)
      
      // Persist to localStorage
      saveToLocalStorage()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete user story'
      console.error('Error deleting user story:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getUserStoryById(id: number): UserStory | undefined {
    return userStories.value.find(s => s.id === id)
  }

  function clearCache() {
    userStories.value = []
    lastFetched.value = null
    localStorage.removeItem('userStories')
  }

  function saveToLocalStorage() {
    localStorage.setItem('userStories', JSON.stringify({
      data: userStories.value,
      timestamp: lastFetched.value
    }))
  }

  // Computed
  const publishedStories = computed(() =>
    userStories.value.filter(s => s.published)
  )

  const draftStories = computed(() =>
    userStories.value.filter(s => !s.published)
  )

  return {
    userStories,
    loading,
    error,
    lastFetched,
    publishedStories,
    draftStories,
    fetchUserStories,
    createUserStory,
    updateUserStory,
    deleteUserStory,
    getUserStoryById,
    clearCache
  }
})
