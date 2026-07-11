import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { usePlaybooksStore } from '@/stores/playbooks'
import { useChatScroll } from '@/composables/useChatScroll'
import type { AvatarState } from '@/types'
import type { Playbook } from '@/stores/playbooks'

// Responses start typing at a natural pace, then glide up to a fast — but
// still readable — cruise. Words stream one at a time; the trailing words
// wear a graded blur that resolves word by word at exactly the typing pace.
const NORMAL_DELAY_MS = 30   // per word during the natural intro
const NORMAL_WORDS = 18      // how many words type at natural pace
const DECAY = 0.88           // gentle per-word delay decay while accelerating
const CRUISE_DELAY_MS = 8    // steady top speed (~120 words/sec)
const LONG_RESPONSE_WORDS = 350 // beyond this, cruise doubles up to stay snappy
const REVEAL_TRAIL = 8       // how many trailing words carry the blur gradient
const DRAIN_STEP_MS = 45     // per-word focus settle after the last word lands

export function useChatPage() {
  const router = useRouter()
  const chatStore = useChatStore()
  const playbooksStore = usePlaybooksStore()

  const inputMessage = ref('')
  const textarea = ref<HTMLTextAreaElement>()
  const messagesArea = ref<HTMLDivElement>()
  const avatarState = ref<AvatarState>('idle')
  const isTyping = ref(false)
  const typedContent = ref('')
  // Trailing words carrying the blur gradient; drains to 0 as the message settles
  const revealTrail = ref(REVEAL_TRAIL)
  const showSuccessModal = ref(false)

  const { showJumpToBottom, scrollToBottom, maybeScrollToBottom } = useChatScroll(messagesArea)

  onMounted(async () => {
    await chatStore.fetchSessions()
    if (chatStore.sessions.length === 0) {
      await chatStore.createSession('New Chat')
    } else {
      chatStore.setCurrentSession(chatStore.sessions[0]?.id || null)
    }
  })

  const messages = computed(() => chatStore.currentMessages)
  const loading = computed(() => chatStore.loading)

  const autoResize = () => {
    if (textarea.value) {
      textarea.value.style.height = 'auto'
      textarea.value.style.height = textarea.value.scrollHeight + 'px'
    }
  }

  // Follow new messages only while the reader is at the bottom
  watch(() => messages.value.length, () => {
    maybeScrollToBottom()
  })

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const sendMessage = async (overrideText?: string) => {
    const messageText = (overrideText ?? inputMessage.value).trim()
    if (!messageText || loading.value || isTyping.value) return

    if (overrideText === undefined) inputMessage.value = ''

    if (textarea.value) {
      textarea.value.style.height = 'auto'
    }

    chatStore.addMessageToCurrentSession('user', messageText)
    scrollToBottom()

    avatarState.value = 'thinking'

    try {
      const response = await chatStore.sendMessage(messageText)

      avatarState.value = 'chatting'
      isTyping.value = true
      typedContent.value = ''
      revealTrail.value = REVEAL_TRAIL

      const fullResponse = response.content
      const playbookData = chatStore.extractPlaybookFromMessage(fullResponse)
      let contentToType = fullResponse
      let extractedPlaybook = null

      if (playbookData) {
        contentToType = playbookData.cleanedContent
        extractedPlaybook = playbookData.playbook
      }

      // Phase 1 — natural typing. Phase 2 — per-word delay decays rapidly.
      // Phase 3 — the rest floods in as growing chunks under a slight blur.
      const words = contentToType.split(/(?<=\s)/)
      let delay = NORMAL_DELAY_MS
      let i = 0

      for (; i < words.length && i < NORMAL_WORDS; i++) {
        typedContent.value += words[i]
        if (i % 3 === 0) maybeScrollToBottom()
        await sleep(delay)
      }

      // Glide from the natural pace down to cruise speed
      for (; i < words.length && delay > CRUISE_DELAY_MS; i++) {
        typedContent.value += words[i]
        if (i % 3 === 0) maybeScrollToBottom()
        delay = Math.max(delay * DECAY, CRUISE_DELAY_MS)
        await sleep(delay)
      }

      // Cruise: a steady stream of single words so the reveal stays smooth.
      // Very long responses step up to two words per tick, never more.
      const wordsPerTick = words.length - i > LONG_RESPONSE_WORDS ? 2 : 1
      while (i < words.length) {
        typedContent.value += words.slice(i, i + wordsPerTick).join('')
        i += wordsPerTick
        if (i % 4 === 0) maybeScrollToBottom()
        await sleep(CRUISE_DELAY_MS)
      }

      // Drain: the last words settle into focus one by one
      for (let trail = REVEAL_TRAIL - 1; trail >= 0; trail--) {
        revealTrail.value = trail
        await sleep(DRAIN_STEP_MS)
      }
      maybeScrollToBottom()

      chatStore.addMessageToCurrentSession('assistant', contentToType)

      if (extractedPlaybook && chatStore.currentSession) {
        const msgs = chatStore.currentSession.messages
        const lastMessage = msgs[msgs.length - 1]
        if (lastMessage) {
          lastMessage.playbook = extractedPlaybook
        }
      }

      isTyping.value = false
      typedContent.value = ''
      revealTrail.value = REVEAL_TRAIL
      avatarState.value = 'idle'
      maybeScrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      avatarState.value = 'idle'
      isTyping.value = false
      typedContent.value = ''
      revealTrail.value = REVEAL_TRAIL
      alert('Failed to send message. Please try again.')
    }
  }

  /** Re-send a previous user message verbatim. */
  const retryMessage = (content: string) => {
    sendMessage(content)
  }

  /** Load a previous user message into the composer for editing. */
  const editMessage = (content: string) => {
    inputMessage.value = content
    autoResize()
    textarea.value?.focus()
  }

  const handleAddPlaybook = async (playbook: Playbook) => {
    try {
      await playbooksStore.addPlaybook(playbook)
      showSuccessModal.value = true
    } catch (error) {
      console.error('Error adding playbook:', error)
      alert('Failed to add playbook. Please try again.')
    }
  }

  const goToPlaybooks = () => {
    showSuccessModal.value = false
    router.push('/dashboard/playbooks')
  }

  const sendSuggestion = (suggestion: string) => {
    inputMessage.value = suggestion
    sendMessage()
  }

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  return {
    inputMessage,
    textarea,
    messagesArea,
    avatarState,
    isTyping,
    typedContent,
    revealTrail,
    showSuccessModal,
    messages,
    loading,
    showJumpToBottom,
    scrollToBottom,
    autoResize,
    sendMessage,
    retryMessage,
    editMessage,
    handleAddPlaybook,
    goToPlaybooks,
    sendSuggestion,
    formatTime,
  }
}
