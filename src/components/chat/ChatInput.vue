<template>
  <div class="input-section">
    <div class="container">
      <form @submit.prevent="$emit('send')" class="input-form">
        <textarea
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          placeholder="Ask a question..."
          rows="1"
          @input.capture="$emit('autoResize')"
          @keydown.enter.exact.prevent="$emit('send')"
          ref="textareaRef"
          class="text-input"
        ></textarea>
        <button type="submit" class="btn" :disabled="!modelValue.trim() || loading">
          <span v-if="loading">...</span>
          <span v-else>Send</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  modelValue: string
  loading: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  send: []
  autoResize: []
}>()

const textareaRef = ref<HTMLTextAreaElement>()

defineExpose({ textareaRef })
</script>

<style scoped>
.input-section {
  flex-shrink: 0;
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-secondary);
  padding: var(--spacing-md) 0;
}

.input-section .container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.input-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.text-input {
  flex: 1;
  padding: 1rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  resize: none;
  max-height: 200px;
  letter-spacing: -0.01em;
  line-height: 1.6;
  transition: border-color var(--transition-base);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-accent-2);
  background: var(--color-bg-primary);
}

.text-input::placeholder {
  color: var(--color-text-tertiary);
}
</style>
