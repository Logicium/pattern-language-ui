<template>
  <Transition name="toast">
    <div v-if="isVisible" class="toast">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  message: string
  duration?: number
  show: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const isVisible = ref(props.show)

watch(() => props.show, (newValue) => {
  if (newValue) {
    isVisible.value = true
    setTimeout(() => {
      isVisible.value = false
      emit('update:show', false)
    }, props.duration)
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, var(--color-accent-2), var(--color-accent-3));
  color: var(--color-bg-primary);
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.15);
  z-index: 2000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(2rem) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-1rem) scale(0.95);
}

@media (max-width: 768px) {
  .toast {
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
  }
}
</style>
