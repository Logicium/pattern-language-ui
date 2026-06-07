<template>
  <component
    :is="to ? 'router-link' : 'span'"
    :to="to"
    class="brand-logo"
    :class="{ 'brand-logo--mark-only': markOnly }"
  >
    <svg
      class="brand-mark"
      :style="{ width: size + 'px', height: size + 'px' }"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e8b4a0">
            <animate
              attributeName="stop-color"
              values="#e8b4a0; #b8d4c8; #c9b8e8; #e8b4a0"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stop-color="#b8d4c8">
            <animate
              attributeName="stop-color"
              values="#b8d4c8; #c9b8e8; #e8b4a0; #b8d4c8"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stop-color="#c9b8e8">
            <animate
              attributeName="stop-color"
              values="#c9b8e8; #e8b4a0; #b8d4c8; #c9b8e8"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
      <!-- Layout matches AiAvatar's idle state: small circles at distance 7 around the center, all radius 7.7. -->
      <circle cx="32" cy="32" r="16" fill="none" :stroke="`url(#${gradientId})`" stroke-width="3" opacity="0.9" />
      <circle cx="32" cy="25" r="7.7" fill="none" :stroke="`url(#${gradientId})`" stroke-width="3" opacity="0.95" />
      <circle cx="38.06" cy="35.5" r="7.7" fill="none" :stroke="`url(#${gradientId})`" stroke-width="3" opacity="0.95" />
      <circle cx="25.94" cy="35.5" r="7.7" fill="none" :stroke="`url(#${gradientId})`" stroke-width="3" opacity="0.95" />
    </svg>
    <span v-if="!markOnly" class="brand-word" :style="{ fontSize: resolvedWordSize }">{{ word }}</span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    to?: string
    word?: string
    size?: number
    wordSize?: string
    markOnly?: boolean
  }>(),
  {
    to: '/',
    word: 'PATTERN LANGUAGE',
    size: 22,
    wordSize: undefined,
    markOnly: false,
  },
)

// Unique gradient id per instance so multiple logos can coexist.
const gradientId = `brand-grad-${Math.random().toString(36).slice(2, 8)}`

// Wordmark scales with the mark by default, but can be set independently via
// the wordSize prop when the icon needs to be larger than the text.
const resolvedWordSize = computed(() => {
  if (props.wordSize) return props.wordSize
  const rem = Math.min(1.25, Math.max(0.85, props.size / 36))
  return `${rem}rem`
})
</script>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: var(--color-text-primary);
  transition: opacity var(--transition-fast);
}

.brand-logo:hover { opacity: 0.7; }

.brand-mark {
  flex-shrink: 0;
  display: block;
}

.brand-word {
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.18em;
  color: inherit;
  white-space: nowrap;
}

.brand-logo--mark-only { gap: 0; }
</style>
