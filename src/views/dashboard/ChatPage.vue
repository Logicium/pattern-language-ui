<template>
  <div class="chat-page">
    <ChatHeader :avatar-state="avatarState" />

    <div class="messages-wrapper">
      <div class="messages-section" ref="messagesArea">
        <div class="container">
          <ChatWelcome
            v-if="messages.length === 0"
            @send-suggestion="sendSuggestion"
          />
          <ChatMessageList
            v-else
            :messages="messages"
            :is-typing="isTyping"
            :typed-content="typedContent"
            :format-time="formatTime"
            @add-playbook="handleAddPlaybook"
            @view-full-playbook="openFullPlaybook"
          />
        </div>
      </div>
      <JumpToBottomButton :visible="showJumpToBottom" @click="scrollToBottom(true)" />
    </div>

    <ChatInput
      v-model="inputMessage"
      :loading="loading"
      @send="sendMessage"
      @auto-resize="autoResize"
    />

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
import { ref } from 'vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatWelcome from '@/components/chat/ChatWelcome.vue'
import ChatMessageList from '@/components/chat/ChatMessageList.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import JumpToBottomButton from '@/components/chat/JumpToBottomButton.vue'
import { MessageModal } from '@/components'
import SlideInModal from '@/components/SlideInModal.vue'
import PlaybookFullPreview from '@/components/playbook/PlaybookFullPreview.vue'
import type { Playbook } from '@/stores/playbooks'
import { useChatPage } from '@/composables/useChatPage'

const {
  inputMessage, messagesArea, avatarState, isTyping, typedContent,
  showSuccessModal, messages, loading, showJumpToBottom,
  autoResize, sendMessage, handleAddPlaybook, goToPlaybooks,
  sendSuggestion, formatTime, scrollToBottom,
} = useChatPage()

const showFullPlaybook = ref(false)
const previewPlaybook = ref<Playbook | null>(null)

function openFullPlaybook(playbook: Playbook) {
  previewPlaybook.value = playbook
  showFullPlaybook.value = true
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
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
</style>

