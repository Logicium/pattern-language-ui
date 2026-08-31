<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { storeToRefs } from 'pinia'
import { citiesApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

/**
 * Dev-only workbench (route exists only under `import.meta.env.DEV`; the
 * backend additionally 403s the endpoint in production): re-run the
 * rural-readiness scoring for a town without regenerating its profile.
 */
useHead({ title: 'Dev — Readiness' })

interface CityRow {
  id: number
  name: string
  state?: string
  isDemo?: boolean
  isGenerated: boolean
  ruralReadinessScore?: number
}

const { isAuthenticated } = storeToRefs(useAuthStore())

const cities = ref<CityRow[]>([])
const loading = ref(true)
const busyId = ref<number | null>(null)
const results = ref<Record<number, { previous: number | null; next: number } | { error: string }>>({})
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return cities.value
  return cities.value.filter(
    (c) => c.name.toLowerCase().includes(q) || (c.state ?? '').toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    cities.value = await citiesApi.getAll()
  } catch (e) {
    console.error('Failed to load cities:', e)
  } finally {
    loading.value = false
  }
})

async function regenerate(city: CityRow) {
  busyId.value = city.id
  delete results.value[city.id]
  try {
    const r = await citiesApi.regenerateReadiness(city.id)
    results.value[city.id] = { previous: r.previousScore, next: r.newScore }
    city.ruralReadinessScore = r.newScore
  } catch (e) {
    results.value[city.id] = { error: e instanceof Error ? e.message : 'Failed' }
  } finally {
    busyId.value = null
  }
}

function outcomeOf(id: number) {
  return results.value[id]
}
</script>

<template>
  <div class="dev-page">
    <div class="container narrow">
      <p class="dev-chip">Dev tool · not built in production</p>
      <h1 class="title">Readiness re-scoring</h1>
      <p class="lede text-secondary">
        Re-runs the rural-readiness calculation for a town using its saved places and
        coordinates — the Gemini profile (history, wicked problems, narrative) is left
        untouched, and no LLM call is spent. Demo cities are refused.
      </p>

      <p v-if="!isAuthenticated" class="warn">
        The endpoint is authenticated — log in (any account) first, or the buttons below
        will 401.
      </p>

      <input v-model="search" class="form-input search" type="text" placeholder="Filter towns…" />

      <p v-if="loading" class="text-secondary">Loading cities…</p>

      <table v-else class="grid">
        <thead>
          <tr>
            <th>Town</th>
            <th class="num-col">Score</th>
            <th class="act-col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td>
              <span class="town">{{ c.name }}</span>
              <span class="meta">{{ c.state || '—' }}</span>
              <span v-if="c.isDemo" class="flag">demo</span>
              <span v-else-if="!c.isGenerated" class="flag flag--dim">no profile</span>
            </td>
            <td class="num-col">
              <template v-if="outcomeOf(c.id) && 'next' in outcomeOf(c.id)!">
                <span class="was">{{ (outcomeOf(c.id) as any).previous ?? '—' }}</span>
                <span class="chevron" aria-hidden="true" />
                <strong>{{ (outcomeOf(c.id) as any).next }}</strong>
              </template>
              <template v-else>{{ c.ruralReadinessScore ?? '—' }}</template>
            </td>
            <td class="act-col">
              <button
                class="btn btn-sm"
                :disabled="busyId !== null || c.isDemo"
                @click="regenerate(c)"
              >
                {{ busyId === c.id ? 'Scoring…' : 'Re-score' }}
              </button>
              <p v-if="outcomeOf(c.id) && 'error' in outcomeOf(c.id)!" class="err">
                {{ (outcomeOf(c.id) as any).error }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.dev-page {
  min-height: 100vh;
  padding: 8rem var(--container-padding) 5rem;
}

.container.narrow {
  max-width: 760px;
}

.dev-chip {
  display: inline-block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-accent-warm);
  border: 1px solid rgba(212, 123, 95, 0.4);
  padding: 0.25rem 0.6rem;
  margin-bottom: 1.25rem;
}

.title {
  font-size: 2.25rem;
  margin-bottom: 0.75rem;
}

.lede {
  max-width: 58ch;
  margin-bottom: 1.5rem;
}

.warn {
  color: var(--color-accent-warm);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.search {
  max-width: 320px;
  margin-bottom: 2rem;
}

.grid {
  width: 100%;
  border-collapse: collapse;
}

.grid th {
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  padding: 0 0 0.6rem;
  border-bottom: 1px solid var(--hairline-strong);
}

.grid td {
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--hairline);
  vertical-align: baseline;
}

.town {
  font-weight: var(--font-weight-medium);
}

.meta {
  margin-left: 0.6rem;
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.flag {
  margin-left: 0.6rem;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-accent-3);
  border: 1px solid currentColor;
  padding: 0.1rem 0.35rem;
}

.flag--dim {
  color: var(--color-text-tertiary);
}

.num-col {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.num-col .was {
  color: var(--color-text-tertiary);
  text-decoration: line-through;
  margin-right: 0.35rem;
}

.num-col .chevron {
  color: var(--color-text-tertiary);
  margin-right: 0.35rem;
}

.act-col {
  text-align: right;
  width: 8rem;
}

.err {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: var(--color-accent-warm);
  max-width: 14rem;
}

@media (max-width: 640px) {
  .dev-page {
    padding-top: 6.5rem;
  }
}
</style>
