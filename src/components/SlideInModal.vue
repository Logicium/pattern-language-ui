<template>
  <Transition name="slide-in">
    <div v-if="isOpen" class="slide-in-modal-overlay">
      <div class="slide-in-modal" :style="{ left: resolvedSidebarWidth }">
        <div class="modal-container">
          <!-- Standardized back affordance for every slide-in panel -->
          <button v-if="!hideBack" type="button" class="modal-back" @click="close">
            <span class="chevron chevron--back"></span> {{ backLabel }}
          </button>
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSidebarCollapsed } from '@/composables/useSidebarCollapsed'

interface Props {
  modelValue: boolean
  sidebarWidth?: string
  backLabel?: string
  hideBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarWidth: undefined,
  backLabel: 'Back',
  hideBack: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

// When the caller doesn't pin a sidebar width, track the dashboard sidebar's
// collapsed state so the modal slides over the current main-content area.
const { collapsed } = useSidebarCollapsed()
const resolvedSidebarWidth = computed(() => {
  if (props.sidebarWidth !== undefined) return props.sidebarWidth
  return collapsed.value ? '72px' : '220px'
})

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
  /* Depth for the panel's translateZ drift */
  perspective: 1400px;
  perspective-origin: 70% 40%;
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

/* ── Standard back button ───────────────────────────────────────────
   Text + arrow, left-aligned to the panel content padding (3rem),
   sticky so it stays reachable while the panel scrolls. */
.modal-back {
  position: sticky;
  top: 1rem;
  z-index: 20;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1.5rem 0 -0.5rem calc(3rem - 0.85rem);
  padding: 0.55rem 1rem 0.55rem 0.85rem;
  background: color-mix(in srgb, var(--color-bg-primary) 88%, transparent);
  backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.modal-back:hover { color: var(--color-text-primary); }

/* ── Slide-in with a slight 3D settle ───────────────────────────────
   The panel starts nearer to the viewer, slightly above its resting
   spot and blurred; it drifts down and away into place as it slides. */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: opacity 0.45s ease;
}

.slide-in-enter-active .slide-in-modal,
.slide-in-leave-active .slide-in-modal {
  transition:
    transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
    filter 0.45s ease,
    opacity 0.45s ease;
  will-change: transform, filter;
}

.slide-in-enter-from .slide-in-modal,
.slide-in-leave-to .slide-in-modal {
  transform: translateX(45%) translateY(-2.5%) translateZ(90px);
  filter: blur(14px);
  opacity: 0.4;
}

.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
}

.slide-in-enter-to .slide-in-modal,
.slide-in-leave-from .slide-in-modal {
  transform: translateX(0) translateY(0) translateZ(0);
  filter: blur(0);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .slide-in-enter-from .slide-in-modal,
  .slide-in-leave-to .slide-in-modal {
    transform: translateX(100%);
    filter: none;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .slide-in-modal-overlay {
    left: 0 !important;
  }

  .slide-in-modal {
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
  }

  .modal-back {
    margin-left: calc(1.75rem - 0.85rem);
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
