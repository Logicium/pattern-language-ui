<template>
  <div class="messages-list">
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
          <p v-if="message.role === 'user'">{{ message.content }}</p>
          <VueMarkdownRender v-else :source="message.content" />
          
          <PlaybookPreview 
            v-if="message.playbook"
            :playbook="message.playbook"
            @add-to-playbooks="$emit('addPlaybook', $event)"
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
</template>

<script setup lang="ts">
import VueMarkdownRender from 'vue-markdown-render'
import { PlaybookPreview } from '@/components'

defineProps<{
  messages: any[]
  isTyping: boolean
  typedContent: string
  formatTime: (date: Date) => string
}>()

defineEmits<{
  addPlaybook: [playbook: any]
}>()
</script>

<style scoped>
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

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.message-time {
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
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
