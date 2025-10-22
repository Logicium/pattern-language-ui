<template>
  <div class="chat-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Chat</h1>
        <p class="text-sm text-secondary">AI Pattern Assistant</p>
      </div>
    </div>

    <!-- Chat Container -->
    <div class="chat-container">
      <div class="container">
        <div class="messages-area" ref="messagesArea">
          <!-- Welcome State -->
          <div v-if="messages.length === 0" class="welcome-state">
            <h2>Ask about patterns, implementation strategies, or community challenges</h2>
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
              <div class="message-label text-xs text-tertiary">
                {{ message.role === 'user' ? 'You' : 'Assistant' }}
              </div>
              <div class="message-content">
                <p>{{ message.content }}</p>
              </div>
              <div class="message-time text-xs text-tertiary">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

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

  // Simulate AI response
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  const assistantMessage: Message = {
    id: `msg_${Date.now()}_assistant`,
    role: 'assistant',
    content: generateMockResponse(question),
    timestamp: new Date()
  }

  messages.value.push(assistantMessage)
  loading.value = false
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
  
  return responses[Math.floor(Math.random() * responses.length)]
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
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.page-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.page-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.25rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.chat-container {
  padding: var(--spacing-lg) var(--spacing-md);
}

/* Messages Area */
.messages-area {
  min-height: 60vh;
  margin-bottom: var(--spacing-lg);
}

/* Welcome State */
.welcome-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.welcome-state h2 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.4;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
}

.suggestion-btn {
  padding: 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
  letter-spacing: 0.01em;
}

.suggestion-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

/* Messages List */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.message {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-label {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.message-content {
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-left: 2px solid rgba(42, 42, 42, 0.08);
}

.message-content p {
  line-height: 1.7;
  white-space: pre-line;
}

.message.user .message-content {
  border-left-color: var(--color-accent-1);
}

.message.assistant .message-content {
  border-left-color: var(--color-accent-2);
}

/* Input Area */
.input-area {
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  padding-top: var(--spacing-md);
}

.input-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.text-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  resize: none;
  max-height: 200px;
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.text-input::placeholder {
  color: var(--color-text-tertiary);
}

/* Responsive */
@media (max-width: 768px) {
  .chat-container {
    padding: var(--spacing-md) var(--spacing-sm);
  }

  .welcome-state {
    padding: var(--spacing-md) 0;
  }

  .welcome-state h2 {
    font-size: 1.25rem;
  }
}
</style>

