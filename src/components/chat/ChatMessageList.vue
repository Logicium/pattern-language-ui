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
            @view-full="$emit('viewFullPlaybook', $event)"
          />
        </div>
        <div class="message-foot">
          <span class="message-time text-xs text-tertiary">{{ formatTime(message.timestamp) }}</span>
          <div v-if="message.role === 'user'" class="message-actions">
            <button type="button" class="message-action" @click="$emit('editMessage', message.content)">Edit</button>
            <button type="button" class="message-action" @click="$emit('retryMessage', message.content)">Retry</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading/Typing state: height grows smoothly; the trailing words wear
         a graded blur that resolves word by word, exactly at typing speed -->
    <div v-if="isTyping" class="message assistant loading-message">
      <div class="message-content-wrapper">
        <div class="message-label text-xs text-tertiary">Assistant</div>
        <div class="message-content">
          <div ref="growEl" class="typing-grow">
            <div ref="growInnerEl" class="typing-inner">
              <VueMarkdownRender :source="typedContent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import VueMarkdownRender from 'vue-markdown-render'
import { PlaybookPreview } from '@/components'

const props = defineProps<{
  messages: any[]
  isTyping: boolean
  typedContent: string
  revealTrail: number
  formatTime: (date: Date) => string
}>()

// The typing bubble's height is animated explicitly so growth is one fluid
// motion instead of per-line reflow jumps.
const growEl = ref<HTMLElement | null>(null)
const growInnerEl = ref<HTMLElement | null>(null)

const REVEAL_MAX_BLUR = 5 // px on the newest word
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * The word-level reveal: the trailing `trail` words of the rendered markdown
 * get a graded blur — strongest on the newest word, fading to sharp. Because
 * the grades are reassigned on every appended word, each word steps toward
 * focus at exactly the typing cadence: the unblur IS the typing.
 *
 * The markdown DOM is rebuilt on every update, so spans are re-applied each
 * time; during the end-of-message drain (no re-render), previous spans are
 * unwrapped first.
 */
const applyTrailingReveal = (root: HTMLElement, trail: number) => {
  // Unwrap any spans from a previous pass
  root.querySelectorAll('span.wr').forEach(span => {
    span.replaceWith(document.createTextNode(span.textContent ?? ''))
  })
  root.normalize()
  if (trail <= 0) return

  // Collect text nodes in document order
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) textNodes.push(node as Text)

  // Walk backwards, wrapping the last `trail` words with graded blur
  let newerWords = 0 // words already wrapped (newer than the current one)
  for (let idx = textNodes.length - 1; idx >= 0 && newerWords < trail; idx--) {
    const textNode = textNodes[idx]!
    const tokens = (textNode.textContent ?? '').split(/(?<=\s)/).filter(t => t.length > 0)
    if (tokens.length === 0) continue

    const take = Math.min(tokens.length, trail - newerWords)
    const keep = tokens.slice(0, tokens.length - take).join('')

    const fragment = document.createDocumentFragment()
    if (keep) fragment.appendChild(document.createTextNode(keep))

    for (let j = tokens.length - take; j < tokens.length; j++) {
      // k = 0 for the newest word overall
      const k = newerWords + (tokens.length - 1 - j)
      const factor = Math.max(0, (trail - k) / trail)
      const span = document.createElement('span')
      span.className = 'wr'
      span.style.filter = `blur(${(REVEAL_MAX_BLUR * factor).toFixed(2)}px)`
      span.style.opacity = String(1 - 0.3 * factor)
      span.textContent = tokens[j]!
      fragment.appendChild(span)
    }

    newerWords += take
    textNode.replaceWith(fragment)
  }
}

watch([() => props.typedContent, () => props.revealTrail], () => {
  nextTick(() => {
    if (growEl.value && growInnerEl.value) {
      growEl.value.style.height = `${growInnerEl.value.offsetHeight}px`
    }
    if (growInnerEl.value && !reduceMotion) {
      applyTrailingReveal(growInnerEl.value, props.revealTrail)
    }
  })
})

watch(() => props.isTyping, (typing) => {
  if (!typing && growEl.value) growEl.value.style.height = ''
})

defineEmits<{
  addPlaybook: [playbook: any]
  viewFullPlaybook: [playbook: any]
  editMessage: [content: string]
  retryMessage: [content: string]
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

.loading-message .typing-inner :deep(p:last-child::after) {
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

.message-foot {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
}

.message.user .message-foot {
  flex-direction: row-reverse;
}

/* Edit/Retry appear on hover of the message row */
.message-actions {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.message:hover .message-actions,
.message-actions:focus-within {
  opacity: 1;
}

.message-action {
  background: none;
  border: none;
  padding: 0 0 1px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.message-action:hover {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
}

/* Smooth, continuous growth of the typing bubble */
.typing-grow {
  position: relative;
  overflow: clip;
  transition: height 220ms ease-out;
}

/* Trailing-word reveal spans (blur/opacity set inline per word) */
.typing-inner :deep(span.wr) {
  display: inline;
}

@media (prefers-reduced-motion: reduce) {
  .typing-grow { transition: none; }
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
