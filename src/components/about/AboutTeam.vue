<template>
  <section class="section team-section">
    <div class="container">
      <div class="section-header">
        <span class="section-number">Team</span>
        <h2 class="section-title">Who We Are</h2>
      </div>
      <div class="team-grid">
        <div v-for="member in team" :key="member.id" class="team-card">
          <div class="team-avatar"></div>
          <h3>{{ member.name }}</h3>
          <span class="team-role text-xs text-tertiary">{{ member.role }}</span>
          <p class="text-sm text-secondary">{{ member.bio }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { teamMembers } from '@/utils/data'

const team = teamMembers
</script>

<style scoped>
.team-section {
  background: var(--color-bg-primary);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rem;
}

.team-card { text-align: center; }

.team-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
  margin: 0 auto 2rem;
}

.team-card h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 0.5rem;
}

.team-role {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.team-card p { line-height: 1.7; }

@media (max-width: 1024px) {
  .team-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
