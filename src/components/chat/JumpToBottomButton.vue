<template>
  <Transition name="jump-fade">
    <button
      v-if="visible"
      type="button"
      class="jump-to-bottom"
      :class="{ 'jump-to-bottom--floating': floating }"
      aria-label="Jump to latest message"
      @click="$emit('click')"
    >
      <span class="jump-arrow">↓</span>
      <span class="jump-label text-xs">Latest</span>
    </button>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ visible: boolean; floating?: boolean }>(),
  { floating: true },
)
defineEmits<{ click: [] }>()
</script>

<style scoped>
.jump-to-bottom {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.jump-to-bottom:hover {
  border-color: var(--color-text-primary);
  transform: translateY(-1px);
}

.jump-to-bottom--floating {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.jump-to-bottom--floating:hover {
  transform: translateX(-50%) translateY(-1px);
}

.jump-arrow {
  font-size: 0.875rem;
  line-height: 1;
}

.jump-label {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.jump-fade-enter-active,
.jump-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.jump-fade-enter-from,
.jump-fade-leave-to {
  opacity: 0;
}

.jump-fade-enter-from.jump-to-bottom--floating,
.jump-fade-leave-to.jump-to-bottom--floating {
  transform: translateX(-50%) translateY(8px);
}
</style>
