<template>
  <div class="about-page">
    <section ref="hero" class="about-hero gradient-bg">
      <RibbonCanvas />
      <div class="container">
        <h1 class="hero-title">Small towns already know how to fix themselves.</h1>
        <div class="hero-row">
          <p class="hero-lede">
            Pattern Language writes that knowledge down: fifty proven moves from the towns that made them, an AI
            partner that knows every one, and a method that turns one hard conversation into a ninety-day plan.
          </p>
          <dl class="hero-meta">
            <div>
              <dt>Home</dt>
              <dd>Trinidad, Colorado</dd>
            </div>
            <div>
              <dt>Made by</dt>
              <dd>Emergent Campus and Apotome Labs</dd>
            </div>
            <div>
              <dt>After</dt>
              <dd>Christopher Alexander</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <section class="panel origin" aria-labelledby="origin-title">
      <div class="panel__in" v-reveal>
        <div class="two">
          <h2 id="origin-title" class="panel__title">Where it comes from.</h2>
          <div class="origin__body">
            <p class="lede fade" style="--i: 0">
              Pattern Language began at Emergent Campus in Trinidad, Colorado, where ten years of community work kept
              teaching the same lesson: the towns that come back are the ones that can name what worked, and do it
              again.
            </p>
            <p class="body fade" style="--i: 1">
              Christopher Alexander showed that design wisdom can be written down as patterns, each one a problem, a
              context and a proven answer, and that patterns combine into a language. We brought that idea to the
              places that need it most. Fifty patterns, each drawn from a town where it worked, an AI partner called
              PAL that knows all of them, and a way for any community to put them together into a plan with a name
              and a date on every line.
            </p>
          </div>
        </div>
        <dl class="ledger fade" style="--i: 2">
          <div>
            <dd>50</dd>
            <dt>Patterns</dt>
          </div>
          <div>
            <dd>{{ storyCount }}</dd>
            <dt>Stories</dt>
          </div>
          <div>
            <dd>{{ townCount }}</dd>
            <dt>Towns</dt>
          </div>
          <div>
            <dd>90</dd>
            <dt>Days to a plan</dt>
          </div>
        </dl>
      </div>
    </section>

    <section class="panel ink" data-nav="dark" aria-labelledby="work-title">
      <div class="panel__in" v-reveal>
        <h2 id="work-title" class="panel__title">How we work.</h2>
        <ol class="creed">
          <li v-for="(p, i) in principles" :key="p.id" class="creed__item fade" :style="{ '--i': i + 1 }">
            <span class="creed__num">{{ String(p.id).padStart(2, '0') }}</span>
            <h3 class="creed__line">{{ p.title }}</h3>
            <p class="creed__text">{{ p.description }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="panel quote" aria-label="Christopher Alexander on pattern languages">
      <div class="panel__in" v-reveal>
        <blockquote class="pull">
          <p class="pull__text fade" style="--i: 0">
            “A pattern language gives each person who uses it the power to create an infinite variety of new and
            unique buildings, just as their language gives them the power to create an infinite variety of
            sentences.”
          </p>
          <footer class="pull__who fade" style="--i: 1">Christopher Alexander, A Pattern Language, 1977</footer>
        </blockquote>
      </div>
    </section>

    <section class="panel people" aria-labelledby="people-title">
      <div class="panel__in" v-reveal>
        <div class="two">
          <h2 id="people-title" class="panel__title">Who we are.</h2>
          <p class="lede fade" style="--i: 0">
            Two people in Trinidad, and a network of rural leaders who co-wrote the patterns and keep testing them.
          </p>
        </div>
        <ol class="roster">
          <li v-for="(m, i) in team" :key="m.id" class="roster__row fade" :style="{ '--i': i + 1 }">
            <span class="roster__num">{{ String(m.id).padStart(2, '0') }}</span>
            <div class="roster__who">
              <h3 class="roster__name">{{ m.name }}</h3>
              <span class="roster__role">{{ m.role }}</span>
            </div>
            <p class="roster__bio">
              {{ m.bio }}
              <a v-if="m.link" :href="m.link.url" class="roster__link" target="_blank" rel="noopener">{{
                m.link.label
              }}</a>
            </p>
          </li>
        </ol>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Footer, CTASection, RibbonCanvas } from '@/components'
import { vReveal } from '@/directives/reveal'
import { usePinnedHero } from '@/composables/usePinnedHero'
import { principles, teamMembers } from '@/utils/data'
import { allStories } from '@/utils/data/stories'

/**
 * The About page: who makes Pattern Language, where it comes from and how we
 * work, in the home page's panel language. The hero holds while the panels
 * slide over it; headings stay put and the supporting copy comes up as each
 * panel arrives.
 */
const hero = ref<HTMLElement | null>(null)
usePinnedHero(hero)

const team = teamMembers
const storyCount = computed(() => allStories.length)
const townCount = computed(() => new Set(allStories.map((s) => s.location)).size)
</script>

<style scoped>
.about-page {
  min-height: 100vh;
}

/* ---------------------------------------------------------------- hero */
.about-hero {
  min-height: var(--hero-min);
  padding: 12rem var(--container-padding) 6rem;
  position: relative;
  overflow: hidden;
}

.about-hero .container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  padding: 0;
}

.hero-title {
  max-width: 14ch;
  margin: 0 0 3rem;
  font-size: clamp(2.8rem, 1rem + 5vw, 6rem);
  font-weight: var(--font-weight-light);
  line-height: 0.98;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(16rem, 2fr);
  gap: 3rem 6rem;
  align-items: start;
}

.hero-lede {
  max-width: 44ch;
  margin: 0;
  font-size: clamp(1.1rem, 1rem + 0.5vw, 1.35rem);
  font-weight: var(--font-weight-normal);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.hero-meta {
  margin: 0;
  border-top: 1px solid var(--hairline-strong);
}

.hero-meta > div {
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--hairline-strong);
}

.hero-meta dt {
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  padding-top: 0.2rem;
}

.hero-meta dd {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* --------------------------------------------------------------- panels */
.panel {
  position: relative;
  padding: 9rem var(--container-padding);
}

.panel__in {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.panel__title {
  max-width: 12ch;
  margin: 0;
  font-size: clamp(2.4rem, 1rem + 3.8vw, 4.6rem);
  font-weight: var(--font-weight-light);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.two {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 3rem 6rem;
  align-items: start;
}

.lede {
  margin: 0;
  font-size: 1.2rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.6;
  color: var(--color-text-primary);
}

.body {
  margin: 1.5rem 0 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

/* origin: the story, then the numbers */
.origin {
  background: var(--color-bg-primary);
}

.ledger {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 5rem 0 0;
  border-top: 1px solid var(--hairline-strong);
  border-bottom: 1px solid var(--hairline-strong);
}

.ledger > div {
  padding: 2.2rem 2rem 2rem 0;
}

.ledger > div + div {
  padding-left: 2rem;
  border-left: 1px solid var(--hairline-strong);
}

.ledger dd {
  margin: 0 0 0.6rem;
  font-size: clamp(2.6rem, 1rem + 3vw, 4.2rem);
  font-weight: var(--font-weight-light);
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.ledger dt {
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

/* ink: how we work, as four lines you can read from across the room */
.ink {
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
}

.creed {
  list-style: none;
  margin: 4rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 5rem;
  border-top: 1px solid rgba(253, 251, 247, 0.18);
}

.creed__item {
  padding: 2.4rem 0 2.6rem;
  border-bottom: 1px solid rgba(253, 251, 247, 0.18);
}

.creed__num {
  display: block;
  margin-bottom: 1.6rem;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}

.creed__line {
  max-width: 14ch;
  margin: 0 0 1rem;
  font-size: clamp(1.9rem, 1rem + 2.2vw, 3.2rem);
  font-weight: var(--font-weight-light);
  line-height: 1.02;
  letter-spacing: -0.035em;
}

.creed__text {
  max-width: 40ch;
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(253, 251, 247, 0.64);
}

/* the quote, alone on the paper */
.quote {
  background: var(--color-bg-secondary);
}

.pull {
  margin: 0;
  padding: 0;
}

.pull__text {
  max-width: 30ch;
  margin: 0 0 2rem;
  font-size: clamp(1.5rem, 1rem + 1.8vw, 2.6rem);
  font-weight: var(--font-weight-light);
  line-height: 1.25;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.pull__who {
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

/* people: a roster, not a row of avatars */
.people {
  background: var(--color-bg-primary);
}

.roster {
  list-style: none;
  margin: 4rem 0 0;
  padding: 0;
  border-top: 1px solid var(--hairline-strong);
}

.roster__row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 5fr) minmax(0, 7fr);
  gap: 1rem 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--hairline-strong);
}

.roster__num {
  padding-top: 0.45rem;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}

.roster__name {
  margin: 0 0 0.5rem;
  font-size: 1.6rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.roster__role {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.roster__bio {
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

.roster__link {
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--hairline-strong);
  transition: border-color 0.3s ease;
}

.roster__link:hover {
  border-color: var(--color-text-primary);
}

/* ------------------------------------------------------------ narrower */
@media (max-width: 900px) {
  .hero-row,
  .two {
    grid-template-columns: minmax(0, 1fr);
    gap: 2rem;
  }

  .ledger {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ledger > div {
    padding: 1.8rem 1.5rem 1.6rem 0;
  }

  .ledger > div + div {
    padding-left: 1.5rem;
    border-left: 0;
  }

  .ledger > div:nth-child(even) {
    border-left: 1px solid var(--hairline-strong);
  }

  .ledger > div:nth-child(n + 3) {
    border-top: 1px solid var(--hairline-strong);
  }

  .creed {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .roster__row {
    grid-template-columns: 3rem minmax(0, 1fr);
  }

  .roster__bio {
    grid-column: 2;
  }
}

@media (max-width: 768px) {
  .about-hero {
    padding: 10rem var(--container-padding) 4rem;
  }

  .hero-title {
    margin-bottom: 2rem;
  }

  .panel {
    padding: 6rem var(--container-padding);
  }

  .ledger,
  .creed,
  .roster {
    margin-top: 2.5rem;
  }
}
</style>
