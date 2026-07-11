<template>
  <button type="button" class="modal-back-btn" :class="{ 'is-overlay': overlay }" @click="$emit('back')">
    <span class="chevron chevron--back"></span> {{ label }}
  </button>
</template>

<script setup lang="ts">
// The one back affordance for slide-in modals. Rendered by each modal's own
// body so it sits inside banners/headers rather than floating above them —
// use `overlay` when the modal opens with a full-bleed hero.
withDefaults(defineProps<{
  label?: string
  overlay?: boolean
}>(), {
  label: 'Back',
  overlay: false
})

defineEmits<{
  back: []
}>()
</script>

<style scoped>
.modal-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  align-self: flex-start;
  background: transparent;
  border: none;
  padding: 0 0 2px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.modal-back-btn:hover { color: var(--color-text-primary); }

/* Sits inside a full-bleed banner at the top-left, no backdrop of its own */
.modal-back-btn.is-overlay {
  position: absolute;
  top: 2rem;
  left: var(--container-padding);
  z-index: 10;
}

@media (max-width: 768px) {
  .modal-back-btn.is-overlay {
    top: 1.5rem;
    left: 1.75rem;
  }
}
</style>
