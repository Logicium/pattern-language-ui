import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useGuestChatStore } from '@/stores/guestChat'
import { useChatScroll } from '@/composables/useChatScroll'
import { useTypingReveal } from '@/composables/useTypingReveal'
import type { AvatarState } from '@/types'
import type { Playbook } from '@/stores/playbooks'

/**
 * Guest-mode twin of useChatPage: same typing choreography and message flow,
 * but everything persists to localStorage via the guest store and generation
 * goes through the anonymous /demo/chat endpoint. extractPlaybookFromMessage
 * is borrowed from the chat store (it's a pure helper).
 */
export function useGuestChatPage() {
  const router = useRouter()
  const guestStore = useGuestChatStore()
  const chatStore = useChatStore()

  const inputMessage = ref('')
  const textarea = ref<HTMLTextAreaElement>()
  const messagesArea = ref<HTMLDivElement>()
  const avatarState = ref<AvatarState>('idle')
  const showSuccessModal = ref(false)
  const errorMessage = ref<string | null>(null)

  const { showJumpToBottom, scrollToBottom, maybeScrollToBottom } = useChatScroll(messagesArea)
  const { isTyping, typedContent, revealTrail, typeOut, reset } = useTypingReveal(maybeScrollToBottom)

  const messages = computed(() => guestStore.messages)
  const loading = computed(() => guestStore.loading)

  const autoResize = () => {
    if (textarea.value) {
      textarea.value.style.height = 'auto'
      textarea.value.style.height = textarea.value.scrollHeight + 'px'
    }
  }

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

    errorMessage.value = null
    guestStore.addMessage('user', messageText)
    scrollToBottom()

    avatarState.value = 'thinking'

    try {
      const response = await guestStore.sendMessage(messageText)

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

      guestStore.addMessage('assistant', contentToType)
      if (extractedPlaybook) {
        guestStore.attachPlaybookToLastMessage(extractedPlaybook)
      }

      reset()
      avatarState.value = 'idle'
      maybeScrollToBottom()
    } catch (error) {
      console.error('Error sending demo message:', error)
      avatarState.value = 'idle'
      reset()
      errorMessage.value =
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
    }
  }

  const retryMessage = (content: string) => {
    sendMessage(content)
  }

  const editMessage = (content: string) => {
    inputMessage.value = content
    autoResize()
    textarea.value?.focus()
  }

  /** Guests keep playbooks on-device; signing up moves them to their account. */
  const handleAddPlaybook = (playbook: Playbook) => {
    guestStore.savePlaybook(playbook)
    showSuccessModal.value = true
  }

  const goToSignup = () => {
    showSuccessModal.value = false
    router.push('/signup')
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
    errorMessage,
    messages,
    loading,
    savedPlaybookCount: computed(() => guestStore.playbooks.length),
    showJumpToBottom,
    scrollToBottom,
    autoResize,
    sendMessage,
    retryMessage,
    editMessage,
    handleAddPlaybook,
    goToSignup,
    sendSuggestion,
    formatTime,
  }
}
