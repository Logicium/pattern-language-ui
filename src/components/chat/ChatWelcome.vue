<template>
  <div class="welcome-state">
    <h2>{{ heading }}</h2>

    <div class="suggestions">
      <button
        v-for="s in activeSuggestions"
        :key="s"
        class="suggestion-btn text-xs"
        @click="$emit('sendSuggestion', s)"
      >
        {{ s }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

defineEmits<{
  sendSuggestion: [suggestion: string]
}>()

const authStore = useAuthStore()

const DEFAULT_SUGGESTIONS = [
  'How do I start a Community Anchor Point?',
  'What patterns work well together?',
  'How can I build trust in my community?',
]

// Prompts from the Cottonwood Springs workshop profile — demo citizens get
// scenario-specific starting points instead of the generic ones.
const DEMO_SUGGESTIONS = [
  'Which five patterns fit Cottonwood Springs best, and what evidence points to each?',
  'Give me three different three-pattern stacks for Cottonwood Springs.',
  'Design a 90-day experiment under $20,000 that uses at least three existing assets.',
  "From Sofia's perspective, what are the biggest barriers — and which patterns would change her mind about leaving?",
]

const isDemo = computed(() => authStore.currentUser?.isDemo === true)

const heading = computed(() =>
  isDemo.value
    ? 'You know Cottonwood Springs now. Where would you start?'
    : 'Ask about patterns, implementation strategies, or community challenges'
)

const activeSuggestions = computed(() => (isDemo.value ? DEMO_SUGGESTIONS : DEFAULT_SUGGESTIONS))
</script>

<style scoped>
.welcome-state {
  text-align: center;
}

.welcome-state h2 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
}

.suggestion-btn {
  padding: 1.25rem 1.5rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  border-left: 3px solid var(--color-accent-2);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-base);
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.suggestion-btn:hover {
  border-left-color: var(--color-accent-1);
  color: var(--color-text-primary);
  transform: translateX(4px);
}

.suggestion-btn:nth-child(3n + 2) {
  border-left-color: var(--color-accent-3);
}

.suggestion-btn:nth-child(3n + 2):hover {
  border-left-color: var(--color-accent-2);
}

.suggestion-btn:nth-child(3n) {
  border-left-color: var(--color-accent-1);
}

.suggestion-btn:nth-child(3n):hover {
  border-left-color: var(--color-accent-3);
}

@media (max-width: 768px) {
  .welcome-state {
    padding: var(--spacing-md) 0;
  }

  .welcome-state h2 {
    font-size: 1.25rem;
  }
}
</style>
