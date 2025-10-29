<template>
  <div class="chat-page">
    <!-- Header -->
    <section class="page-header gradient-bg">
      <div class="container">
        <h1 class="page-title">Chat</h1>
        <p class="text-sm text-secondary">AI Pattern Assistant</p>
      </div>
    </section>

    <!-- AI Avatar - Fixed at top -->
    <div class="avatar-section">
      <div class="container">
        <div class="avatar-container">
          <AiAvatar :state="avatarState" :use-flow="true" />
        </div>
        <div class="avatar-state-text" :class="{ 'is-visible': avatarState !== 'idle' }">
          {{ avatarState === 'thinking' ? 'THINKING...' : 'RESPONDING...' }}
        </div>
      </div>
    </div>

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
                  <p>{{ message.content }}</p>
                </div>
                <div class="message-time text-xs text-tertiary">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
            
            <!-- Loading/Typing state -->
            <div v-if="loading || isTyping" class="message assistant loading-message">
              <div class="message-content-wrapper">
                <div class="message-label text-xs text-tertiary">Assistant</div>
                <div class="message-content">
                  <p v-if="loading" class="thinking-text">Thinking...</p>
                  <p v-else class="typing-text">{{ typedContent }}<span class="typing-cursor">|</span></p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AiAvatar from '@/components/AiAvatar.vue'
import type { AvatarState } from '@/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const textarea = ref<HTMLTextAreaElement>()
const messagesArea = ref<HTMLDivElement>()
const avatarState = ref<AvatarState>('idle')
const isTyping = ref(false)
const typedContent = ref('')

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

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage: Message = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const question = inputMessage.value
  inputMessage.value = ''
  
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }
  
  scrollToBottom()
  loading.value = true
  avatarState.value = 'thinking'

  // Simulate AI response delay
  await new Promise(resolve => setTimeout(resolve, 1600 + Math.random() * 800))

  loading.value = false
  avatarState.value = 'chatting'
  isTyping.value = true
  
  const fullResponse = generateMockResponse(question)
  typedContent.value = ''
  
  // Type out the response quickly (15ms per character - 2x faster)
  for (let i = 0; i < fullResponse.length; i++) {
    typedContent.value += fullResponse[i]
    scrollToBottom()
    await new Promise(resolve => setTimeout(resolve, 15))
  }
  
  // Typing complete, add to messages
  isTyping.value = false
  const assistantMessage: Message = {
    id: `msg_${Date.now()}_assistant`,
    role: 'assistant',
    content: fullResponse,
    timestamp: new Date()
  }

  messages.value.push(assistantMessage)
  
  // Return to idle
  avatarState.value = 'idle'
  scrollToBottom()
}

const sendSuggestion = (suggestion: string) => {
  inputMessage.value = suggestion
  sendMessage()
}

const generateMockResponse = (question: string): string => {
  const responses = [
    `That's a great question about ${question.toLowerCase()}. Community Anchor Points work best when they start small and build trust gradually. I recommend beginning with a temporary space—perhaps a library meeting room or church hall—to test the concept before committing to a permanent location.

Here are 3 quick steps to get started:

1. **Identify an underused space** - Look for buildings that sit empty during certain hours (libraries, firehouses, churches)
2. **Form a small steering committee** - Recruit 5-7 trusted community champions from different sectors
3. **Host a visioning session** - Gather community input on what programs and services the anchor should offer

Would you like me to help you create a playbook for this pattern?`,
    
    `Great question! Based on your community's context, I'd suggest looking at patterns that reinforce each other. For example:

• **Community Anchor Point** works well with **Village Broadcast Loop** - the anchor gives you a physical hub, and the broadcast loop helps people know what's happening there
• **Trust Infrastructure** pairs nicely with **Nested Governance Tables** - both focus on making decision-making transparent and inclusive

The key is starting with one foundation pattern that addresses your most urgent challenge, then layering in supporting patterns as you build momentum. What challenge feels most pressing in your community right now?`,
    
    `Building trust is foundational work. The **Trust Infrastructure** pattern is specifically designed for this. Here's what makes it work:

**Operational Trust** - Trust isn't just a feeling; it's a set of visible practices:
• Open office hours (same time, same place, every week)
• Public community boards with transparent updates
• Clear conflict resolution processes with neutral facilitators
• Co-created community agreements that everyone helps write

The Vermont Front Porch Forum is a great example - it's a moderated neighborhood platform where people see their voices matter and follow-through actually happens.

Would you like to explore how to implement this in your community?`
  ]
  
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)]
  return selectedResponse || responses[0] || 'Thanks for your message! Let me think about that and get back to you.'
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
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.page-header .container,
.messages-section .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}

/* Avatar Section - Fixed */
.avatar-section {
  flex-shrink: 0;
  padding: var(--spacing-sm) 0;
  background: var(--color-bg-primary);
}

.avatar-container {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  margin-bottom: -2rem;
}

.avatar-state-text {
  text-align: center;
  margin-top: var(--spacing-sm);
  font-size: 0.75rem;
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
    padding: 2rem var(--container-padding);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
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

