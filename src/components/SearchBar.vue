<template>
  <div class="search-bar">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="search-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button v-if="modelValue" type="button" class="clear-btn text-xs" @click="$emit('update:modelValue', '')">
      Clear
    </button>
  </div>
</template>

<script setup lang="ts">
/** The site's one search field: the container's full width, a tinted box, a small Clear at the right. */
defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.search-bar {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  outline: none;
  transition: border-color var(--transition-base), background var(--transition-base);
}

.search-input:focus {
  border-color: var(--color-accent-1);
  background: var(--color-bg-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color var(--transition-base);
}

.clear-btn:hover {
  color: var(--color-text-primary);
}
</style>
