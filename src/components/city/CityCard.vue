<template>
  <router-link :to="`/cities/${city.id}`" class="city-card">
    <div class="card-accent" :data-accent="accent"></div>
    <div class="card-body">
      <div class="card-meta text-xs text-tertiary">
        <span v-if="city.state">{{ city.state }}</span>
        <span v-if="city.establishedYear">Est. {{ city.establishedYear }}</span>
      </div>
      <h3 class="card-name">{{ city.name }}</h3>
      <div class="card-stats text-sm text-secondary">
        <span v-if="city.population">{{ city.population.toLocaleString() }} residents</span>
        <span v-if="city.memberCount" class="member-count">
          {{ city.memberCount }} {{ city.memberCount === 1 ? 'member' : 'members' }}
        </span>
      </div>
      <div v-if="city.isGenerated && city.ruralReadinessScore != null" class="score-row">
        <span class="text-xs text-tertiary">Readiness</span>
        <div class="score-bar">
          <div class="score-fill" :style="{ width: city.ruralReadinessScore + '%' }"></div>
        </div>
        <span class="text-xs text-tertiary">{{ city.ruralReadinessScore }}</span>
      </div>
      <div v-if="!city.isGenerated" class="ungenerated text-xs text-tertiary">Info not yet generated</div>
    </div>
    <div class="card-arrow">→</div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  city: {
    id: number
    name: string
    state?: string
    establishedYear?: string
    population?: number
    ruralReadinessScore?: number
    isGenerated: boolean
    memberCount?: number
  }
  accent?: number
}>()
</script>

<style scoped>
.city-card {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(42, 42, 42, 0.1);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: border-color var(--transition-base), transform var(--transition-fast);
  background: var(--color-bg-primary);
  position: relative;
  overflow: hidden;
}
.city-card:hover { border-color: var(--color-text-primary); transform: translateY(-2px); }
.card-accent { width: 4px; flex-shrink: 0; }
[data-accent="1"] { background: var(--color-accent-1); }
[data-accent="2"] { background: var(--color-accent-2); }
[data-accent="3"] { background: var(--color-accent-3); }
.card-body { flex: 1; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
.card-meta { display: flex; gap: 1rem; }
.card-name { font-size: 1.25rem; font-weight: var(--font-weight-light); letter-spacing: -0.02em; }
.card-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.member-count { color: var(--color-accent-warm); }
.score-row { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem; }
.score-bar { flex: 1; height: 3px; background: rgba(42, 42, 42, 0.1); }
.score-fill { height: 100%; background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2)); transition: width var(--transition-base); }
.ungenerated { margin-top: 0.25rem; font-style: italic; }
.card-arrow { padding: 1.75rem 1.25rem; display: flex; align-items: center; color: var(--color-text-tertiary); font-size: 1.1rem; transition: color var(--transition-fast); }
.city-card:hover .card-arrow { color: var(--color-text-primary); }
</style>
