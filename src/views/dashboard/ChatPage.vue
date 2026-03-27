<template>
  <div class="chat-page">
    <ChatHeader :avatar-state="avatarState" />

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
        />
      </div>
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
  </div>
</template>

<script setup lang="ts">
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatWelcome from '@/components/chat/ChatWelcome.vue'
import ChatMessageList from '@/components/chat/ChatMessageList.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import { MessageModal } from '@/components'
import { useChatPage } from '@/composables/useChatPage'

const {
  inputMessage, messagesArea, avatarState, isTyping, typedContent,
  showSuccessModal, messages, loading,
  autoResize, sendMessage, handleAddPlaybook, goToPlaybooks,
  sendSuggestion, formatTime,
} = useChatPage()
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.messages-section {
  flex: 1;
  overflow-y: auto;
  padding: 3rem var(--container-padding);
  background: var(--color-bg-primary);
  position: relative;
}

.messages-section .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0;
}
</style>

