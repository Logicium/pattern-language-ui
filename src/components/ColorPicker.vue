<template>
  <div ref="pickerRef" class="color-picker">
    <button
      type="button"
      class="color-trigger"
      :class="{ 'color-trigger--open': isOpen }"
      @click="toggleDropdown"
    >
      <span
        class="color-preview"
        :style="{ backgroundColor: modelValue || '#b8d4c8' }"
      ></span>
      <span class="color-value">{{ modelValue || 'Select color' }}</span>
      <svg
        class="color-chevron"
        :class="{ 'color-chevron--open': isOpen }"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="square" />
      </svg>
    </button>

    <Transition name="picker-slide">
      <div v-if="isOpen" class="color-dropdown">
        <div class="color-grid">
          <button
            v-for="color in STORY_COLORS"
            :key="color"
            type="button"
            class="color-swatch"
            :class="{ 'color-swatch--selected': color === modelValue }"
            :style="{ backgroundColor: color }"
            :title="color"
            @click="selectColor(color)"
          >
            <svg
              v-if="color === modelValue"
              class="swatch-check"
              viewBox="0 0 12 10"
              fill="none"
            >
              <polyline
                points="1 5 4.5 8.5 11 1.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="square"
                stroke-linejoin="miter"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  modelValue: string | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const STORY_COLORS = [
  '#e8b4a0', '#b8d4c8', '#c9b8e8', '#d4c5a0', '#a0c4d4', '#d4a0c8',
  '#b8d4e8', '#e8c4b0', '#c8e8b4', '#d4b8c8', '#a0d4c8', '#e8d4a0',
  '#c8b8d4', '#b8e8c8', '#e8b4c8', '#a0c8e8', '#d4e8b8', '#c8d4e8',
  '#e8c8b8', '#b8c8e8', '#d4c8b8', '#c8e8d4', '#e8d4c8', '#b8d4d4',
  '#d4b8e8', '#c8b8e8', '#e8c8d4', '#b8e8d4', '#d4e8c8', '#e8b4a0',
  '#c8d4b8', '#b8c8d4', '#d4c5a0', '#b8d4c8',
]

const isOpen = ref(false)
const pickerRef = ref<HTMLDivElement | null>(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectColor(color: string) {
  emit('update:modelValue', color)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(event.target as Node)) {
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
.color-picker {
  position: relative;
  width: 100%;
}

.color-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.color-trigger:hover {
  border-color: rgba(42, 42, 42, 0.3);
}

.color-trigger--open {
  border-color: var(--color-accent-2);
}

.color-preview {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(42, 42, 42, 0.1);
  transition: background-color 0.3s ease;
}

.color-value {
  flex: 1;
  text-align: left;
}

.color-chevron {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-tertiary);
}

.color-chevron--open {
  transform: rotate(180deg);
}

.color-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
  padding: 1rem;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 0.5rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.color-swatch:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(42, 42, 42, 0.15);
}

.color-swatch--selected {
  border-color: var(--color-text-primary);
  transform: scale(1.1);
}

.swatch-check {
  width: 12px;
  height: 10px;
  color: var(--color-text-primary);
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
}

/* Transition */
.picker-slide-enter-active,
.picker-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.picker-slide-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.picker-slide-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
