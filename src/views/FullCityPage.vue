<template>
  <div class="full-city-page">
    <Navbar />

    <div v-if="loading" class="section container"><p class="text-secondary">Loading…</p></div>
    <div v-else-if="error" class="section container"><p class="text-secondary">{{ error }}</p></div>

    <template v-else-if="city">
      <!-- Hero -->
      <section class="city-hero gradient-bg">
        <div class="container">
          <p class="hero-label text-xs text-tertiary">{{ city.state ?? 'Community' }}</p>
          <h1 class="hero-title">{{ city.name }}</h1>
          <div class="hero-meta text-sm text-secondary">
            <span v-if="city.establishedYear">Est. {{ city.establishedYear }}</span>
            <span v-if="city.population" class="meta-sep">·</span>
            <span v-if="city.population">Pop. {{ city.population.toLocaleString() }}</span>
          </div>
          <button v-if="!city.isGenerated && isAuthenticated" class="btn mt-md" :disabled="generating" @click="generate">
            {{ generating ? 'Generating…' : 'Generate Community Info' }}
          </button>
          <p v-if="!city.isGenerated && !isAuthenticated" class="not-generated text-sm text-tertiary">
            <router-link to="/login">Sign in</router-link> to generate community info for this city.
          </p>
        </div>
      </section>

      <!-- Members — always from DB -->
      <section class="section-compact">
        <div class="container">
          <div class="section-header"><span class="section-number">01</span><h2 class="section-title">Members</h2></div>
          <div v-if="city.users?.length" class="members-grid">
            <UserMiniProfile v-for="user in city.users" :key="user.id" :user="user" />
          </div>
          <p v-else class="text-secondary text-sm">No public members in this city yet.</p>
        </div>
      </section>

      <!-- Playbooks — always from DB -->
      <section class="section-compact alt-section">
        <div class="container">
          <div class="section-header"><span class="section-number">02</span><h2 class="section-title">Public Playbooks</h2></div>
          <div v-if="city.playbooks?.length" class="list-grid">
            <router-link v-for="p in city.playbooks" :key="p.id" :to="`/dashboard/playbooks/${p.id}`" class="list-item">
              <span class="item-name text-sm">{{ p.patternTitle }}</span>
              <span class="item-desc text-xs text-tertiary">{{ p.status }} · {{ p.progress }}% complete</span>
            </router-link>
          </div>
          <p v-else class="text-secondary text-sm">No public playbooks for this city yet.</p>
        </div>
      </section>

      <!-- Generated sections -->
      <template v-if="city.isGenerated">
        <!-- History -->
        <section class="section-compact">
          <div class="container">
            <div class="section-header"><span class="section-number">03</span><h2 class="section-title">History</h2></div>
            <p class="body-text text-secondary">{{ city.history }}</p>
          </div>
        </section>

        <!-- Readiness Score -->
        <section class="section-compact alt-section">
          <div class="container">
            <div class="section-header"><span class="section-number">04</span><h2 class="section-title">Rural Readiness</h2></div>
            <div class="score-display">
              <span class="score-number">{{ city.ruralReadinessScore ?? '—' }}</span>
              <span class="score-label text-xs text-tertiary">/ 100</span>
            </div>
            <div class="score-bar-lg">
              <div class="score-fill-lg" :style="{ width: (city.ruralReadinessScore ?? 0) + '%' }"></div>
            </div>
            <p class="text-xs text-tertiary mt-sm">Community engagement readiness index.</p>
          </div>
        </section>

        <!-- Wicked Problems -->
        <section class="section-compact">
          <div class="container">
            <div class="section-header"><span class="section-number">05</span><h2 class="section-title">Wicked Problems</h2></div>
            <ul class="problem-list">
              <li v-for="(problem, i) in city.wickedProblems" :key="i" class="problem-item text-sm text-secondary">
                <span class="problem-index text-xs text-tertiary">{{ String(i + 1).padStart(2, '0') }}</span>
                {{ problem }}
              </li>
            </ul>
          </div>
        </section>

        <!-- Resources — AI generated, reference-link style -->
        <section class="section-compact alt-section">
          <div class="container">
            <div class="section-header"><span class="section-number">06</span><h2 class="section-title">Resources</h2></div>
            <div v-if="city.cityResources?.length" class="resources-list">
              <a
                v-for="r in city.cityResources"
                :key="r.url"
                :href="r.url"
                target="_blank"
                rel="noopener noreferrer"
                class="resource-link"
              >
                <div class="resource-meta">
                  <span class="resource-category text-xs text-tertiary">{{ r.category }}</span>
                  <span class="resource-name text-sm">{{ r.name }}</span>
                  <p class="resource-desc text-xs text-secondary">{{ r.description }}</p>
                  <span class="resource-domain text-xs text-tertiary">{{ extractDomain(r.url) }}</span>
                </div>
                <span class="resource-arrow">↗</span>
              </a>
            </div>
            <p v-else class="text-secondary text-sm">No resources generated yet.</p>
          </div>
        </section>
      </template>
    </template>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import UserMiniProfile from '@/components/city/UserMiniProfile.vue'
import { citiesApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const isAuthenticated = authStore.isAuthenticated

const city = ref<any>(null)
const loading = ref(true)
const error = ref('')
const generating = ref(false)

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

async function fetchCity() {
  try {
    city.value = await citiesApi.getById(+route.params.id!)
  } catch {
    error.value = 'Failed to load city. Please try again.'
  } finally {
    loading.value = false
  }
}

async function generate() {
  generating.value = true
  try {
    await citiesApi.generateInfo(+route.params.id!)
    await fetchCity()
  } catch {
    error.value = 'Failed to generate city info. Please try again.'
  } finally {
    generating.value = false
  }
}

onMounted(fetchCity)
</script>

<style scoped>
.city-hero { padding: 12rem var(--container-padding) 6rem; }
.hero-label { letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1rem; display: block; }
.hero-title { font-size: clamp(2.5rem, 6vw, 5rem); font-weight: var(--font-weight-light); letter-spacing: -0.03em; margin-bottom: 1rem; }
.hero-meta { display: flex; gap: 0.75rem; align-items: center; }
.meta-sep { color: var(--color-text-tertiary); }
.not-generated { margin-top: 1.5rem; }
.not-generated a { color: var(--color-text-primary); }
.alt-section { background: var(--color-bg-secondary); }
.body-text { max-width: 72ch; line-height: 1.8; }
.score-display { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1rem; }
.score-number { font-size: 4rem; font-weight: var(--font-weight-light); letter-spacing: -0.04em; }
.score-bar-lg { height: 6px; background: rgba(42, 42, 42, 0.1); max-width: 360px; }
.score-fill-lg { height: 100%; background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3)); transition: width 0.6s ease; }
.problem-list { list-style: none; display: flex; flex-direction: column; max-width: 72ch; }
.problem-item { display: flex; gap: 1.5rem; align-items: baseline; padding: 1rem 0; border-bottom: 1px solid rgba(42, 42, 42, 0.06); }
.members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1px; background: rgba(42, 42, 42, 0.06); }
.list-grid { display: flex; flex-direction: column; gap: 1px; background: rgba(42, 42, 42, 0.06); }
.list-item { display: flex; flex-direction: column; gap: 0.25rem; padding: 1.25rem 1.5rem; background: var(--color-bg-primary); text-decoration: none; color: var(--color-text-primary); transition: background var(--transition-fast); }
.list-item:hover { background: var(--color-bg-secondary); }
.resources-list { display: flex; flex-direction: column; gap: 1px; background: rgba(42, 42, 42, 0.08); max-width: 860px; }
.resource-link { display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: 1.5rem 2rem; background: var(--color-bg-secondary); text-decoration: none; color: var(--color-text-primary); transition: background var(--transition-fast); }
.resource-link:hover { background: var(--color-bg-primary); }
.resource-meta { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.resource-category { text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.1rem; }
.resource-name { font-weight: var(--font-weight-medium); }
.resource-desc { line-height: 1.5; margin-top: 0.15rem; }
.resource-domain { font-style: italic; margin-top: 0.15rem; }
.resource-arrow { font-size: 1.1rem; color: var(--color-text-tertiary); flex-shrink: 0; transition: color var(--transition-fast); }
.resource-link:hover .resource-arrow { color: var(--color-text-primary); }
</style>
