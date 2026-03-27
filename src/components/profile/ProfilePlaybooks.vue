<template>
  <div v-if="playbooks?.length" class="profile-section">
    <h2 class="section-title">Playbooks</h2>
    <div class="playbooks-grid">
      <div
        v-for="playbook in playbooks"
        :key="playbook.id"
        class="playbook-card"
      >
        <div class="playbook-header">
          <h3 class="playbook-title">{{ playbook.patternTitle }}</h3>
          <span class="playbook-status text-xs" :class="playbook.status">
            {{ playbook.status }}
          </span>
        </div>
        <p class="playbook-challenge text-sm text-secondary">{{ playbook.challenge }}</p>
        <div class="playbook-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${playbook.progress}%` }"></div>
          </div>
          <span class="progress-label text-xs text-tertiary">{{ playbook.progress }}% Complete</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playbooks: any[] | undefined
}>()
</script>

<style scoped>
.profile-section {
  background: var(--color-bg-primary);
  padding: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 1.5rem;
}

.playbooks-grid {
  display: grid;
  gap: 1.5rem;
}

.playbook-card {
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  transition: transform var(--transition-base);
}

.playbook-card:hover { transform: translateX(4px); }

.playbook-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.playbook-title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
}

.playbook-status {
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.playbook-status.active { color: var(--color-accent-1); }
.playbook-status.completed { color: var(--color-accent-2); }
.playbook-status.paused { color: var(--color-text-tertiary); }

.playbook-challenge {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.playbook-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(42, 42, 42, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent-1);
  transition: width var(--transition-base);
}

.progress-label { text-align: right; }

@media (max-width: 768px) {
  .profile-section { padding: 1.5rem; }
}
</style>
