<template>
  <div class="discussion-tab">
    <!-- Messages Area -->
    <div class="messages-area" ref="messagesContainer">
      <div v-if="loadingMessages" class="messages-loading">
        <span class="text-xs text-tertiary">Loading discussion...</span>
      </div>

      <div v-else-if="messages.length === 0" class="messages-empty">
        <p class="text-sm text-secondary">No messages yet</p>
        <p class="text-xs text-tertiary">Start a conversation with your team or ask @PAL for help.</p>
      </div>

      <template v-else>
        <div
          v-for="(message, index) in messages"
          :key="message.id"
          class="message-item"
          :class="{
            'message-own': isOwnMessage(message),
            'message-pal': message.type === 'pal_response',
            'message-pal-query': message.type === 'pal_query',
            'message-file': message.type === 'file',
            'message-grouped': index > 0 && isSameAuthorGroup(messages[index - 1]!, message)
          }"
        >
          <!-- Avatar (not shown for grouped messages) -->
          <div
            v-if="!(index > 0 && isSameAuthorGroup(messages[index - 1]!, message))"
            class="message-avatar"
            :class="{
              'avatar-pal': message.type === 'pal_response',
              'avatar-creator': isCreatorMessage(message)
            }"
          >
            <template v-if="message.type === 'pal_response'">
              <span class="pal-icon">◆</span>
            </template>
            <template v-else-if="message.author?.profileImage">
              <img :src="message.author.profileImage" :alt="message.author.name" />
            </template>
            <template v-else>
              {{ getInitials(message.author?.name || 'PAL') }}
            </template>
          </div>
          <div v-else class="message-avatar-spacer"></div>

          <div class="message-body">
            <!-- Author + Timestamp (not shown for grouped messages) -->
            <div
              v-if="!(index > 0 && isSameAuthorGroup(messages[index - 1]!, message))"
              class="message-meta"
            >
              <span class="message-author text-xs">
                {{ message.type === 'pal_response' ? 'PAL' : message.author?.name }}
              </span>
              <span v-if="message.type === 'pal_response'" class="pal-label text-xs text-tertiary">Pattern Language Assistant</span>
              <span class="message-time text-xs text-tertiary">{{ formatMessageTime(message.createdAt) }}</span>
            </div>

            <!-- Content -->
            <div v-if="message.type === 'file'" class="message-file-content">
              <a :href="message.fileUrl" target="_blank" rel="noopener noreferrer" class="file-attachment">
                <span class="file-icon">↓</span>
                <span class="file-name text-sm">{{ message.fileName }}</span>
              </a>
              <p v-if="message.content" class="text-sm message-text" v-html="renderContent(message.content)"></p>
            </div>
            <div v-else-if="message.type === 'pal_response'" class="message-pal-content">
              <div class="text-sm message-text pal-markdown">
                <VueMarkdownRender :source="message.content" />
              </div>
            </div>
            <div v-else-if="message.type === 'pal_query'" class="message-query-content">
              <span class="pal-tag text-xs">@PAL</span>
              <p class="text-sm message-text" v-html="renderContent(message.content)"></p>
            </div>
            <p v-else class="text-sm message-text" v-html="renderContent(message.content)"></p>

            <!-- Delete action (own messages only) -->
            <button
              v-if="isOwnMessage(message) && message.type !== 'pal_response'"
              class="message-delete text-xs"
              @click="deleteMessage(message.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Mentions Dropdown -->
    <div v-if="showMentions" class="mentions-dropdown">
      <button
        v-for="user in filteredMentionUsers"
        :key="user.id"
        class="mention-option"
        @click="selectMention(user)"
      >
        <div class="mention-avatar">{{ getInitials(user.name) }}</div>
        <span class="text-sm">{{ user.name }}</span>
      </button>
      <button class="mention-option mention-pal" @click="selectPalMention()">
        <div class="mention-avatar avatar-pal"><span class="pal-icon">◆</span></div>
        <span class="text-sm">PAL — Pattern Language Assistant</span>
      </button>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-row">
        <label class="file-upload-btn" title="Attach file">
          <input
            type="file"
            ref="fileInput"
            @change="handleFileUpload"
            class="file-input-hidden"
          />
          <span class="upload-icon text-sm">↑</span>
        </label>
        <textarea
          ref="messageInput"
          v-model="newMessage"
          @keydown="handleKeydown"
          @input="handleInput"
          class="message-input text-sm"
          placeholder="Type a message... Use @ to mention"
          rows="1"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="send-btn"
        >
          <span class="send-icon">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import VueMarkdownRender from 'vue-markdown-render'
import { useAuthStore } from '@/stores/auth'
import { playbooksApi } from '@/services/api'
import { getInitials } from '@/utils/formatters'
import type { DiscussionMessage, PlaybookMember } from '@/types/collaboration'

const props = defineProps<{
  playbook: any
  members: PlaybookMember[]
  isUserMember: boolean
}>()

const authStore = useAuthStore()
const messagesContainer = ref<HTMLElement | null>(null)
const messageInput = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const messages = ref<DiscussionMessage[]>([])
const newMessage = ref('')
const sending = ref(false)
const loadingMessages = ref(false)
const showMentions = ref(false)
const mentionQuery = ref('')

const filteredMentionUsers = computed(() => {
  if (!mentionQuery.value) {
    return props.members.map(m => ({ id: m.user.id, name: m.user.name }))
  }
  const q = mentionQuery.value.toLowerCase()
  return props.members
    .map(m => ({ id: m.user.id, name: m.user.name }))
    .filter(u => u.name.toLowerCase().includes(q))
})

function isOwnMessage(message: DiscussionMessage): boolean {
  if (message.type === 'pal_response') return false
  return String(message.author?.id) === String(authStore.user?.id)
}

function isCreatorMessage(message: DiscussionMessage): boolean {
  const creator = props.members.find(m => m.role === 'creator')
  return creator ? String(message.author?.id) === String(creator.user.id) : false
}

function isSameAuthorGroup(prev: DiscussionMessage, curr: DiscussionMessage): boolean {
  if (!prev.author || !curr.author) return false
  if (prev.author.id !== curr.author.id) return false
  // Never group PAL responses with user messages (they share the same author ID)
  if (prev.type === 'pal_response' || curr.type === 'pal_response') return false
  if (prev.type === 'pal_query' && curr.type !== 'pal_query') return false
  const prevTime = new Date(prev.createdAt).getTime()
  const currTime = new Date(curr.createdAt).getTime()
  return (currTime - prevTime) < 5 * 60 * 1000 // 5 minute grouping
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) return time
  if (diffDays === 1) return `Yesterday ${time}`
  if (diffDays < 7) {
    const day = date.toLocaleDateString([], { weekday: 'short' })
    return `${day} ${time}`
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`
}

function renderContent(content: string): string {
  // Escape HTML
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Render @mentions
  return escaped.replace(/@(\w+(?:\s\w+)*)/g, '<span class="mention-highlight">@$1</span>')
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function loadMessages() {
  if (!props.playbook || typeof props.playbook.id !== 'number') return
  loadingMessages.value = true
  try {
    messages.value = await playbooksApi.getDiscussionMessages(props.playbook.id)
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load discussion:', error)
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value || !props.playbook) return

  const content = newMessage.value.trim()
  const isPalQuery = content.toLowerCase().includes('@pal')
  sending.value = true

  try {
    const mentionIds = extractMentionIds(content)

    if (isPalQuery) {
      const palContent = content.replace(/@pal\s*/gi, '').trim()
      await playbooksApi.sendPalQuery(props.playbook.id, palContent)
    } else {
      await playbooksApi.sendDiscussionMessage(props.playbook.id, content, mentionIds)
    }

    newMessage.value = ''
    await loadMessages()
    resetTextareaHeight()
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

function extractMentionIds(content: string): number[] {
  const mentions: number[] = []
  const regex = /@(\w+(?:\s\w+)*)/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const name = match[1]!.toLowerCase()
    const member = props.members.find(m =>
      m.user.name.toLowerCase() === name
    )
    if (member) mentions.push(member.user.id)
  }
  return mentions
}

async function deleteMessage(messageId: number) {
  if (!props.playbook) return
  try {
    await playbooksApi.deleteDiscussionMessage(props.playbook.id, messageId)
    messages.value = messages.value.filter(m => m.id !== messageId)
  } catch (error) {
    console.error('Failed to delete message:', error)
  }
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !props.playbook) return

  sending.value = true
  try {
    await playbooksApi.uploadDiscussionFile(props.playbook.id, file)
    await loadMessages()
  } catch (error) {
    console.error('Failed to upload file:', error)
  } finally {
    sending.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function handleInput() {
  // Auto-resize textarea
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  // Mention detection
  const text = newMessage.value
  const cursorPos = messageInput.value?.selectionStart || 0
  const textBeforeCursor = text.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
    const query = textBeforeCursor.substring(lastAtIndex + 1)
    if (!query.includes(' ') || query.length < 20) {
      mentionQuery.value = query
      showMentions.value = true
      return
    }
  }
  showMentions.value = false
}

function selectMention(user: { id: number; name: string }) {
  const text = newMessage.value
  const cursorPos = messageInput.value?.selectionStart || 0
  const textBeforeCursor = text.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1) {
    const before = text.substring(0, lastAtIndex)
    const after = text.substring(cursorPos)
    newMessage.value = `${before}@${user.name} ${after}`
  }
  showMentions.value = false
  messageInput.value?.focus()
}

function selectPalMention() {
  const text = newMessage.value
  const cursorPos = messageInput.value?.selectionStart || 0
  const textBeforeCursor = text.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1) {
    const before = text.substring(0, lastAtIndex)
    const after = text.substring(cursorPos)
    newMessage.value = `${before}@PAL ${after}`
  }
  showMentions.value = false
  messageInput.value?.focus()
}

function resetTextareaHeight() {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }
}

onMounted(() => {
  loadMessages()
})

watch(() => props.playbook?.id, () => {
  loadMessages()
})
</script>

<style scoped>
.discussion-tab {
  display: flex;
  flex-direction: column;
  height: 70vh;
  min-height: 500px;
  position: relative;
}

/* Messages Area */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.messages-loading,
.messages-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
  padding: 4rem 0;
}

/* Message Item */
.message-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  position: relative;
}

.message-item:hover .message-delete {
  opacity: 1;
}

.message-grouped {
  padding-top: 0.125rem;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #d0d0d0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 13px;
  flex-shrink: 0;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-avatar-spacer {
  width: 36px;
  flex-shrink: 0;
}

.avatar-pal {
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
}

.avatar-creator {
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
}

.pal-icon {
  font-size: 14px;
  color: white;
}

.message-body {
  flex: 1;
  min-width: 0;
  position: relative;
}

.message-meta {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.message-author {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.message-pal .message-author {
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pal-label {
  font-style: italic;
}

.message-text {
  line-height: 1.6;
  color: var(--color-text-primary);
  word-wrap: break-word;
  margin: 0;
}

.message-pal .message-text {
  color: var(--color-text-secondary);
}

.message-delete {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  transition: opacity 0.2s, color 0.2s;
  font-family: var(--font-family);
}

.message-delete:hover {
  color: var(--color-accent-warm);
}

/* PAL Messages */
.message-pal-content {
  padding: 1rem 1.25rem;
  background: rgba(184, 212, 200, 0.08);
  border-left: 2px solid var(--color-accent-2);
}

.pal-markdown :deep(p) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.pal-markdown :deep(p:first-child) {
  margin-top: 0;
}

.pal-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.pal-markdown :deep(ul),
.pal-markdown :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.pal-markdown :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.pal-markdown :deep(strong) {
  font-weight: var(--font-weight-medium);
}

.pal-markdown :deep(code) {
  font-size: 0.85em;
  padding: 0.15rem 0.4rem;
  background: rgba(42, 42, 42, 0.06);
  border-radius: 3px;
}

.pal-markdown :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  background: rgba(42, 42, 42, 0.04);
  overflow-x: auto;
  font-size: 0.85em;
  line-height: 1.5;
}

.pal-markdown :deep(pre code) {
  padding: 0;
  background: none;
}

.pal-markdown :deep(h1),
.pal-markdown :deep(h2),
.pal-markdown :deep(h3),
.pal-markdown :deep(h4) {
  margin: 0.75rem 0 0.25rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.pal-markdown :deep(h1) { font-size: 1.1em; }
.pal-markdown :deep(h2) { font-size: 1.05em; }
.pal-markdown :deep(h3) { font-size: 1em; }

.pal-markdown :deep(blockquote) {
  margin: 0.5rem 0;
  padding-left: 1rem;
  border-left: 2px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
}

.pal-markdown :deep(a) {
  color: var(--color-accent-2);
  text-decoration: underline;
}

.message-query-content {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.pal-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: linear-gradient(135deg, rgba(232, 180, 160, 0.15), rgba(184, 212, 200, 0.15));
  color: var(--color-text-secondary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  margin-top: 0.15rem;
}

/* File Messages */
.message-file-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-attachment {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  max-width: 320px;
}

.file-attachment:hover {
  border-color: rgba(42, 42, 42, 0.15);
}

.file-icon {
  color: var(--color-text-tertiary);
  font-size: 1rem;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Mentions Dropdown */
.mentions-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.1);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.mention-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(42, 42, 42, 0.04);
  cursor: pointer;
  font-family: var(--font-family);
  transition: background 0.2s;
  text-align: left;
}

.mention-option:hover {
  background: var(--color-bg-secondary);
}

.mention-option:last-child {
  border-bottom: none;
}

.mention-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #d0d0d0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}

.mention-pal .mention-avatar {
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
}

:deep(.mention-highlight) {
  color: var(--color-accent-warm);
  font-weight: var(--font-weight-medium);
}

/* Input Area */
.input-area {
  padding: 1.25rem 0 0;
  border-top: 1px solid rgba(42, 42, 42, 0.06);
  flex-shrink: 0;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.file-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color var(--transition-base);
  flex-shrink: 0;
}

.file-upload-btn:hover {
  color: var(--color-text-primary);
}

.file-input-hidden {
  display: none;
}

.upload-icon {
  transform: rotate(0deg);
}

.message-input {
  flex: 1;
  padding: 0.625rem 0;
  font-family: var(--font-family);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(42, 42, 42, 0.1);
  resize: none;
  overflow: hidden;
  transition: border-color var(--transition-base);
}

.message-input:focus {
  outline: none;
  border-bottom-color: var(--color-text-primary);
}

.message-input::placeholder {
  color: var(--color-text-tertiary);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-bg-dark);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-base);
  flex-shrink: 0;
}

.send-btn:hover {
  opacity: 0.8;
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.send-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .discussion-tab {
    height: 60vh;
    min-height: 400px;
  }

  .message-avatar {
    width: 30px;
    height: 30px;
    font-size: 11px;
  }

  .message-avatar-spacer {
    width: 30px;
  }
}
</style>
