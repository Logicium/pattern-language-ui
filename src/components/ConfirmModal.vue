<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button @click="handleCancel" class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-content">
          <p class="text-sm text-secondary modal-message">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button @click="handleCancel" class="btn-secondary">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="btn-primary" :class="{ 'btn-danger': danger }">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  danger: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

const handleConfirm = () => {
  emit('confirm')
  isOpen.value = false
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
  emit('update:modelValue', false)
}
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

.modal-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin: 0;
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
}

.modal-close:hover {
  color: var(--color-text-primary);
  background: rgba(42, 42, 42, 0.05);
}

.modal-content {
  padding: 2rem;
  background: var(--color-bg-secondary);
}

.modal-message {
  line-height: 1.6;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 2rem;
  justify-content: flex-end;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--color-text-primary);
  border: 1px solid var(--color-text-primary);
  color: var(--color-bg-primary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform var(--transition-base);
}

.btn-primary:hover::before {
  transform: translateX(100%);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 42, 42, 0.2);
}

.btn-danger {
  background: var(--color-accent-1);
  border-color: var(--color-accent-1);
  color: white;
}

.btn-danger:hover {
  background: var(--color-accent-warm);
  border-color: var(--color-accent-warm);
}

/* Transition */
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
</style>
