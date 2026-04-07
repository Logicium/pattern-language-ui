<template>
  <div ref="dropdownRef" class="app-dropdown" :class="{ 'app-dropdown--disabled': disabled }">
    <button
      type="button"
      class="dropdown-trigger"
      :class="{ 'dropdown-trigger--open': isOpen, 'dropdown-trigger--placeholder': !selectedOption }"
      @click="toggleDropdown"
      :disabled="disabled"
    >
      <span class="dropdown-text">{{ displayText }}</span>
      <svg
        class="dropdown-chevron"
        :class="{ 'dropdown-chevron--open': isOpen }"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="square" />
      </svg>
    </button>

    <Transition name="dropdown-slide">
      <div v-if="isOpen" class="dropdown-menu">
        <button
          v-for="option in options"
          :key="String(option.value)"
          type="button"
          class="dropdown-option"
          :class="{ 'dropdown-option--selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface DropdownOption {
  value: string | number
  label: string
}

const props = defineProps<{
  modelValue: string | number | undefined | null
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(opt => opt.value === props.modelValue)
)

const displayText = computed(() =>
  selectedOption.value?.label || props.placeholder || 'Select...'
)

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectOption(option: DropdownOption) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-dropdown {
  position: relative;
  width: 100%;
}

.app-dropdown--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  cursor: pointer;
  transition: border-color var(--transition-base);
  outline: none;
}

.dropdown-trigger:hover:not(:disabled) {
  border-color: rgba(42, 42, 42, 0.3);
}

.dropdown-trigger:focus-visible {
  border-color: var(--color-accent-2);
}

.dropdown-trigger--open {
  border-color: var(--color-accent-2);
}

.dropdown-trigger--placeholder {
  color: var(--color-text-tertiary);
}

.dropdown-text {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-chevron {
  margin-left: 0.75rem;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-tertiary);
}

.dropdown-chevron--open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(253, 251, 247, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(42, 42, 42, 0.1);
  box-shadow: 0 8px 32px rgba(42, 42, 42, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

.dropdown-option {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-option:hover {
  background: var(--color-bg-secondary);
}

.dropdown-option--selected {
  background: var(--color-bg-secondary);
  font-weight: var(--font-weight-medium);
}

.dropdown-option + .dropdown-option {
  border-top: 1px solid rgba(42, 42, 42, 0.06);
}

/* Transition */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-slide-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
