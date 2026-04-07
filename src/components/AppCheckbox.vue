<template>
  <div class="app-checkbox" :class="{ 'app-checkbox--disabled': disabled }" @click.stop="toggle">
    <div class="checkbox-box" :class="{ 'checkbox-box--checked': isChecked }">
      <svg class="checkbox-icon" viewBox="0 0 12 10" fill="none">
        <polyline
          class="check-path"
          :class="{ 'check-path--visible': isChecked }"
          points="1 5 4.5 8.5 11 1.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="square"
          stroke-linejoin="miter"
        />
      </svg>
    </div>
    <span v-if="$slots.default" class="checkbox-label-text">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

// Temporary override for immediate visual feedback after a click,
// covering cases where the prop update is delayed (async event chains,
// spread-copied objects breaking reactivity, etc).
// null = no override, use prop value directly.
const toggleOverride = ref<boolean | null>(null)

const isChecked = computed(() =>
  toggleOverride.value !== null ? toggleOverride.value : (props.modelValue ?? false)
)

// When the prop catches up, clear the override so we go back to prop-driven.
watch(() => props.modelValue, () => {
  toggleOverride.value = null
})

function toggle() {
  if (props.disabled) return
  const newValue = !isChecked.value
  toggleOverride.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.app-checkbox--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 1.5px solid rgba(42, 42, 42, 0.3);
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  cursor: pointer;
}

.checkbox-box:hover:not(.app-checkbox--disabled .checkbox-box) {
  border-color: var(--color-accent-2);
}

.checkbox-box--checked {
  border-color: var(--color-text-primary);
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

.checkbox-icon {
  width: 12px;
  height: 10px;
}

.check-path {
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
  transition: stroke-dashoffset 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.check-path--visible {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
}

.checkbox-label-text {
  line-height: 1.4;
}
</style>
