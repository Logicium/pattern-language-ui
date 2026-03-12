<template>
  <div class="all-cities-page">
    <Navbar />

    <section class="cities-hero gradient-bg">
      <div class="container">
        <p class="hero-label text-xs text-tertiary">Community Directory</p>
        <h1 class="hero-title">Cities &amp; Towns</h1>
        <p class="hero-sub text-secondary">
          Explore rural communities using Pattern Language to address their wicked problems.
        </p>
        <input
          v-model="search"
          type="text"
          placeholder="Search by city or state…"
          class="search-input text-sm"
        />
      </div>
    </section>

    <section class="section-compact">
      <div class="container">
        <div class="section-header">
          <span class="section-number">{{ filtered.length }}</span>
          <h2 class="section-title">Communities</h2>
          <button
            v-if="missingUserCity"
            class="btn btn-add-city text-xs"
            :disabled="adding"
            @click="addMyCity"
          >
            {{ adding ? 'Adding…' : `+ Add ${currentUser!.location}` }}
          </button>
        </div>

        <div v-if="addError" class="state-message text-secondary text-sm">{{ addError }}</div>
        <div v-if="loading" class="state-message text-secondary text-sm">Loading communities…</div>
        <div v-else-if="error" class="state-message text-secondary text-sm">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <p class="text-secondary text-sm">No cities found{{ search ? ` for "${search}"` : '' }}.</p>
          <button
            v-if="missingUserCity"
            class="btn mt-sm"
            :disabled="adding"
            @click="addMyCity"
          >
            {{ adding ? 'Adding…' : `+ Add ${currentUser!.location}` }}
          </button>
          <p v-else-if="isAuthenticated && !currentUser?.location" class="text-xs text-tertiary mt-sm">
            Set your location in <router-link to="/dashboard/settings">Settings</router-link> to add your city.
          </p>
        </div>
        <div v-else class="cities-grid">
          <CityCard
            v-for="(city, i) in filtered"
            :key="city.id"
            :city="city"
            :accent="(i % 3) + 1"
          />
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import CityCard from '@/components/city/CityCard.vue'
import { citiesApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { currentUser, isAuthenticated } = storeToRefs(authStore)

const cities = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const addError = ref('')
const search = ref('')
const adding = ref(false)

const filtered = computed(() => {
  if (!search.value.trim()) return cities.value
  const q = search.value.toLowerCase()
  return cities.value.filter(c =>
    c.name.toLowerCase().includes(q) || c.state?.toLowerCase().includes(q)
  )
})

// True when the signed-in user has a location that doesn't yet exist in the city list
const missingUserCity = computed(() => {
  if (!isAuthenticated.value || !currentUser.value?.location) return false
  const userLoc = currentUser.value.location.toLowerCase()
  return !cities.value.some(c => c.name.toLowerCase() === userLoc)
})

async function addMyCity() {
  if (!currentUser.value?.location) return
  adding.value = true
  addError.value = ''
  try {
    const city = await citiesApi.create({
      name: currentUser.value.location,
      state: currentUser.value.state,
    })
    cities.value.push(city)
    router.push(`/cities/${city.id}`)
  } catch {
    addError.value = `Could not add "${currentUser.value.location}". Please try again.`
  } finally {
    adding.value = false
  }
}

onMounted(async () => {
  try {
    cities.value = await citiesApi.getAll()
  } catch {
    error.value = 'Failed to load cities. Please try again.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.cities-hero {
  padding: 12rem var(--container-padding) 6rem;
}
.hero-label { letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1rem; display: block; }
.hero-title { font-size: clamp(2.5rem, 6vw, 5rem); font-weight: var(--font-weight-light); letter-spacing: -0.03em; margin-bottom: 1.5rem; }
.hero-sub { font-size: 1.1rem; max-width: 50ch; line-height: 1.7; margin-bottom: 2.5rem; }
.search-input {
  width: 100%;
  max-width: 480px;
  padding: 0.875rem 1.25rem;
  border: 1px solid rgba(42, 42, 42, 0.15);
  background: rgba(253, 251, 247, 0.8);
  font-family: var(--font-family);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-base);
}
.search-input:focus { border-color: var(--color-text-primary); }
.section-header { align-items: center; }
.btn-add-city { margin-left: auto; white-space: nowrap; }
.cities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1px;
  background: rgba(42, 42, 42, 0.08);
}
.cities-grid > * { background: var(--color-bg-primary); }
.state-message { padding: 4rem 0; }
.empty-state { padding: 4rem 0; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }
.empty-state a { color: var(--color-text-primary); }
</style>
