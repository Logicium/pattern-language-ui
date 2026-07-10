<template>
  <router-link :to="`/cities/${city.id}`" class="city-card" :data-accent="accent">
    <!-- Stylized, non-interactive map backdrop -->
    <img
      v-if="mapUrl && !mapFailed"
      class="card-map"
      :src="mapUrl"
      alt=""
      aria-hidden="true"
      loading="lazy"
      @error="mapFailed = true"
    />
    <div class="card-wash" aria-hidden="true"></div>

    <div class="card-body">
      <div class="label-row">
        <span class="label-id">
          <span class="accent-mark" aria-hidden="true"></span>
          <span v-if="city.state">{{ city.state }}</span>
        </span>
        <span v-if="city.establishedYear" class="label-meta">Est. {{ city.establishedYear }}</span>
      </div>

      <h3 class="card-name">{{ city.name }}</h3>

      <div class="card-stats">
        <span v-if="city.population">{{ city.population.toLocaleString() }} residents</span>
        <span v-if="city.memberCount" class="member-count">
          {{ city.memberCount }} {{ city.memberCount === 1 ? 'member' : 'members' }}
        </span>
      </div>

      <div class="card-foot">
        <template v-if="city.isGenerated && city.ruralReadinessScore != null">
          <div class="score-row">
            <span class="score-label">Readiness</span>
            <div class="score-bar">
              <div class="score-fill" :style="{ width: city.ruralReadinessScore + '%' }"></div>
            </div>
            <span class="score-value">{{ city.ruralReadinessScore }}</span>
          </div>
        </template>
        <span v-else class="ungenerated">Profile pending</span>
        <span class="view-note">View</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
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
  mapsKey?: string
}>()

const mapFailed = ref(false)

// Muted, label-free Static Maps render matching the site palette.
const mapUrl = computed(() => {
  if (!props.mapsKey) return null
  const center = encodeURIComponent(
    props.city.state ? `${props.city.name}, ${props.city.state}` : props.city.name
  )
  const styles = [
    'feature:all|element:labels|visibility:off',
    'feature:all|element:geometry|color:0xf4f1ea',
    'feature:road|element:geometry|color:0xffffff',
    'feature:water|element:geometry|color:0xc7d9cf',
    'feature:poi|visibility:off',
    'feature:transit|visibility:off',
    'feature:administrative|visibility:off',
  ].map(s => `&style=${encodeURIComponent(s)}`).join('')

  return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=13&size=640x400&scale=1${styles}&key=${props.mapsKey}`
})
</script>

<style scoped>
.city-card {
  position: relative;
  display: flex;
  min-height: 230px;
  border: 1px solid var(--hairline);
  background: var(--color-bg-primary);
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
  transition: border-color var(--transition-fast);
  font-variant-numeric: tabular-nums;
}

.city-card:hover {
  border-color: var(--hairline-strong);
}

.card-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* Slight uniform cream veil so the type pops without hiding the map */
.card-wash {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-bg-primary) 50%, transparent);
  pointer-events: none;
}

.card-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 2rem 2rem 1.75rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 1.5rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.city-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.city-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.city-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.label-meta { white-space: nowrap; }

.card-name {
  font-size: 1.625rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 0.6rem;
}

.card-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
}

.member-count { color: var(--color-accent-warm); }

.card-foot {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 1.25rem;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  max-width: 260px;
}

.score-label,
.score-value,
.ungenerated,
.view-note {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.score-bar {
  flex: 1;
  height: 2px;
  background: rgba(42, 42, 42, 0.12);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  transition: width var(--transition-base);
}

.view-note {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--hairline-strong);
  padding-bottom: 2px;
  transition: border-color var(--transition-fast);
  white-space: nowrap;
}

.city-card:hover .view-note { border-bottom-color: var(--color-text-primary); }
</style>
