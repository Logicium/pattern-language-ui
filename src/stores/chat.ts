import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatApi } from '@/services/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: number
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<ChatSession[]>([])
  const currentSessionId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<number | null>(null)
  const isTyping = ref(false)
  const typingContent = ref('')

  // Load from localStorage on store creation
  const stored = localStorage.getItem('chatSessions')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      sessions.value = parsed.data || []
      lastFetched.value = parsed.timestamp || null
      
      // Convert timestamp strings back to Date objects
      sessions.value.forEach(session => {
        session.messages.forEach(msg => {
          if (typeof msg.timestamp === 'string') {
            msg.timestamp = new Date(msg.timestamp)
          }
        })
      })
    } catch (e) {
      console.error('Failed to parse stored chat sessions:', e)
      localStorage.removeItem('chatSessions')
    }
  }

  // Computed
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null
    return sessions.value.find(s => s.id === currentSessionId.value)
  })

  const currentMessages = computed(() => {
    return currentSession.value?.messages || []
  })

  // API Functions
  async function fetchSessions(forceRefresh = false) {
    // If we have data and not forcing refresh, return immediately and fetch in background
    if (sessions.value.length > 0 && !forceRefresh) {
      fetchInBackground()
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const data = await chatApi.getAll()
      
      // Transform the data to ensure messages have proper format
      sessions.value = data.map((session: any) => ({
        ...session,
        messages: Array.isArray(session.messages) 
          ? session.messages.map((msg: any) => {
              // Handle both number IDs (references) and full message objects
              if (typeof msg === 'number') {
                return null // Skip numeric references
              }
              return {
                id: msg.id?.toString() || `msg_${Date.now()}`,
                role: msg.role || 'assistant',
                content: msg.content || '',
                timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
              }
            }).filter(Boolean) // Remove null entries
          : []
      }))
      
      lastFetched.value = Date.now()
      
      saveToLocalStorage()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch chat sessions'
      console.error('Error fetching chat sessions:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchInBackground() {
    try {
      const data = await chatApi.getAll()
      
      // Transform the data to ensure messages have proper format
      sessions.value = data.map((session: any) => ({
        ...session,
        messages: Array.isArray(session.messages) 
          ? session.messages.map((msg: any) => {
              // Handle both number IDs (references) and full message objects
              if (typeof msg === 'number') {
                return null // Skip numeric references
              }
              return {
                id: msg.id?.toString() || `msg_${Date.now()}`,
                role: msg.role || 'assistant',
                content: msg.content || '',
                timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
              }
            }).filter(Boolean) // Remove null entries
          : []
      }))
      
      lastFetched.value = Date.now()
      
      saveToLocalStorage()
    } catch (e) {
      console.error('Background fetch failed:', e)
    }
  }

  async function createSession(title?: string) {
    loading.value = true
    error.value = null
    
    try {
      const newSession = await chatApi.create({ title })
      
      // Add messages array if not present
      if (!newSession.messages) {
        newSession.messages = []
      }
      
      sessions.value.unshift(newSession)
      currentSessionId.value = newSession.id
      
      saveToLocalStorage()
      
      return newSession
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create chat session'
      console.error('Error creating chat session:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(message: string) {
    if (!currentSessionId.value) {
      // Create a new session if none exists
      await createSession()
    }

    if (!currentSessionId.value) {
      throw new Error('No active chat session')
    }

    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) {
      throw new Error('Session not found')
    }

    loading.value = true
    error.value = null
    
    try {
      // Send to backend - it returns both user and assistant messages
      const response = await chatApi.sendMessage(currentSessionId.value, message)
      
      // Backend returns: { userMessage: {...}, assistantMessage: {...} }
      // Extract the assistant message content
      let assistantContent = ''
      
      if (response.assistantMessage && response.assistantMessage.content) {
        assistantContent = response.assistantMessage.content
      } else if (response.content) {
        assistantContent = response.content
      } else if (response.message) {
        assistantContent = response.message
      } else if (typeof response === 'string') {
        assistantContent = response
      }
      
      // Return just the assistant content for typing animation
      // Don't add to messages here - let the ChatPage handle that after typing
      return { content: assistantContent }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to send message'
      console.error('Error sending message:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateSessionTitle(sessionId: number, title: string) {
    loading.value = true
    error.value = null
    
    try {
      await chatApi.updateTitle(sessionId, title)
      
      const session = sessions.value.find(s => s.id === sessionId)
      if (session) {
        session.title = title
        saveToLocalStorage()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update session title'
      console.error('Error updating session title:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteSession(sessionId: number) {
    loading.value = true
    error.value = null
    
    try {
      await chatApi.delete(sessionId)
      
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
      
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = sessions.value.length > 0 && sessions.value[0] ? sessions.value[0].id : null
      }
      
      saveToLocalStorage()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete session'
      console.error('Error deleting session:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function setCurrentSession(sessionId: number | null) {
    currentSessionId.value = sessionId
  }

  function addMessageToCurrentSession(role: 'user' | 'assistant', content: string) {
    if (!currentSessionId.value) return
    
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${role}`,
      role,
      content,
      timestamp: new Date()
    }
    
    session.messages.push(message)
    session.updatedAt = new Date().toISOString()
    saveToLocalStorage()
    
    return message
  }

  function clearCache() {
    sessions.value = []
    currentSessionId.value = null
    lastFetched.value = null
    localStorage.removeItem('chatSessions')
  }

  function saveToLocalStorage() {
    localStorage.setItem('chatSessions', JSON.stringify({
      data: sessions.value,
      timestamp: lastFetched.value
    }))
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    currentMessages,
    loading,
    error,
    lastFetched,
    isTyping,
    typingContent,
    fetchSessions,
    createSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
    setCurrentSession,
    addMessageToCurrentSession,
    clearCache
  }
})
