<template>
  <Transition name="slide-in">
    <div v-if="isOpen" class="slide-in-modal-overlay">
      <div class="slide-in-modal" :style="{ left: sidebarWidth }">
        <div class="modal-container">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  sidebarWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  sidebarWidth: '220px'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
  // Prevent body scroll when modal is open
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const close = () => {
  isOpen.value = false
}

defineExpose({ close })
</script>

<style scoped>
.slide-in-modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(42, 42, 42, 0.4);
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.slide-in-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--color-bg-primary);
  z-index: 1001;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* Slide-in transition */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-enter-active .slide-in-modal,
.slide-in-leave-active .slide-in-modal {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-enter-from .slide-in-modal,
.slide-in-leave-to .slide-in-modal {
  transform: translateX(100%);
}

.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
}

.slide-in-enter-to .slide-in-modal,
.slide-in-leave-from .slide-in-modal {
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 768px) {
  .slide-in-modal-overlay {
    left: 0;
  }
  
  .slide-in-modal {
    left: 0;
  }
}

/* Custom scrollbar for modal */
.slide-in-modal::-webkit-scrollbar {
  width: 8px;
}

.slide-in-modal::-webkit-scrollbar-track {
  background: transparent;
}

.slide-in-modal::-webkit-scrollbar-thumb {
  background: #2a2a2a;
}

.slide-in-modal::-webkit-scrollbar-thumb:hover {
  background: #1a1a1a;
}
</style>
