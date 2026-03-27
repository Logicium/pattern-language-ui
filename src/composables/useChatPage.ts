import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { usePlaybooksStore } from '@/stores/playbooks'
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
  const isTyping = ref(false)
  const typedContent = ref('')
  const showSuccessModal = ref(false)

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

  const scrollToBottom = () => {
    nextTick(() => {
      if (messagesArea.value) {
        messagesArea.value.scrollTop = messagesArea.value.scrollHeight
      }
    })
  }

  watch(() => messages.value.length, () => {
    scrollToBottom()
  })

  const sendMessage = async () => {
    if (!inputMessage.value.trim() || loading.value || isTyping.value) return

    const messageText = inputMessage.value.trim()
    inputMessage.value = ''

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

      const fullResponse = response.content
      const playbookData = chatStore.extractPlaybookFromMessage(fullResponse)
      let contentToType = fullResponse
      let extractedPlaybook = null

      if (playbookData) {
        contentToType = playbookData.cleanedContent
        extractedPlaybook = playbookData.playbook
      }

      for (let i = 0; i < contentToType.length; i++) {
        typedContent.value += contentToType[i]
        scrollToBottom()
        await new Promise(resolve => setTimeout(resolve, 15))
      }

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
      avatarState.value = 'idle'
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      avatarState.value = 'idle'
      isTyping.value = false
      typedContent.value = ''
      alert('Failed to send message. Please try again.')
    }
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
    showSuccessModal,
    messages,
    loading,
    autoResize,
    sendMessage,
    handleAddPlaybook,
    goToPlaybooks,
    sendSuggestion,
    formatTime,
  }
}
