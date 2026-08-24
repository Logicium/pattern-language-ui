import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { usePlaybooksStore } from '@/stores/playbooks'
import { useChatScroll } from '@/composables/useChatScroll'
import { useTypingReveal } from '@/composables/useTypingReveal'
import type { AvatarState } from '@/types'
import type { Playbook } from '@/stores/playbooks'

export function useChatPage() {
  const router = useRouter()
  const chatStore = useChatStore()
  const playbooksStore = usePlaybooksStore()

  const inputMessage = ref('')
  const textarea = ref<HTMLTextAreaElement>()
  const messagesArea = ref<HTMLDivElement>()
  const avatarState = ref<AvatarState>('idle')
  const showSuccessModal = ref(false)

  const { showJumpToBottom, scrollToBottom, maybeScrollToBottom } = useChatScroll(messagesArea)
  const { isTyping, typedContent, revealTrail, typeOut, reset } = useTypingReveal(maybeScrollToBottom)

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

      const fullResponse = response.content
      const playbookData = chatStore.extractPlaybookFromMessage(fullResponse)
      let contentToType = fullResponse
      let extractedPlaybook = null

      if (playbookData) {
        contentToType = playbookData.cleanedContent
        extractedPlaybook = playbookData.playbook
      }

      await typeOut(contentToType)

      chatStore.addMessageToCurrentSession('assistant', contentToType)

      if (extractedPlaybook && chatStore.currentSession) {
        const msgs = chatStore.currentSession.messages
        const lastMessage = msgs[msgs.length - 1]
        if (lastMessage) {
          lastMessage.playbook = extractedPlaybook
        }
      }

      reset()
      avatarState.value = 'idle'
      maybeScrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      avatarState.value = 'idle'
      reset()
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
