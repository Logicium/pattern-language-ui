<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add to Playbook</h3>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <p class="text-sm text-secondary modal-subtitle">
            Select a playbook for <strong>{{ resourceType === 'link' ? resource?.name : resource?.title }}</strong>
          </p>
          <div v-if="playbooks.length > 0" class="playbook-list">
            <button
              v-for="(playbook, index) in playbooks"
              :key="playbook.id"
              class="playbook-item"
              :data-accent="(index % 3) + 1"
              @click="$emit('select', playbook.id)"
            >
              <div class="playbook-info">
                <div class="text-sm playbook-title">{{ playbook.patternTitle }}</div>
                <div class="text-xs text-tertiary">{{ playbook.location }}</div>
              </div>
              <div class="playbook-progress">
                <div class="text-xs text-tertiary">{{ playbook.progress }}%</div>
              </div>
            </button>
          </div>
          <div v-else class="empty-message">
            <div class="empty-icon">∅</div>
            <p class="text-sm text-secondary">No active playbooks</p>
            <button class="btn" @click="$router.push('/dashboard/playbooks')">Create Playbook</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  resource: any
  resourceType: string
  playbooks: any[]
}>()

defineEmits<{
  close: []
  select: [playbookId: string | number]
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 42, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(42, 42, 42, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  border-radius: 50%;
}

.modal-close:hover {
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.05);
  transform: rotate(90deg);
}

.modal-content {
  padding: 2rem;
  overflow-y: auto;
  background: var(--color-bg-secondary);
}

.modal-subtitle {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.playbook-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playbook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
}

.playbook-item[data-accent="1"] { border-left-color: var(--color-accent-1); }
.playbook-item[data-accent="2"] { border-left-color: var(--color-accent-2); }
.playbook-item[data-accent="3"] { border-left-color: var(--color-accent-3); }

.playbook-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(42, 42, 42, 0.08);
}

.playbook-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;
}

.playbook-title {
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.playbook-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-message {
  text-align: center;
  padding: 3rem 0;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-text-tertiary);
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-message p {
  margin-bottom: 1.5rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal {
  transform: scale(0.95) translateY(20px);
}

.modal-leave-to .modal {
  transform: scale(0.95) translateY(-20px);
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>
