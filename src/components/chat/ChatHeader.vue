<template>
  <section class="page-header gradient-bg">
    <div class="container">
      <h1 class="page-title">Chat</h1>
      <p class="text-sm text-secondary">AI Pattern Assistant</p>
      
      <div class="avatar-container">
        <AiAvatar :state="avatarState" :use-flow="true" />
        <div class="avatar-state-text" :class="{ 'is-visible': avatarState !== 'idle' }">
          {{ avatarState === 'thinking' ? 'THINKING...' : 'RESPONDING...' }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AiAvatar from '@/components/AiAvatar.vue'
import type { AvatarState } from '@/types'

defineProps<{
  avatarState: AvatarState
}>()
</script>

<style scoped>
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
}
</style>
