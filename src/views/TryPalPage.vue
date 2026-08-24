<template>
  <div class="try-page">
    <header class="try-header">
      <BrandLogo to="/" word="PATTERN LANGUAGE.AI" :size="48" word-size="0.85rem" />
      <div class="try-header__mode">
        <span class="mode-avatar" aria-hidden="true">
          <AiAvatar :state="avatarState" :use-flow="true" />
        </span>
        <span class="mode-label">PAL — Guest mode</span>
      </div>
      <div class="try-header__actions">
        <span v-if="savedPlaybookCount > 0" class="saved-count">
          {{ savedPlaybookCount }} playbook{{ savedPlaybookCount === 1 ? '' : 's' }} saved on this device
        </span>
        <router-link to="/login" class="login-link">Log in</router-link>
        <router-link to="/signup" class="btn btn-sm">Save my progress</router-link>
      </div>
    </header>

    <p class="try-notice">
      No account needed — your conversation and playbooks save to this browser.
      <router-link to="/signup">Create a free account</router-link> any time to keep them.
    </p>

    <div class="messages-wrapper">
      <div class="messages-section" ref="messagesArea">
        <div class="container">
          <ChatWelcome v-if="messages.length === 0" @send-suggestion="sendSuggestion" />
          <ChatMessageList
            v-else
            :messages="messages"
            :is-typing="isTyping"
            :typed-content="typedContent"
            :reveal-trail="revealTrail"
            :format-time="formatTime"
            @add-playbook="handleAddPlaybook"
            @view-full-playbook="openFullPlaybook"
            @edit-message="editMessage"
            @retry-message="retryMessage"
          />
          <p v-if="errorMessage" class="chat-error">{{ errorMessage }}</p>
        </div>
      </div>
      <JumpToBottomButton :visible="showJumpToBottom" @click="scrollToBottom(true)" />
    </div>

    <ChatInput
      ref="chatInputEl"
      v-model="inputMessage"
      :loading="loading"
      @send="sendMessage()"
      @auto-resize="autoResize"
    />

    <MessageModal
      :is-open="showSuccessModal"
      title="Playbook Saved!"
      message="Your playbook is saved on this device. Create a free account and it moves to your dashboard — along with this conversation."
      icon="✓"
      primary-button-text="Keep Exploring"
      secondary-button-text="Create Account"
      @close="showSuccessModal = false"
      @secondary-action="goToSignup"
    />

    <SlideInModal v-model="showFullPlaybook">
      <PlaybookFullPreview
        v-if="previewPlaybook"
        :playbook="previewPlaybook"
        @close="showFullPlaybook = false"
      />
    </SlideInModal>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useSeoMeta } from '@unhead/vue'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import AiAvatar from '@/components/AiAvatar.vue'
import ChatWelcome from '@/components/chat/ChatWelcome.vue'
import ChatMessageList from '@/components/chat/ChatMessageList.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import JumpToBottomButton from '@/components/chat/JumpToBottomButton.vue'
import { MessageModal } from '@/components'
import SlideInModal from '@/components/SlideInModal.vue'
import PlaybookFullPreview from '@/components/playbook/PlaybookFullPreview.vue'
import type { Playbook } from '@/stores/playbooks'
import { useGuestChatPage } from '@/composables/useGuestChatPage'

useSeoMeta({
  description:
    'Chat with PAL, the Pattern Language assistant, without an account. Explore patterns for your community — your progress saves in your browser.'
})

const {
  inputMessage, textarea, messagesArea, avatarState, isTyping, typedContent, revealTrail,
  showSuccessModal, errorMessage, messages, loading, savedPlaybookCount, showJumpToBottom,
  autoResize, sendMessage, retryMessage, editMessage, handleAddPlaybook, goToSignup,
  sendSuggestion, formatTime, scrollToBottom,
} = useGuestChatPage()

const chatInputEl = ref<InstanceType<typeof ChatInput>>()
watchEffect(() => {
  textarea.value = chatInputEl.value?.textareaRef
})

const showFullPlaybook = ref(false)
const previewPlaybook = ref<Playbook | null>(null)

function openFullPlaybook(playbook: Playbook) {
  previewPlaybook.value = playbook
  showFullPlaybook.value = true
}
</script>

<style scoped>
.try-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.try-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem var(--container-padding);
  border-bottom: 1px solid var(--hairline);
}

.try-header__mode {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-avatar {
  width: 44px;
  height: 44px;
  display: block;
}

.mode-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-secondary);
}

.try-header__actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.saved-count {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.login-link {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.login-link:hover {
  color: var(--color-text-primary);
}

.try-header__actions .btn {
  text-decoration: none;
}

.try-notice {
  margin: 0;
  padding: 0.6rem var(--container-padding);
  font-size: 0.8rem;
  font-weight: 300;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--hairline);
  text-align: center;
}

.try-notice a {
  color: var(--color-text-primary);
}

.messages-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
}

.messages-section {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 3rem var(--container-padding);
  background: var(--color-bg-primary);
}

.messages-section .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}

.chat-error {
  margin: 1rem 0 0;
  font-size: 0.85rem;
  color: var(--color-accent-warm);
}

@media (max-width: 768px) {
  .try-header__mode,
  .saved-count {
    display: none;
  }
}
</style>
