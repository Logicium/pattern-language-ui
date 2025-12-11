import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pattern } from '@/types'
import { playbooksApi } from '@/services/api'

export interface PlaybookTask {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string | null
  completedDate: string | null
}

export interface Playbook {
  id: string
  patternId: number
  patternTitle: string
  challenge: string
  solution: string
  location: string
  status: 'active' | 'completed' | 'paused'
  progress: number // 0-100
  startDate: string
  targetCompletionDate: string
  completedDate: string | null
  tasks: PlaybookTask[]
  resources: Array<{ type: 'pattern' | 'story' | 'challenge' | 'link'; id: number; title: string; url?: string }>
  notes: string
}

export const usePlaybooksStore = defineStore('playbooks', () => {
  // State
  const playbooks = ref<Playbook[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)

  // Load from localStorage on store creation
  const stored = localStorage.getItem('playbooks')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      playbooks.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
    } catch (e) {
      console.error('Failed to parse stored playbooks:', e)
      localStorage.removeItem('playbooks')
    }
  }

  // API Fetch Functions
  async function fetchPlaybooks(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (playbooks.value.length > 0 && !forceRefresh) {
      // Return existing data immediately, but fetch in background
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await playbooksApi.getAll()
      playbooks.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('playbooks', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch playbooks'
      console.error('Error fetching playbooks:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await playbooksApi.getAll()
      playbooks.value = data
      lastFetched.value = Date.now()
      
      // Persist to localStorage
      localStorage.setItem('playbooks', JSON.stringify({
        data,
        timestamp: lastFetched.value
      }))
    } catch (e) {
      console.error('Background fetch failed:', e)
      // Silently fail - we already have data
    }
  }

  function getPlaybookById(id: string): Playbook | undefined {
    return playbooks.value.find(p => p.id === id)
  }

  function clearCache() {
    playbooks.value = []
    lastFetched.value = null
    localStorage.removeItem('playbooks')
  }

  // Computed
  const activePlaybooks = computed(() =>
    playbooks.value.filter((p) => p.status === 'active')
  )

  const completedPlaybooks = computed(() =>
    playbooks.value.filter((p) => p.status === 'completed')
  )

  const pausedPlaybooks = computed(() =>
    playbooks.value.filter((p) => p.status === 'paused')
  )

  // Local Actions (keep existing functionality)
  function saveToLocalStorage() {
    localStorage.setItem('playbooks', JSON.stringify({
      data: playbooks.value,
      timestamp: lastFetched.value
    }))
  }
  
  async function addPlaybook(playbook: Omit<Playbook, 'id'>) {
    loading.value = true
    error.value = null
    
    try {
      // Send to backend
      const newPlaybook = await playbooksApi.createFromGenerated(playbook)
      
      // Add to local store
      playbooks.value.push(newPlaybook)
      saveToLocalStorage()
      
      return newPlaybook
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add playbook'
      console.error('Error adding playbook:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function updatePlaybook(id: string, updates: Partial<Playbook>) {
    const playbook = playbooks.value.find((p) => p.id === id)
    if (!playbook) return
    
    Object.assign(playbook, updates)
    
    // Recalculate progress based on completed tasks
    const completedTasks = playbook.tasks.filter(t => t.completed).length
    playbook.progress = Math.round((completedTasks / playbook.tasks.length) * 100)
    
    // Auto-complete playbook if all tasks done
    if (playbook.progress === 100 && playbook.status === 'active') {
      playbook.status = 'completed'
      const today = new Date().toISOString().split('T')[0]
      if (today) playbook.completedDate = today
    }
    
    saveToLocalStorage()
  }

  function deletePlaybook(id: string) {
    playbooks.value = playbooks.value.filter((p) => p.id !== id)
    saveToLocalStorage()
  }

  function toggleTaskCompletion(playbookId: string, taskId: string) {
    const playbook = playbooks.value.find((p) => p.id === playbookId)
    if (playbook) {
      const task = playbook.tasks.find((t) => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        const today = new Date().toISOString().split('T')[0]
        if (today) task.completedDate = task.completed ? today : null
        
        // Recalculate progress
        const completedTasks = playbook.tasks.filter(t => t.completed).length
        playbook.progress = Math.round((completedTasks / playbook.tasks.length) * 100)
        
        // Auto-complete playbook if all tasks done
        if (playbook.progress === 100 && playbook.status === 'active') {
          playbook.status = 'completed'
          if (today) playbook.completedDate = today
        }
        
        saveToLocalStorage()
      }
    }
  }

  function addResourceToPlaybook(playbookId: string, resource: { type: 'pattern' | 'story' | 'challenge' | 'link'; id: number; title: string; url?: string }) {
    const playbook = playbooks.value.find((p) => p.id === playbookId)
    if (playbook) {
      // Check if resource already exists
      const exists = playbook.resources.some(r => r.type === resource.type && r.id === resource.id)
      if (!exists) {
        playbook.resources.push(resource)
        saveToLocalStorage()
      }
    }
  }

  function updatePlaybookNotes(playbookId: string, notes: string) {
    const playbook = playbooks.value.find((p) => p.id === playbookId)
    if (playbook) {
      playbook.notes = notes
      saveToLocalStorage()
    }
  }

  return {
    playbooks,
    loading,
    error,
    lastFetched,
    activePlaybooks,
    completedPlaybooks,
    pausedPlaybooks,
    fetchPlaybooks,
    getPlaybookById,
    clearCache,
    addPlaybook,
    updatePlaybook,
    deletePlaybook,
    toggleTaskCompletion,
    addResourceToPlaybook,
    updatePlaybookNotes
  }
})
