<template>
  <component
    :is="tag"
    ref="el"
    class="editable-text"
    :class="{ editable: canEdit }"
    :contenteditable="canEdit ? 'plaintext-only' : false"
    spellcheck="false"
    :data-placeholder="placeholder"
    :title="canEdit ? 'Click to edit' : undefined"
    @keydown.escape="revert"
    @blur="commit"
  >{{ text }}</component>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// In-place editable text: identical styling while editing (only a caret
// appears), autosaves on blur, Escape reverts.
const props = withDefaults(defineProps<{
  text: string
  canEdit?: boolean
  placeholder?: string
  tag?: string
}>(), {
  canEdit: false,
  placeholder: '',
  tag: 'p'
})

const emit = defineEmits<{
  save: [value: string]
}>()

const el = ref<HTMLElement | null>(null)

const revert = () => {
  if (el.value) el.value.textContent = props.text
  el.value?.blur()
}

const commit = () => {
  if (!props.canEdit || !el.value) return
  const next = (el.value.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
  if (next === props.text.trim()) {
    el.value.textContent = props.text
    return
  }
  el.value.textContent = next
  emit('save', next)
}
</script>

<style scoped>
.editable-text {
  white-space: pre-wrap;
}

.editable-text.editable {
  cursor: text;
  outline: none;
  caret-color: var(--color-text-primary);
}

/* Placeholder for empty editable regions */
.editable-text.editable:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary);
  font-style: italic;
  pointer-events: none;
}
</style>
