<template>
  <div class="full-city-page">
    <Navbar />

    <div v-if="loading" class="section container"><p class="text-secondary">Loading…</p></div>
    <div v-else-if="error" class="section container"><p class="text-secondary">{{ error }}</p></div>

    <template v-else-if="city">
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

      <section class="section-compact">
        <div class="container">
          <div class="section-header"><span class="section-number">01</span><h2 class="section-title">Members</h2></div>
          <div v-if="city.users?.length" class="members-grid">
            <UserMiniProfile v-for="user in city.users" :key="user.id" :user="user" />
          </div>
          <p v-else class="text-secondary text-sm">No public members in this city yet.</p>
        </div>
      </section>

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

      <template v-if="city.isGenerated">
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

            <!-- Score hero -->
            <div class="score-display">
              <span class="score-number">{{ city.ruralReadinessScore ?? '—' }}</span>
              <span class="score-label text-xs text-tertiary">/ 100</span>
            </div>
            <div class="score-bar-lg">
              <div class="score-fill-lg" :style="{ width: (city.ruralReadinessScore ?? 0) + '%' }"></div>
            </div>

            <!-- Interpretation badge -->
            <div v-if="breakdown" class="interpretation-badge" :class="`interpretation--${breakdown.interpretation.toLowerCase()}`">
              {{ breakdown.interpretation }}
            </div>
            <p v-if="breakdown" class="interpretation-detail text-sm text-secondary">{{ breakdown.interpretationDetail }}</p>

            <!-- Breakdown table -->
            <div v-if="breakdown" class="breakdown-table mt-md">
              <div class="breakdown-header text-xs text-tertiary">
                <span class="col-factor">Factor</span>
                <span class="col-metric">Metric Value</span>
                <span class="col-score">Score</span>
                <span class="col-weight">Weight</span>
                <span class="col-weighted">Weighted</span>
              </div>
              <div class="breakdown-row">
                <div class="col-factor">
                  <span class="factor-name text-sm">Connectivity</span>
                  <span class="factor-sub text-xs text-tertiary">Digital Foundation</span>
                </div>
                <span class="col-metric text-sm">{{ breakdown.connectivity.broadbandPct }}% Broadband (100/20 Mbps)</span>
                <span class="col-score text-sm">{{ breakdown.connectivity.score.toFixed(1) }}</span>
                <span class="col-weight text-sm text-tertiary">0.40</span>
                <span class="col-weighted text-sm">{{ (breakdown.connectivity.score * 0.40).toFixed(1) }}</span>
              </div>
              <div class="breakdown-row">
                <div class="col-factor">
                  <span class="factor-name text-sm">Anchor Points</span>
                  <span class="factor-sub text-xs text-tertiary">Third Place Density</span>
                </div>
                <span class="col-metric text-sm">{{ breakdown.anchorPoints.totalPlaces }} Places ({{ breakdown.anchorPoints.perThousandResidents.toFixed(1) }} per 1k)</span>
                <span class="col-score text-sm">{{ breakdown.anchorPoints.score.toFixed(1) }}</span>
                <span class="col-weight text-sm text-tertiary">0.35</span>
                <span class="col-weighted text-sm">{{ (breakdown.anchorPoints.score * 0.35).toFixed(1) }}</span>
              </div>
              <div class="breakdown-row">
                <div class="col-factor">
                  <span class="factor-name text-sm">Enterprise</span>
                  <span class="factor-sub text-xs text-tertiary">Entrepreneurial Breadth</span>
                </div>
                <span class="col-metric text-sm">~{{ breakdown.enterprise.microEnterprisePct }}% Micro-Enterprise</span>
                <span class="col-score text-sm">{{ breakdown.enterprise.score.toFixed(1) }}</span>
                <span class="col-weight text-sm text-tertiary">0.25</span>
                <span class="col-weighted text-sm">{{ (breakdown.enterprise.score * 0.25).toFixed(1) }}</span>
              </div>
              <div class="breakdown-row breakdown-total">
                <span class="col-factor text-sm" style="font-weight:var(--font-weight-medium)">Total Score</span>
                <span class="col-metric"></span>
                <span class="col-score"></span>
                <span class="col-weight"></span>
                <span class="col-weighted text-sm" style="font-weight:var(--font-weight-medium)">{{ breakdown.totalScore }} / 100</span>
              </div>
            </div>

            <!-- Detailed narrative sections -->
            <div v-if="breakdown" class="readiness-narrative mt-lg">
              <div class="narrative-section">
                <h4 class="narrative-heading">1. Digital Foundation: {{ breakdown.connectivity.score.toFixed(1) }}</h4>
                <p class="text-sm text-secondary narrative-text">{{ breakdown.connectivity.details }}</p>
                <a
                  v-if="breakdown.connectivity.sourceUrl"
                  :href="breakdown.connectivity.sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="source-link text-xs"
                >Source: {{ breakdown.connectivity.source }} ↗</a>
                <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.connectivity.source }}</span>
              </div>

              <div class="narrative-section">
                <h4 class="narrative-heading">2. "Third Place" Density: {{ breakdown.anchorPoints.score.toFixed(1) }}</h4>
                <p class="text-sm text-secondary narrative-text">{{ breakdown.anchorPoints.details }}</p>
                <div v-if="breakdown.anchorPoints.places?.length" class="anchor-places">
                  <span class="text-xs text-tertiary anchor-places-label">Anchor Points Found:</span>
                  <div class="places-grid">
                    <span v-for="place in breakdown.anchorPoints.places" :key="place.name" class="place-tag text-xs">
                      {{ place.name }} <span class="place-type">{{ place.type }}</span>
                    </span>
                  </div>
                </div>
                <span class="source-link text-xs text-tertiary">Source: {{ breakdown.anchorPoints.source }}</span>
              </div>

              <div class="narrative-section">
                <h4 class="narrative-heading">3. Entrepreneurial Breadth: {{ breakdown.enterprise.score.toFixed(1) }}</h4>
                <p class="text-sm text-secondary narrative-text">{{ breakdown.enterprise.details }}</p>
                <a
                  v-if="breakdown.enterprise.sourceUrl"
                  :href="breakdown.enterprise.sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="source-link text-xs"
                >Source: {{ breakdown.enterprise.source }} ↗</a>
                <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.enterprise.source }}</span>
              </div>

              <div v-if="breakdown.narrative" class="narrative-section narrative-summary">
                <h4 class="narrative-heading">Interpretation: {{ breakdown.interpretation }}</h4>
                <p class="text-sm text-secondary narrative-text">{{ breakdown.narrative }}</p>
              </div>
            </div>

            <p v-if="!breakdown" class="text-xs text-tertiary mt-sm">Community engagement readiness index.</p>
          </div>
        </section>

        <section class="section-compact">
          <div class="container">
            <div class="section-header"><span class="section-number">05</span><h2 class="section-title">Wicked Problems</h2></div>
            <CityProblemsList :problems="normalizedProblems" @open-challenge="openChallenge" />
          </div>
        </section>

        <SlideInModal v-model="showChallengeModal" sidebar-width="0px">
          <div class="modal-close-bar">
            <button class="modal-close-btn" @click="showChallengeModal = false">✕</button>
          </div>
          <FullChallengePage
            v-if="selectedChallengeId"
            :challenge-data="selectedChallenge"
            :is-modal="true"
          />
        </SlideInModal>

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
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import UserMiniProfile from '@/components/city/UserMiniProfile.vue'
import SlideInModal from '@/components/SlideInModal.vue'
import FullChallengePage from '@/views/FullChallengePage.vue'
import CityProblemsList from '@/components/city/CityProblemsList.vue'
import { useFullCityPage } from '@/composables/useFullCityPage'

const {
  city, loading, error, generating,
  isAuthenticated,
  showChallengeModal, selectedChallengeId, selectedChallenge,
  normalizedProblems, breakdown,
  openChallenge, extractDomain, generate
} = useFullCityPage()
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
.modal-close-bar { display: flex; justify-content: flex-end; padding: 1.5rem 2rem 0; position: sticky; top: 0; z-index: 10; background: var(--color-bg-primary); }
.modal-close-btn { background: none; border: 1px solid rgba(42, 42, 42, 0.12); color: var(--color-text-secondary); font-size: 1rem; cursor: pointer; padding: 0.5rem 0.75rem; transition: all var(--transition-fast); font-family: var(--font-family); }
.modal-close-btn:hover { color: var(--color-text-primary); border-color: var(--color-text-primary); }
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

/* Readiness Breakdown */
.interpretation-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.12);
}
.interpretation--fragile { border-left: 3px solid #c0392b; color: #c0392b; }
.interpretation--emergent { border-left: 3px solid #d4a017; color: #9a7b0a; }
.interpretation--ready { border-left: 3px solid #27ae60; color: #1e8449; }
.interpretation-detail { max-width: 72ch; line-height: 1.7; }

.breakdown-table { max-width: 860px; border: 1px solid rgba(42, 42, 42, 0.08); }
.breakdown-header, .breakdown-row {
  display: grid;
  grid-template-columns: 1.6fr 2fr 0.8fr 0.7fr 0.9fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
}
.breakdown-header {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid rgba(42, 42, 42, 0.1);
  background: rgba(42, 42, 42, 0.03);
}
.breakdown-row { border-bottom: 1px solid rgba(42, 42, 42, 0.06); }
.breakdown-row:last-child { border-bottom: none; }
.breakdown-total { background: rgba(42, 42, 42, 0.03); }
.col-factor { display: flex; flex-direction: column; gap: 0.15rem; }
.factor-name { font-weight: var(--font-weight-medium); }
.factor-sub { line-height: 1.3; }

.readiness-narrative { max-width: 72ch; display: flex; flex-direction: column; gap: 2rem; }
.narrative-section { display: flex; flex-direction: column; gap: 0.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(42, 42, 42, 0.06); }
.narrative-section:last-child { border-bottom: none; }
.narrative-heading { font-size: 1rem; font-weight: var(--font-weight-medium); letter-spacing: -0.01em; }
.narrative-text { line-height: 1.8; }
.narrative-summary { margin-top: 0.5rem; padding: 1.5rem; background: rgba(42, 42, 42, 0.03); border: 1px solid rgba(42, 42, 42, 0.08); }
.source-link { display: inline-block; margin-top: 0.25rem; color: var(--color-text-tertiary); text-decoration: none; transition: color var(--transition-fast); }
a.source-link:hover { color: var(--color-text-primary); }

.anchor-places { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.anchor-places-label { margin-bottom: 0.25rem; }
.places-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.place-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.1);
  color: var(--color-text-secondary);
}
.place-type { color: var(--color-text-tertiary); font-style: italic; }

@media (max-width: 640px) {
  .breakdown-header, .breakdown-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem;
    padding: 0.6rem 0.75rem;
  }
  .col-score, .col-weight { display: none; }
}
</style>
