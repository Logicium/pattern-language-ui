<template>
  <div class="events-page">
    <PageHero
      label="Gatherings"
      title="Events"
      subtitle="Workshops, walkthroughs, and working sessions — online and across Southern Colorado."
    />

    <!-- Featured: the next working session -->
    <section v-if="featured" class="section-compact">
      <div class="container">
        <div class="section-header">
          <span class="section-number"></span>
          <h2 class="section-title">Next up</h2>
        </div>

        <div class="featured">
          <div class="featured-main">
            <div class="featured-date">
              <span class="featured-month">{{ monthLabel(featured.date) }}</span>
              <span class="featured-day">{{ dayLabel(featured.date) }}</span>
              <span class="featured-year">{{ yearLabel(featured.date) }}</span>
            </div>
            <div class="featured-body">
              <p class="event-eyebrow text-xs">
                {{ featured.location }}
                <template v-if="featured.timeLabel"> · {{ featured.timeLabel }}</template>
              </p>
              <h3 class="featured-title">{{ featured.title }}</h3>
              <p class="featured-desc text-secondary">{{ featured.description }}</p>
            </div>
          </div>

          <div class="signup">
            <template v-if="!signupDone">
              <p class="signup-lede">Save me a seat</p>
              <form class="signup-form" @submit.prevent="submitSignup">
                <input
                  v-model="signupForm.name"
                  type="text"
                  class="form-input"
                  placeholder="Your name"
                  required
                  maxlength="120"
                />
                <input
                  v-model="signupForm.email"
                  type="email"
                  class="form-input"
                  placeholder="Email"
                  required
                />
                <input
                  v-model="signupForm.organization"
                  type="text"
                  class="form-input"
                  placeholder="Organization or community (optional)"
                  maxlength="160"
                />
                <p v-if="signupError" class="signup-error text-sm">{{ signupError }}</p>
                <button type="submit" class="btn" :disabled="signingUp">
                  {{ signingUp ? 'Signing you up…' : 'Sign up' }}
                </button>
              </form>
              <p class="signup-note text-sm text-tertiary">
                We'll email the venue and agenda as the date gets closer. No spam, ever.
              </p>
            </template>
            <template v-else>
              <p class="signup-lede">You're on the list.</p>
              <p class="text-sm text-secondary">
                See you in Cañon City on September 19 — details land in your inbox soon.
              </p>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Calendar of everything upcoming -->
    <section class="section-compact">
      <div class="container">
        <div class="section-header">
          <span class="section-number"></span>
          <h2 class="section-title">Calendar</h2>
        </div>

        <div v-for="group in calendar" :key="group.month" class="month-group">
          <h3 class="month-label text-xs">{{ group.month }}</h3>
          <article v-for="event in group.events" :key="event.slug" class="event-row">
            <div class="event-when">
              <span class="event-day">{{ dayLabel(event.date) }}</span>
              <span v-if="event.endDate" class="event-day-range">–{{ dayLabel(event.endDate) }}</span>
            </div>
            <div class="event-info">
              <p class="event-eyebrow text-xs">
                {{ event.location }}
                <template v-if="event.timeLabel"> · {{ event.timeLabel }}</template>
              </p>
              <h4 class="event-title">
                {{ event.title }}
              </h4>
              <p class="event-desc text-sm text-secondary">{{ event.description }}</p>
              <div class="event-links">
                <a
                  v-if="event.url"
                  :href="event.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="event-link text-xs"
                >Event site <span class="chevron" aria-hidden="true"
                /></a>
                <button
                  v-if="event.signupOpen && event.slug !== featured?.slug"
                  class="event-link text-xs"
                  @click="scrollToTop"
                >Sign up above</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { PageHero, CTASection, Footer } from '@/components'
import { events, type CommunityEvent } from '@/data/events'
import { eventsApi } from '@/services/api'
import { useSeo } from '@/composables/useSeo'

useSeo({
  title: 'Events',
  description:
    'Upcoming Pattern Language gatherings — the Cañon City workshop on September 19, live PAL walkthroughs, and Hack Trinidad Forward 2026.',
  path: '/events'
})

const featured = computed<CommunityEvent | undefined>(() => {
  const today = new Date().toISOString().slice(0, 10)
  return events.find((e) => e.featured && e.date >= today) ?? events.find((e) => e.featured)
})

// Upcoming events (including multi-day ones still in progress), grouped by month.
const calendar = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = [...events]
    .filter((e) => (e.endDate ?? e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  const groups: Array<{ month: string; events: CommunityEvent[] }> = []
  for (const event of upcoming) {
    const month = new Date(`${event.date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
    const group = groups.find((g) => g.month === month)
    if (group) group.events.push(event)
    else groups.push({ month, events: [event] })
  }
  return groups
})

function monthLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short' })
}
function dayLabel(date: string) {
  return String(new Date(`${date}T12:00:00`).getDate())
}
function yearLabel(date: string) {
  return String(new Date(`${date}T12:00:00`).getFullYear())
}

const signupForm = reactive({ name: '', email: '', organization: '' })
const signingUp = ref(false)
const signupDone = ref(false)
const signupError = ref('')

async function submitSignup() {
  if (!featured.value || signingUp.value) return
  signingUp.value = true
  signupError.value = ''
  try {
    await eventsApi.signup({
      eventSlug: featured.value.slug,
      name: signupForm.name,
      email: signupForm.email,
      organization: signupForm.organization || undefined
    })
    signupDone.value = true
  } catch (e) {
    signupError.value = e instanceof Error ? e.message : 'Something went wrong — please try again.'
  } finally {
    signingUp.value = false
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.featured {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 5rem);
  border: 1px solid var(--hairline-strong);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3)) 1;
  padding: clamp(1.5rem, 3vw, 3rem);
}

.featured-main {
  display: flex;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.featured-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 4.5rem;
  height: fit-content;
  padding: 0.9rem 1rem;
  border: 1px solid var(--hairline-strong);
}

.featured-month {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-accent-warm);
}

.featured-day {
  font-size: 2.25rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
}

.featured-year {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
}

.event-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-text-tertiary);
  margin: 0 0 0.5rem;
}

.featured-title {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
}

.featured-desc {
  margin: 0;
  line-height: 1.65;
  max-width: 52ch;
}

.signup {
  border-left: 1px solid var(--hairline);
  padding-left: clamp(1.5rem, 3vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.signup-lede {
  font-size: 1.1rem;
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.signup-error {
  color: var(--color-accent-warm);
  margin: 0;
}

.signup-note {
  margin: 0;
}

.month-group {
  margin-bottom: 3rem;
}

.month-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
  border-bottom: 1px solid var(--hairline);
  padding-bottom: 0.6rem;
  margin: 0 0 0.5rem;
}

.event-row {
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 2.5rem);
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--hairline);
}

.event-when {
  display: flex;
  align-items: baseline;
  gap: 0.1rem;
}

.event-day {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
}

.event-day-range {
  font-size: 1.1rem;
  color: var(--color-text-tertiary);
}

.event-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin: 0 0 0.5rem;
}

.event-desc {
  margin: 0 0 0.75rem;
  max-width: 68ch;
  line-height: 1.6;
}

.event-links {
  display: flex;
  gap: 1.5rem;
}

.event-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-primary);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-bottom: 1px solid var(--hairline-strong);
  padding-bottom: 2px;
  transition: border-color var(--transition-fast);
}

.event-link:hover {
  border-bottom-color: var(--color-text-primary);
}

@media (max-width: 900px) {
  .featured {
    grid-template-columns: 1fr;
  }

  .signup {
    border-left: none;
    border-top: 1px solid var(--hairline);
    padding-left: 0;
    padding-top: 1.5rem;
  }
}

@media (max-width: 600px) {
  .featured-main {
    flex-direction: column;
  }

  .event-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
