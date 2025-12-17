<template>
  <div class="chat-page">
    <!-- Header with Avatar -->
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Chat</h1>
        <p class="text-sm text-secondary">AI Pattern Assistant</p>
        
        <!-- AI Avatar - Centered and overlapping header -->
        <div class="avatar-container">
          <AiAvatar :state="avatarState" :use-flow="true" />
          <div class="avatar-state-text" :class="{ 'is-visible': avatarState !== 'idle' }">
            {{ avatarState === 'thinking' ? 'THINKING...' : 'RESPONDING...' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Scrollable Messages Area -->
    <div class="messages-section" ref="messagesArea">
      <div class="container">
          <!-- Welcome State -->
          <div v-if="messages.length === 0" class="welcome-state">
            <h2>Ask about patterns, implementation strategies, or community challenges</h2>
            
            <!-- Avatar State Controls (for demo) -->
<!--            <div class="avatar-controls">-->
<!--              <button -->
<!--                @click="avatarState = 'idle'" -->
<!--                :class="['control-btn', { active: avatarState === 'idle' }]"-->
<!--              >-->
<!--                Idle-->
<!--              </button>-->
<!--              <button -->
<!--                @click="avatarState = 'thinking'" -->
<!--                :class="['control-btn', { active: avatarState === 'thinking' }]"-->
<!--              >-->
<!--                Thinking-->
<!--              </button>-->
<!--              <button -->
<!--                @click="avatarState = 'chatting'" -->
<!--                :class="['control-btn', { active: avatarState === 'chatting' }]"-->
<!--              >-->
<!--                Chatting-->
<!--              </button>-->
<!--            </div>-->
            
            <div class="suggestions">
              <button @click="sendSuggestion('How do I start a Community Anchor Point?')" class="suggestion-btn text-xs">
                How do I start a Community Anchor Point?
              </button>
              <button @click="sendSuggestion('What patterns work well together?')" class="suggestion-btn text-xs">
                What patterns work well together?
              </button>
              <button @click="sendSuggestion('How can I build trust in my community?')" class="suggestion-btn text-xs">
                How can I build trust in my community?
              </button>
            </div>
          </div>

          <!-- Messages List -->
          <div v-else class="messages-list">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="['message', message.role]"
            >
              <div class="message-content-wrapper">
                <div class="message-label text-xs text-tertiary">
                  {{ message.role === 'user' ? 'You' : 'Assistant' }}
                </div>
                <div class="message-content">
                  <!-- User messages as plain text -->
                  <p v-if="message.role === 'user'">{{ message.content }}</p>
                  <!-- Assistant messages as markdown -->
                  <VueMarkdownRender v-else :source="message.content" />
                  
                  <!-- Playbook Preview if message contains one -->
                  <PlaybookPreview 
                    v-if="message.playbook"
                    :playbook="message.playbook"
                    @add-to-playbooks="handleAddPlaybook"
                  />
                </div>
                <div class="message-time text-xs text-tertiary">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
            
            <!-- Loading/Typing state -->
            <div v-if="isTyping" class="message assistant loading-message">
              <div class="message-content-wrapper">
                <div class="message-label text-xs text-tertiary">Assistant</div>
                <div class="message-content">
                  <VueMarkdownRender :source="typedContent + '|'" />
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>

    <!-- Input Area - Fixed at bottom -->
    <div class="input-section">
      <div class="container">
        <form @submit.prevent="sendMessage" class="input-form">
          <textarea
            v-model="inputMessage"
            placeholder="Ask a question..."
            rows="1"
            @input="autoResize"
            @keydown.enter.exact.prevent="sendMessage"
            ref="textarea"
            class="text-input"
          ></textarea>
          <button type="submit" class="btn" :disabled="!inputMessage.trim() || loading">
            <span v-if="loading">...</span>
            <span v-else>Send</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <MessageModal
      :is-open="showSuccessModal"
      title="Playbook Added!"
      message="Your playbook has been successfully added to your dashboard."
      icon="✓"
      primary-button-text="Close"
      secondary-button-text="View Playbooks"
      @close="showSuccessModal = false"
      @secondary-action="goToPlaybooks"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { usePlaybooksStore } from '@/stores/playbooks'
import VueMarkdownRender from 'vue-markdown-render'
import AiAvatar from '@/components/AiAvatar.vue'
import { PlaybookPreview, MessageModal } from '@/components'
import type { AvatarState } from '@/types'
import type { Playbook } from '@/stores/playbooks'

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

// Fetch chat sessions on mount
onMounted(async () => {
  await chatStore.fetchSessions()
  
  // If no sessions exist, create one
  if (chatStore.sessions.length === 0) {
    await chatStore.createSession('New Chat')
  } else {
    // Set the first session as active
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

// Watch for new messages and scroll
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
  
  // Add user message immediately to UI
  chatStore.addMessageToCurrentSession('user', messageText)
  scrollToBottom()
  
  // Set avatar to thinking state
  avatarState.value = 'thinking'

  try {
    // Send message to API (returns only assistant content)
    const response = await chatStore.sendMessage(messageText)
    
    // Avatar transitions to chatting while typing response
    avatarState.value = 'chatting'
    isTyping.value = true
    typedContent.value = ''
    
    const fullResponse = response.content
    
    // Check if response contains a playbook
    const playbookData = chatStore.extractPlaybookFromMessage(fullResponse)
    let contentToType = fullResponse
    let extractedPlaybook = null
    
    if (playbookData) {
      contentToType = playbookData.cleanedContent
      extractedPlaybook = playbookData.playbook
    }
    
    // Type out the response character by character
    for (let i = 0; i < contentToType.length; i++) {
      typedContent.value += contentToType[i]
      scrollToBottom()
      await new Promise(resolve => setTimeout(resolve, 15)) // 15ms per character
    }
    
    // Typing complete - add assistant message to store with playbook if present
    const messageId = `msg_${Date.now()}_assistant`
    const newMessage: any = {
      id: messageId,
      role: 'assistant',
      content: contentToType,
      timestamp: new Date()
    }
    
    if (extractedPlaybook) {
      newMessage.playbook = extractedPlaybook
    }
    
    // Add to session
    chatStore.addMessageToCurrentSession('assistant', contentToType)
    
    // If there's a playbook, update the message in the store to include it
    if (extractedPlaybook && chatStore.currentSession) {
      const messages = chatStore.currentSession.messages
      const lastMessage = messages[messages.length - 1]
      if (lastMessage) {
        lastMessage.playbook = extractedPlaybook
      }
    }
    
    isTyping.value = false
    typedContent.value = ''
    
    // Return avatar to idle
    avatarState.value = 'idle'
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    avatarState.value = 'idle'
    isTyping.value = false
    typedContent.value = ''
    
    // Show error message
    alert('Failed to send message. Please try again.')
  }
}

const handleAddPlaybook = async (playbook: Playbook) => {
  try {
    await playbooksStore.addPlaybook(playbook)
    // Show success modal
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
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.page-header {
  flex-shrink: 0;
  padding: 3rem var(--container-padding);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  position: relative;
  z-index: 10;
}

.page-header .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
  position: relative;
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.messages-section .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

/* Avatar in Header - Absolutely positioned, centered */
.avatar-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 140px;
  pointer-events: none;
}

.avatar-container > :first-child {
  width: 140px;
  height: 140px;
  pointer-events: auto;
}

.avatar-state-text {
  text-align: center;
  font-size: 0.7rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  line-height: 1rem;
  height: 1rem;
  background: linear-gradient(
    135deg,
    var(--color-accent-1),
    var(--color-accent-2),
    var(--color-accent-3),
    var(--color-accent-1)
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 3s ease infinite;
  opacity: 0;
  transition: opacity 0.4s ease;
  white-space: nowrap;
}

.avatar-state-text.is-visible {
  opacity: 1;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Messages Section - Scrollable */
.messages-section {
  flex: 1;
  overflow-y: auto;
  padding: 3rem var(--container-padding);
  background: var(--color-bg-primary);
  position: relative;
}

/* Welcome State */
.welcome-state {
  text-align: center;
}

.welcome-state h2 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

/* Avatar Controls */
.avatar-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.control-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-size: 0.75rem;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.control-btn:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-secondary);
}

.control-btn.active {
  border-color: var(--color-accent-2);
  color: var(--color-text-primary);
  background: rgba(184, 212, 200, 0.08);
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
}

.suggestion-btn {
  padding: 1.25rem 1.5rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid var(--color-accent-2);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-base);
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.suggestion-btn:hover {
  border-left-color: var(--color-accent-1);
  color: var(--color-text-primary);
  transform: translateX(4px);
}

.suggestion-btn:nth-child(2) {
  border-left-color: var(--color-accent-3);
}

.suggestion-btn:nth-child(2):hover {
  border-left-color: var(--color-accent-2);
}

.suggestion-btn:nth-child(3) {
  border-left-color: var(--color-accent-1);
}

.suggestion-btn:nth-child(3):hover {
  border-left-color: var(--color-accent-3);
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  max-width: 85%;
}

.message.user .message-content-wrapper {
  max-width: 85%;
  align-items: flex-end;
}

.message-label {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.message-content {
  padding: 1.5rem;
  background: var(--color-bg-primary);
  border-left: 3px solid rgba(42, 42, 42, 0.08);
}

.message-content p {
  line-height: 1.8;
  white-space: pre-line;
}

/* Markdown Styling for Assistant Messages */
.message.assistant .message-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin: 2rem 0 1rem 0;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.message.assistant .message-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin: 1.5rem 0 0.75rem 0;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
}

.message.assistant .message-content :deep(p) {
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.message.assistant .message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message.assistant .message-content :deep(strong) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.message.assistant .message-content :deep(em) {
  font-style: italic;
  color: var(--color-text-tertiary);
}

.message.assistant .message-content :deep(a) {
  color: var(--color-accent-1);
  text-decoration: none;
  border-bottom: 1px solid var(--color-accent-1);
  transition: all var(--transition-base);
}

.message.assistant .message-content :deep(a:hover) {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

.message.assistant .message-content :deep(ul),
.message.assistant .message-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.message.assistant .message-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.message.assistant .message-content :deep(code) {
  background: rgba(42, 42, 42, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--color-text-primary);
}

.message.assistant .message-content :deep(pre) {
  background: rgba(42, 42, 42, 0.05);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.message.assistant .message-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.message.assistant .message-content :deep(blockquote) {
  border-left: 3px solid var(--color-accent-2);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--color-text-tertiary);
  font-style: italic;
}

.message.assistant .message-content :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

/* Typing cursor animation for markdown content */
.loading-message .message-content :deep(p:last-child::after) {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--color-accent-2);
  margin-left: 2px;
  animation: blink 0.8s infinite;
  vertical-align: text-bottom;
}

.message.user .message-content {
  border-left-color: var(--color-accent-1);
  background: rgba(232, 180, 160, 0.05);
}

.message.assistant .message-content {
  border-left-color: var(--color-accent-2);
  background: rgba(184, 212, 200, 0.08);
}

.loading-message .message-content {
  background: rgba(184, 212, 200, 0.08);
  border-left-color: var(--color-accent-2);
}

.thinking-text {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.typing-text {
  color: var(--color-text-primary);
}

.typing-cursor {
  display: inline-block;
  animation: blink 0.8s infinite;
  margin-left: 2px;
  color: var(--color-accent-2);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.message-time {
  letter-spacing: 0.05em;
}

/* Input Section - Fixed */
.input-section {
  flex-shrink: 0;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-secondary);
  padding: var(--spacing-md) 0;
}

.input-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.text-input {
  flex: 1;
  padding: 1rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  resize: none;
  max-height: 200px;
  letter-spacing: -0.01em;
  line-height: 1.6;
  transition: border-color var(--transition-base);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
  background: var(--color-bg-primary);
}

.text-input::placeholder {
  color: var(--color-text-tertiary);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 3rem var(--container-padding);
  }

  .avatar-container {
    width: 100px;
  }

  .avatar-container > :first-child {
    width: 100px;
    height: 100px;
  }

  .avatar-state-text {
    font-size: 0.6rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .welcome-state {
    padding: var(--spacing-md) 0;
  }

  .welcome-state h2 {
    font-size: 1.25rem;
  }
  
  .avatar-controls {
    flex-wrap: wrap;
  }
  
  .message-content-wrapper {
    max-width: 90%;
  }
  
  .message.user .message-content-wrapper {
    max-width: 90%;
  }

  .message-content {
    padding: 1rem;
  }
}
</style>

