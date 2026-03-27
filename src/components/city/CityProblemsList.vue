<template>
  <ul class="problem-list">
    <li
      v-for="(problem, i) in problems"
      :key="i"
      class="problem-item"
      :class="{ 'problem-item--clickable': problem.challengeId }"
      @click="problem.challengeId ? $emit('openChallenge', problem.challengeId) : undefined"
    >
      <span class="problem-index text-xs text-tertiary">{{ String(i + 1).padStart(2, '0') }}</span>
      <div class="problem-content">
        <span class="text-sm text-secondary">{{ problem.description }}</span>
        <router-link
          v-if="problem.challengeId"
          :to="`/challenges/${problem.challengeId}`"
          class="challenge-badge"
          :data-accent="(problem.challengeId % 3) + 1"
          @click.stop
        >
          {{ problem.challengeTitle }}
        </router-link>
      </div>
      <span v-if="problem.challengeId" class="problem-arrow text-tertiary">→</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  problems: Array<{ description: string; challengeId: number | null; challengeTitle: string | null }>
}>()

defineEmits<{
  openChallenge: [challengeId: number]
}>()
</script>

<style scoped>
.problem-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  max-width: 72ch;
}

.problem-item {
  display: flex;
  gap: 1.5rem;
  align-items: baseline;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
}

.problem-item--clickable {
  cursor: pointer;
  transition: background var(--transition-fast);
  padding: 1rem 1.5rem;
  margin: 0 -1.5rem;
}

.problem-item--clickable:hover { background: var(--color-bg-secondary); }

.problem-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.challenge-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-text-secondary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  transition: all var(--transition-fast);
  align-self: flex-start;
}

.challenge-badge[data-accent="1"] { border-left: 3px solid var(--color-accent-1); }
.challenge-badge[data-accent="2"] { border-left: 3px solid var(--color-accent-2); }
.challenge-badge[data-accent="0"] { border-left: 3px solid var(--color-accent-3); }
.challenge-badge:hover { color: var(--color-text-primary); border-color: rgba(42, 42, 42, 0.3); }

.problem-arrow {
  font-size: 1rem;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.problem-item--clickable:hover .problem-arrow {
  transform: translateX(4px);
  color: var(--color-text-primary);
}
</style>
