<template>
  <span class="char-count" :class="{ 'char-count--low': remaining <= 250 }">
    {{ used.toLocaleString() }} / {{ max.toLocaleString() }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LONG_TEXT_MAX } from '@/utils/constants'

const props = withDefaults(defineProps<{
  value: string | undefined | null
  max?: number
}>(), {
  max: LONG_TEXT_MAX
})

const used = computed(() => props.value?.length ?? 0)
const remaining = computed(() => Math.max(props.max - used.value, 0))
</script>

<style scoped>
.char-count {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  text-align: right;
  font-variant-numeric: tabular-nums;
  transition: color var(--transition-fast);
}

.char-count--low {
  color: var(--color-accent-warm);
}
</style>
