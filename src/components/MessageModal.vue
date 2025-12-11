<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <div class="modal-icon" v-if="icon">{{ icon }}</div>
            <h3 class="modal-title">{{ title }}</h3>
            <p v-if="message" class="modal-message">{{ message }}</p>
            
            <div class="modal-actions">
              <button
                v-if="secondaryButtonText"
                @click="handleSecondaryAction"
                class="btn btn-secondary"
              >
                {{ secondaryButtonText }}
              </button>
              <button
                @click="handlePrimaryAction"
                class="btn btn-primary"
              >
                {{ primaryButtonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  message?: string
  icon?: string
  primaryButtonText?: string
  secondaryButtonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  primaryButtonText: 'OK',
  icon: '✓'
})

const emit = defineEmits<{
  close: []
  primaryAction: []
  secondaryAction: []
}>()

const handlePrimaryAction = () => {
  emit('primaryAction')
  emit('close')
}

const handleSecondaryAction = () => {
  emit('secondaryAction')
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--container-padding);
}

.modal-container {
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content {
  padding: 2.5rem;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 1.5rem;
  color: var(--color-accent-2);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.modal-message {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 2rem;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  min-width: 120px;
}

.btn-primary {
  background: var(--color-accent-2);
  color: var(--color-bg-primary);
}

.btn-primary:hover {
  background: var(--color-accent-3);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.02);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 2rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
