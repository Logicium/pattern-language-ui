<template>
  <div class="welcome-state">
    <h2>Ask about patterns, implementation strategies, or community challenges</h2>
    
    <div class="suggestions">
      <button @click="$emit('sendSuggestion', 'How do I start a Community Anchor Point?')" class="suggestion-btn text-xs">
        How do I start a Community Anchor Point?
      </button>
      <button @click="$emit('sendSuggestion', 'What patterns work well together?')" class="suggestion-btn text-xs">
        What patterns work well together?
      </button>
      <button @click="$emit('sendSuggestion', 'How can I build trust in my community?')" class="suggestion-btn text-xs">
        How can I build trust in my community?
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  sendSuggestion: [suggestion: string]
}>()
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

.suggestion-btn:nth-child(2) {
  border-left-color: var(--color-accent-3);
}

.suggestion-btn:nth-child(2):hover {
  border-left-color: var(--color-accent-2);
}

.suggestion-btn:nth-child(3) {
  border-left-color: var(--color-accent-1);
}

.suggestion-btn:nth-child(3):hover {
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
