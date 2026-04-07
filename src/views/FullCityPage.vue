<template>
  <div class="full-city-page">
    <Navbar />

    <div v-if="loading" class="section container"><p class="text-secondary">Loading…</p></div>
    <div v-else-if="error" class="section container"><p class="text-secondary">{{ error }}</p></div>

    <template v-else-if="city">
      <section class="city-hero">
        <img
          v-if="city.imageUrl"
          :src="city.imageUrl"
          :alt="city.name"
          class="hero-image"
        />
        <img
          v-if="city.imageUrl"
          :src="city.imageUrl"
          :alt="city.name"
          class="hero-image-blurred"
        />
        <div class="gradient-overlay"></div>
        <div class="container hero-content">
          <div class="hero-left">
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

          <!-- Readiness Score Preview -->
          <div v-if="city.isGenerated && breakdown" class="hero-readiness">
            <div class="hero-score-row">
              <span class="hero-score-number">{{ city.ruralReadinessScore ?? '—' }}</span>
              <span class="hero-score-label text-sm text-tertiary">/ 100</span>
              <span class="hero-score-title text-xs text-tertiary">Rural Readiness</span>
            </div>
            <div class="hero-score-bar">
              <div class="hero-score-fill" :style="{ width: (city.ruralReadinessScore ?? 0) + '%' }"></div>
            </div>
            <div class="interpretation-badge hero-interpretation-badge" :class="interpretationClass">
              {{ breakdown.interpretation }}
            </div>
          </div>
        </div>
      </section>

      <template v-if="city.isGenerated">
        <section class="section-compact">
          <div class="container">
            <div class="section-header"><span class="section-number"></span><h2 class="section-title">History</h2></div>
            <p class="body-text text-secondary">{{ city.history }}</p>
          </div>
        </section>
      </template>

      <section class="section-compact alt-section">
        <div class="container">
          <div class="section-header"><span class="section-number"></span><h2 class="section-title">Public Playbooks</h2></div>
          <div v-if="city.playbooks?.length" class="list-grid">
            <router-link v-for="p in city.playbooks" :key="p.id" :to="`/dashboard/playbooks/${p.id}`" class="list-item">
              <span class="item-name text-sm">{{ p.patternTitle }}</span>
              <span class="item-desc text-xs text-tertiary">{{ p.status }} · {{ p.progress }}% complete</span>
            </router-link>
          </div>
          <p v-else class="text-secondary text-sm">No public playbooks for this city yet.</p>
        </div>
      </section>

      <section class="section-compact">
        <div class="container">
          <div class="section-header"><span class="section-number"></span><h2 class="section-title">Members</h2></div>
          <div v-if="city.users?.length" class="members-grid">
            <button v-for="user in city.users" :key="user.id" class="member-btn" @click="openMemberProfile(user.id)">
              <UserMiniProfile :user="user" />
            </button>
          </div>
          <p v-else class="text-secondary text-sm">No public members in this city yet.</p>
        </div>
      </section>

      <SlideInModal v-model="showMemberModal" sidebar-width="0px">
        <div class="modal-close-bar">
          <button class="modal-close-btn" @click="showMemberModal = false">✕</button>
        </div>
        <ProfilePage
          v-if="memberProfile"
          :profile="memberProfile"
          :is-own-profile="false"
        />
        <div v-else-if="memberLoading" class="member-loading">
          <p class="text-sm text-secondary">Loading profile…</p>
        </div>
      </SlideInModal>

      <template v-if="city.isGenerated">
        <!-- Readiness Score -->
        <section class="section-compact alt-section">
          <div class="container">
            <div class="section-header"><span class="section-number"></span><h2 class="section-title">Rural Readiness</h2></div>

            <!-- Score hero -->
            <div class="score-display">
              <span class="score-number">{{ city.ruralReadinessScore ?? '—' }}</span>
              <span class="score-label text-xs text-tertiary">/ 100</span>
            </div>
            <div class="score-bar-lg">
              <div class="score-fill-lg" :style="{ width: (city.ruralReadinessScore ?? 0) + '%' }"></div>
            </div>

            <!-- Interpretation badge -->
            <div v-if="breakdown" class="interpretation-badge" :class="interpretationClass">
              {{ breakdown.interpretation }}
            </div>
            <p v-if="breakdown" class="interpretation-detail text-sm text-secondary">{{ breakdown.interpretationDetail }}</p>

            <!-- Detailed narrative sections — 6 weighted factors + Prosperity Buffer -->
            <div v-if="breakdown" class="readiness-narrative mt-lg">

              <!-- Factor 1: Connectivity (15%) -->
              <div class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('connectivity')">
                  <div class="toggle-left">
                    <span class="category-badge category--connectivity text-xs">Connectivity</span>
                    <h4 class="narrative-heading">Digital Root Access</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">15%</span> {{ (breakdown.connectivity?.score * 0.15).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.connectivity?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.connectivity }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.connectivity }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      {{ breakdown.connectivity?.broadbandPct }}% Broadband (100/20 Mbps)
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.connectivity?.details }}</p>
                    <div v-if="breakdown.connectivity?.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.connectivity.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <a v-if="breakdown.connectivity?.sourceUrl" :href="breakdown.connectivity.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link text-xs">Source: {{ breakdown.connectivity.source }} ↗</a>
                    <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.connectivity?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Factor 2: Economy (15%) -->
              <div class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('economy')">
                  <div class="toggle-left">
                    <span class="category-badge category--economy text-xs">Economy</span>
                    <h4 class="narrative-heading">Micro-Business Density</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">15%</span> {{ (breakdown.economy?.score * 0.15).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.economy?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.economy }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.economy }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      {{ breakdown.economy?.microBusinessDensity }} per 1k residents ({{ breakdown.economy?.smallEstablishments }} of {{ breakdown.economy?.totalEstablishments }} total)
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.economy?.details }}</p>
                    <div v-if="breakdown.economy?.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.economy.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <a v-if="breakdown.economy?.sourceUrl" :href="breakdown.economy.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link text-xs">Source: {{ breakdown.economy.source }} ↗</a>
                    <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.economy?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Factor 3: Social (15%) -->
              <div class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('social')">
                  <div class="toggle-left">
                    <span class="category-badge category--social text-xs">Social</span>
                    <h4 class="narrative-heading">Anchor Point Density</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">15%</span> {{ (breakdown.social?.score * 0.15).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.social?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.social }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.social }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      {{ breakdown.social?.totalPlaces }} Anchor Points ({{ breakdown.social?.anchorRatio?.toFixed(2) }} per 500 residents)
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.social?.details }}</p>
                    <div v-if="breakdown.social?.places?.length" class="anchor-places">
                      <span class="text-xs text-tertiary anchor-places-label">Anchor Points Found:</span>
                      <div class="places-grid">
                        <span v-for="place in breakdown.social.places" :key="place.name" class="place-tag text-xs">
                          {{ place.name }} <span class="place-type">{{ place.type }}</span>
                        </span>
                      </div>
                    </div>
                    <div v-if="breakdown.social?.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.social.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <span class="source-link text-xs text-tertiary">Source: {{ breakdown.social?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Factor 4: Housing (15%) -->
              <div class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('housing')">
                  <div class="toggle-left">
                    <span class="category-badge category--housing text-xs">Housing</span>
                    <h4 class="narrative-heading">Rent Affordability</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">15%</span> {{ (breakdown.housing?.score * 0.15).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.housing?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.housing }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.housing }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      {{ breakdown.housing?.costBurdenRate }}% Cost-Burdened Renters (&gt;30% income on rent)
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.housing?.details }}</p>
                    <div v-if="breakdown.housing?.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.housing.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <a v-if="breakdown.housing?.sourceUrl" :href="breakdown.housing.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link text-xs">Source: {{ breakdown.housing.source }} ↗</a>
                    <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.housing?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Factor 5: Health (10%) -->
              <div class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('health')">
                  <div class="toggle-left">
                    <span class="category-badge category--health text-xs">Health</span>
                    <h4 class="narrative-heading">Clinical Reliability</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">10%</span> {{ (breakdown.health?.score * 0.10).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.health?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.health }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.health }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      HPSA Score: {{ breakdown.health?.hpsaScore }}/25
                      <span v-if="breakdown.health?.isShortageArea" class="shortage-badge text-xs">Shortage Area</span>
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.health?.details }}</p>
                    <div v-if="breakdown.health?.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.health.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <a v-if="breakdown.health?.sourceUrl" :href="breakdown.health.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link text-xs">Source: {{ breakdown.health.source }} ↗</a>
                    <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.health?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Factor 6: Talent (15%) -->
              <div class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('talent')">
                  <div class="toggle-left">
                    <span class="category-badge category--talent text-xs">Talent</span>
                    <h4 class="narrative-heading">Innovation Base</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">15%</span> {{ (breakdown.talent?.score * 0.15).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.talent?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.talent }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.talent }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      {{ breakdown.talent?.bachelorsPct }}% with Bachelor's Degree or Higher
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.talent?.details }}</p>
                    <div v-if="breakdown.talent?.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.talent.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <a v-if="breakdown.talent?.sourceUrl" :href="breakdown.talent.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link text-xs">Source: {{ breakdown.talent.source }} ↗</a>
                    <span v-else class="source-link text-xs text-tertiary">Source: {{ breakdown.talent?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- Factor 7: Prosperity (15%) -->
              <div v-if="breakdown.prosperity" class="narrative-section">
                <button class="narrative-toggle" @click="toggleSection('prosperity')">
                  <div class="toggle-left">
                    <span class="category-badge category--prosperity text-xs">Prosperity</span>
                    <h4 class="narrative-heading">Economic Mobility</h4>
                  </div>
                  <div class="toggle-right">
                    <div class="toggle-scores">
                      <span class="score-item text-sm"><span class="score-label text-xs text-tertiary">15%</span> {{ (breakdown.prosperity?.score * 0.15).toFixed(1) }}</span>
                      <span class="score-divider text-tertiary">·</span>
                      <span class="score-item text-sm text-tertiary"><span class="score-label text-xs">Raw</span> {{ breakdown.prosperity?.score?.toFixed(1) }}</span>
                    </div>
                    <span class="toggle-icon" :class="{ 'toggle-icon--open': expandedSections.prosperity }"></span>
                  </div>
                </button>
                <div class="narrative-body" :class="{ 'narrative-body--open': expandedSections.prosperity }">
                  <div class="narrative-body-inner">
                    <div class="metric-row text-sm text-secondary">
                      <span class="metric-label text-xs text-tertiary">Metric</span>
                      Prosperity Ratio: {{ breakdown.prosperity.ratio }}% · Median Income: ${{ breakdown.prosperity.medianIncome?.toLocaleString() }}
                      <span class="prosperity-status-badge text-xs" :class="prosperityStatusClass">{{ breakdown.prosperity.status }}</span>
                    </div>
                    <div class="prosperity-scale">
                      <div class="scale-bar">
                        <div class="scale-fill" :style="{ width: Math.min(100, breakdown.prosperity.ratio / 4.5) + '%' }"></div>
                        <div class="scale-marker" :style="{ left: Math.min(100, breakdown.prosperity.ratio / 4.5) + '%' }"></div>
                      </div>
                      <div class="scale-labels text-xs text-tertiary">
                        <span>&lt;150% Survival</span>
                        <span>250% Stability</span>
                        <span>400% Growth</span>
                        <span>450%+ Investment</span>
                      </div>
                    </div>
                    <p class="text-sm text-secondary narrative-text">{{ breakdown.prosperity.details }}</p>
                    <div v-if="breakdown.prosperity.suggestedPatterns?.length" class="suggested-patterns">
                      <span class="text-xs text-tertiary">Suggested:</span>
                      <span v-for="p in breakdown.prosperity.suggestedPatterns" :key="p" class="pattern-tag text-xs">{{ p }}</span>
                    </div>
                    <a v-if="breakdown.prosperity.sourceUrl" :href="breakdown.prosperity.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link text-xs">Source: {{ breakdown.prosperity.source }} ↗</a>
                  </div>
                </div>
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
            <div class="section-header"><span class="section-number"></span><h2 class="section-title">Wicked Problems</h2></div>
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
            <div class="section-header"><span class="section-number"></span><h2 class="section-title">Resources</h2></div>
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
import { reactive, computed, ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import UserMiniProfile from '@/components/city/UserMiniProfile.vue'
import SlideInModal from '@/components/SlideInModal.vue'
import FullChallengePage from '@/views/FullChallengePage.vue'
import CityProblemsList from '@/components/city/CityProblemsList.vue'
import ProfilePage from '@/views/dashboard/ProfilePage.vue'
import { usersApi } from '@/services/api'
import { useFullCityPage } from '@/composables/useFullCityPage'

const {
  city, loading, error, generating,
  isAuthenticated,
  showChallengeModal, selectedChallengeId, selectedChallenge,
  normalizedProblems, breakdown,
  openChallenge, extractDomain, generate
} = useFullCityPage()

type SectionKey = 'connectivity' | 'economy' | 'social' | 'housing' | 'health' | 'talent' | 'prosperity'

const showMemberModal = ref(false)
const memberProfile = ref<any>(null)
const memberLoading = ref(false)

async function openMemberProfile(userId: number) {
  showMemberModal.value = true
  memberLoading.value = true
  memberProfile.value = null
  try {
    memberProfile.value = await usersApi.getProfile(userId)
  } catch (err) {
    console.error('Failed to load member profile:', err)
  } finally {
    memberLoading.value = false
  }
}

const expandedSections = reactive<Record<SectionKey, boolean>>({
  connectivity: false,
  economy: false,
  social: false,
  housing: false,
  health: false,
  talent: false,
  prosperity: false,
})

function toggleSection(key: SectionKey) {
  expandedSections[key] = !expandedSections[key]
}

const interpretationClass = computed(() => {
  const score = city.value?.ruralReadinessScore ?? 0
  if (score <= 25) return 'interpretation--emerging'
  if (score <= 50) return 'interpretation--developing'
  if (score <= 75) return 'interpretation--established'
  return 'interpretation--leading'
})

const prosperityStatusClass = computed(() => {
  const status = breakdown.value?.prosperity?.status ?? ''
  if (status.includes('Survival')) return 'prosperity--survival'
  if (status.includes('Stability')) return 'prosperity--stability'
  if (status.includes('Growth')) return 'prosperity--growth'
  if (status.includes('Investment')) return 'prosperity--investment'
  return ''
})
</script>

<style scoped>
.full-city-page {
  counter-reset: section-counter;
}

.city-hero {
  padding: 12rem var(--container-padding) 6rem;
  position: relative;
  overflow: hidden;
  background: var(--color-bg-primary);
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  z-index: 0;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%);
}

.hero-image-blurred {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) blur(12px);
  z-index: 0;
  mask-image: linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, transparent 100%);
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(135deg,
      rgba(232, 180, 160, 0.55) 0%,
      rgba(184, 212, 200, 0.55) 25%,
      rgba(201, 184, 232, 0.55) 50%,
      rgba(184, 212, 200, 0.55) 75%,
      rgba(232, 180, 160, 0.55) 100%),
    linear-gradient(180deg, transparent 0%, var(--color-bg-primary) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 3rem;
  padding: 0;
}

.hero-left {
  flex: 1;
  min-width: 0;
}

.hero-label { letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1rem; display: block; }
.hero-title { font-size: clamp(2.5rem, 6vw, 5rem); font-weight: var(--font-weight-light); letter-spacing: -0.03em; margin-bottom: 1rem; }
.hero-meta { display: flex; gap: 0.75rem; align-items: center; }
.meta-sep { color: var(--color-text-tertiary); }

/* Readiness Score Preview */
.hero-readiness {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.hero-score-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.hero-score-number {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.04em;
}

.hero-score-label {
  margin-right: 0.25rem;
}

.hero-score-title {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-score-bar {
  height: 5px;
  background: rgba(42, 42, 42, 0.12);
  width: 100%;
}

.hero-score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  transition: width 0.6s ease;
}

.hero-factors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.factor-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.factor-badge {
  padding: 0.3rem 0.85rem;
  border: 1px solid rgba(42, 42, 42, 0.2);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: rgba(253, 251, 247, 0.6);
  backdrop-filter: blur(4px);
}

.factor-score {
  font-weight: var(--font-weight-medium);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.not-generated { margin-top: 1.5rem; }
.not-generated a { color: var(--color-text-primary); }

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-readiness {
    align-items: flex-start;
    margin-top: 1.5rem;
  }
}
.alt-section { background: var(--color-bg-secondary); }
.body-text { max-width: 860px; line-height: 1.8; }
.score-display { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1rem; }
.score-number { font-size: 4rem; font-weight: var(--font-weight-light); letter-spacing: -0.04em; }
.score-bar-lg { height: 6px; background: rgba(42, 42, 42, 0.1); max-width: 360px; }
.score-fill-lg { height: 100%; background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3)); transition: width 0.6s ease; }
.modal-close-bar { display: flex; justify-content: flex-end; padding: 1.5rem 2rem 0; position: sticky; top: 0; z-index: 10; background: var(--color-bg-primary); }
.modal-close-btn { background: none; border: 1px solid rgba(42, 42, 42, 0.12); color: var(--color-text-secondary); font-size: 1rem; cursor: pointer; padding: 0.5rem 0.75rem; transition: all var(--transition-fast); font-family: var(--font-family); }
.modal-close-btn:hover { color: var(--color-text-primary); border-color: var(--color-text-primary); }
.members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1px; background: rgba(42, 42, 42, 0.06); }
.member-btn { all: unset; cursor: pointer; display: block; width: 100%; transition: opacity var(--transition-fast); }
.member-btn:hover { opacity: 0.7; }
.member-loading { display: flex; align-items: center; justify-content: center; padding: 4rem 2rem; }
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
.interpretation--emerging { border-left: 3px solid #c0392b; color: #c0392b; }
.interpretation--developing { border-left: 3px solid #d4a017; color: #9a7b0a; }
.interpretation--established { border-left: 3px solid #2980b9; color: #2471a3; }
.interpretation--leading { border-left: 3px solid #27ae60; color: #1e8449; }
.interpretation-detail { max-width: 860px; line-height: 1.7; }
.hero-interpretation-badge { align-self: flex-start; margin-top: 0; }

.readiness-narrative { max-width: 860px; display: flex; flex-direction: column; gap: 0; interpolate-size: allow-keywords; }
.narrative-section { border-bottom: 1px solid rgba(42, 42, 42, 0.08); }
.narrative-section:last-child { border-bottom: none; }
.narrative-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 1.5rem 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family);
  color: var(--color-text-primary);
  text-align: left;
  transition: opacity var(--transition-fast);
}
.narrative-toggle:hover { opacity: 0.7; }

.toggle-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.toggle-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.toggle-scores {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.score-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.score-divider {
  user-select: none;
}

.narrative-heading { font-size: 1rem; font-weight: var(--font-weight-medium); letter-spacing: -0.01em; margin: 0; white-space: nowrap; }

/* Category badges — each a different color */
.category-badge {
  padding: 0.25rem 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.category--connectivity { background: rgba(41, 128, 185, 0.1); color: #2471a3; border: 1px solid rgba(41, 128, 185, 0.25); }
.category--economy { background: rgba(39, 174, 96, 0.1); color: #1e8449; border: 1px solid rgba(39, 174, 96, 0.25); }
.category--social { background: rgba(142, 68, 173, 0.1); color: #7d3c98; border: 1px solid rgba(142, 68, 173, 0.25); }
.category--housing { background: rgba(211, 84, 0, 0.1); color: #a04000; border: 1px solid rgba(211, 84, 0, 0.25); }
.category--health { background: rgba(192, 57, 43, 0.1); color: #922b21; border: 1px solid rgba(192, 57, 43, 0.25); }
.category--talent { background: rgba(44, 62, 80, 0.1); color: #2c3e50; border: 1px solid rgba(44, 62, 80, 0.25); }
.category--prosperity { background: rgba(212, 172, 13, 0.1); color: #9a7b0a; border: 1px solid rgba(212, 172, 13, 0.25); }

/* Animated toggle icon — CSS-only +/− via pseudo-elements */
.toggle-icon {
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}
.toggle-icon::before,
.toggle-icon::after {
  content: '';
  position: absolute;
  background: var(--color-text-tertiary);
  transition: transform 0.3s ease, opacity 0.3s ease;
}
/* Horizontal bar (always visible) */
.toggle-icon::before {
  top: 50%;
  left: 25%;
  width: 50%;
  height: 1.5px;
  transform: translateY(-50%);
}
/* Vertical bar (rotates out when open) */
.toggle-icon::after {
  top: 25%;
  left: 50%;
  width: 1.5px;
  height: 50%;
  transform: translateX(-50%) scaleY(1);
}
.toggle-icon--open::after {
  transform: translateX(-50%) scaleY(0);
  opacity: 0;
}

/* Animated expand/collapse via interpolate-size */
.narrative-body {
  height: 0;
  opacity: 0;
  overflow: hidden;
  transition: height 0.35s ease, opacity 0.3s ease;
}
.narrative-body--open {
  height: auto;
  opacity: 1;
}
.narrative-body-inner {
  padding: 0 0 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: rgba(42, 42, 42, 0.03);
  border: 1px solid rgba(42, 42, 42, 0.06);
  line-height: 1.5;
}
.metric-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.narrative-text { line-height: 1.8; max-width: 860px; }
.narrative-summary { padding: 1.5rem; background: rgba(42, 42, 42, 0.03); border: 1px solid rgba(42, 42, 42, 0.08); margin-top: 1rem; }
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

/* Suggested patterns */
.suggested-patterns { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.25rem; }
.pattern-tag {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  background: rgba(142, 68, 173, 0.06);
  border: 1px solid rgba(142, 68, 173, 0.15);
  color: #7d3c98;
}

/* Shortage area badge */
.shortage-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: rgba(192, 57, 43, 0.1);
  color: #c0392b;
  border: 1px solid rgba(192, 57, 43, 0.25);
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Prosperity Buffer section */
.prosperity-section { border-top: 2px solid rgba(212, 172, 13, 0.2); margin-top: 0.5rem; }
.prosperity-status-badge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid rgba(42, 42, 42, 0.12);
}
.prosperity--survival { background: rgba(192, 57, 43, 0.1); color: #c0392b; border-color: rgba(192, 57, 43, 0.25); }
.prosperity--stability { background: rgba(212, 172, 13, 0.1); color: #9a7b0a; border-color: rgba(212, 172, 13, 0.25); }
.prosperity--growth { background: rgba(41, 128, 185, 0.1); color: #2471a3; border-color: rgba(41, 128, 185, 0.25); }
.prosperity--investment { background: rgba(39, 174, 96, 0.1); color: #1e8449; border-color: rgba(39, 174, 96, 0.25); }

/* Prosperity scale bar */
.prosperity-scale { margin: 0.75rem 0; }
.scale-bar {
  position: relative;
  height: 6px;
  background: rgba(42, 42, 42, 0.1);
  max-width: 400px;
}
.scale-fill {
  height: 100%;
  background: linear-gradient(90deg, #c0392b, #d4a017, #2980b9, #27ae60);
  transition: width 0.6s ease;
}
.scale-marker {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 12px;
  background: var(--color-text-primary);
  transform: translateX(-50%);
  transition: left 0.6s ease;
}
.scale-labels {
  display: flex;
  justify-content: space-between;
  max-width: 400px;
  margin-top: 0.35rem;
}

@media (max-width: 640px) {
  .toggle-left { flex-direction: column; gap: 0.5rem; }
  .narrative-toggle { gap: 1rem; }
  .scale-labels { font-size: 0.6rem; }
}
</style>
