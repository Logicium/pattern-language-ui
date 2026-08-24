import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { demoApi } from '@/services/api'
import type { ChatMessage } from '@/stores/chat'
import type { Playbook } from '@/stores/playbooks'

const CHAT_KEY = 'pl_guest_chat'
const PLAYBOOKS_KEY = 'pl_guest_playbooks'
// The demo endpoint caps replayed history; send only the freshest exchanges.
const HISTORY_LIMIT = 40

/** Shape handed to POST /auth/signup as `guestData` (mirrors the backend DTO). */
export interface GuestSignupData {
  chats?: Array<{
    title?: string
    messages: Array<{ role: 'user' | 'assistant'; content: string; createdAt?: string }>
  }>
  playbooks?: any[]
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / private mode — the demo still works, it just won't persist */
  }
}

/**
 * PAL in guest mode: one conversation plus saved playbooks, all kept in
 * localStorage. Nothing touches the server except the stateless
 * /demo/chat generation call — until signup, when exportForSignup() hands
 * the whole thing to the backend to become real records.
 */
export const useGuestChatStore = defineStore('guestChat', () => {
  const messages = ref<ChatMessage[]>(
    load<ChatMessage[]>(CHAT_KEY, []).map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  )
  const playbooks = ref<Playbook[]>(load<Playbook[]>(PLAYBOOKS_KEY, []))
  const loading = ref(false)

  const hasProgress = computed(() => messages.value.length > 0 || playbooks.value.length > 0)

  function persistMessages() {
    save(CHAT_KEY, messages.value)
  }

  function addMessage(role: 'user' | 'assistant', content: string): ChatMessage {
    const message: ChatMessage = {
      id: `guest_${Date.now()}_${role}`,
      role,
      content,
      timestamp: new Date()
    }
    messages.value.push(message)
    persistMessages()
    return message
  }

  function attachPlaybookToLastMessage(playbook: any) {
    const last = messages.value[messages.value.length - 1]
    if (last) {
      last.playbook = playbook
      persistMessages()
    }
  }

  async function sendMessage(message: string): Promise<{ content: string }> {
    loading.value = true
    try {
      const history = messages.value
        .slice(-HISTORY_LIMIT)
        .map(m => ({ role: m.role, content: m.content }))
      return await demoApi.sendMessage(history, message)
    } finally {
      loading.value = false
    }
  }

  function savePlaybook(playbook: Playbook) {
    playbooks.value.unshift({ ...playbook, id: `guest_${Date.now()}` })
    save(PLAYBOOKS_KEY, playbooks.value)
  }

  /**
   * Package everything for the signup request. The backend's validation
   * whitelist strips fields its DTOs don't know (e.g. our local ids), so the
   * playbooks can go over as-is.
   */
  function exportForSignup(): GuestSignupData | undefined {
    if (!hasProgress.value) return undefined
    const data: GuestSignupData = {}
    if (messages.value.length > 0) {
      data.chats = [
        {
          title: 'Guest chat',
          messages: messages.value.map(m => ({
            role: m.role,
            content: m.content,
            createdAt: m.timestamp.toISOString()
          }))
        }
      ]
    }
    if (playbooks.value.length > 0) {
      data.playbooks = playbooks.value
    }
    return data
  }

  function clear() {
    messages.value = []
    playbooks.value = []
    localStorage.removeItem(CHAT_KEY)
    localStorage.removeItem(PLAYBOOKS_KEY)
  }

  return {
    messages,
    playbooks,
    loading,
    hasProgress,
    addMessage,
    attachPlaybookToLastMessage,
    sendMessage,
    savePlaybook,
    exportForSignup,
    clear
  }
})
