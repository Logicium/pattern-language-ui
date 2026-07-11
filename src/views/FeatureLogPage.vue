<template>
  <div class="feature-log-page">

    <PageHero
      label="Building in Public"
      title="Feature Log"
      subtitle="What's new on Pattern Language — features shipped, progress made,<br>and the road as we pave it."
    />

    <section class="section log-section">
      <div class="container">
        <article v-for="entry in entries" :key="entry.tag" class="log-entry">
          <div class="entry-meta">
            <span class="entry-number">{{ entry.number }}</span>
            <span class="entry-tag">
              <span class="accent-mark" data-accent="1" aria-hidden="true"></span>
              {{ entry.tag }}
            </span>
            <span class="entry-date">{{ entry.date }}</span>
          </div>

          <div class="entry-body">
            <h2 class="entry-title">{{ entry.title }}</h2>
            <p class="entry-intro text-secondary">{{ entry.intro }}</p>

            <div v-for="group in entry.groups" :key="group.label" class="entry-group">
              <h3 class="group-label">
                <span class="accent-mark" :data-accent="group.accent" aria-hidden="true"></span>
                {{ group.label }}
              </h3>
              <ul class="group-items">
                <li v-for="(item, i) in group.items" :key="i" class="group-item text-secondary">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Footer, CTASection, PageHero } from '@/components'

interface LogGroup {
  label: string
  accent: number
  items: string[]
}

interface LogEntry {
  number: string
  tag: string
  date: string
  title: string
  intro: string
  groups: LogGroup[]
}

const entries: LogEntry[] = [
  {
    number: '01',
    tag: 'Release',
    date: 'July 11, 2026',
    title: 'Collaboration, everywhere.',
    intro:
      'The biggest update since launch. Playbooks became truly collaborative, cities now introduce themselves, resources reach all fifty states, and the whole site received a ground-up design refresh.',
    groups: [
      {
        label: 'New Features',
        accent: 1,
        items: [
          'Request to join any published playbook — creators approve or decline from the new Invitations hub.',
          'Invite anyone to Pattern Language by email, optionally straight into one of your playbooks; they join automatically the moment they sign up.',
          'The Invitations page now has tabs for inviting, received invitations, join requests, and everything you\'ve sent — with the option to withdraw.',
          'Browse published playbooks from every community with the new All Playbooks tab, and leave a playbook you\'ve joined at any time.',
          'AI-generated playbooks now carry descriptive, solution-specific titles, with the original pattern shown as a badge.',
          'Playbook titles, summaries, and notes all edit in place — click the text, type, and it saves itself.',
          'Every playbook has an activity timeline: started, milestones, today, and target on a single line, beautiful on any screen.',
          'City pages now generate themselves the moment someone signs up from a new town — history, wicked problems, readiness score, local resources, and an annotated portrait from Wikipedia.',
          'Resources reimagined with Local, National, and All scopes, seeded with 150+ curated rural-development resources covering every US state.',
          'Shop items open a full preview panel with details before you head to the store.',
        ],
      },
      {
        label: 'Design',
        accent: 2,
        items: [
          'A site-wide typographic refresh built on Geist — minimalist, precise, futuristic.',
          'Premium placard cards across the platform: playbooks with team avatars, patterns with their own constellation of related nodes, stories, resources, the shop, and cities with live stylized map backdrops.',
          'Ribbon banners across the dashboard headers, a translucent blurred sidebar, and slide-in panels that drift into place in 3D with one standardized back button.',
        ],
      },
      {
        label: 'Fixes & Polish',
        accent: 3,
        items: [
          'Tabs and pagination are remembered in the address bar — refresh and you\'re right where you left off.',
          'Signing up with a long story to tell no longer fails, and Google sign-up works smoothly again.',
          'Wikipedia city photos load reliably and are captioned with what they actually show.',
          'Smoother, jump-free animations when editing tasks and browsing the dashboard.',
        ],
      },
    ],
  },
]
</script>

<style scoped>
.feature-log-page { min-height: 100vh; }

.log-section {
  background: var(--color-bg-primary);
}

.log-entry {
  display: grid;
  grid-template-columns: 3fr 9fr;
  gap: 4rem;
  padding: 4rem 0;
  border-top: 1px solid var(--hairline);
}

.log-entry:first-child { border-top: none; padding-top: 0; }

/* ── Meta rail ── */
.entry-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: 6rem;
  align-self: start;
}

.entry-number {
  font-size: 3.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.entry-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.entry-date {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary);
  font-variant-numeric: tabular-nums;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.accent-mark[data-accent="1"] { background: var(--color-accent-1); }
.accent-mark[data-accent="2"] { background: var(--color-accent-2); }
.accent-mark[data-accent="3"] { background: var(--color-accent-3); }

/* ── Entry body ── */
.entry-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 1.25rem;
}

.entry-intro {
  font-size: 1.0625rem;
  line-height: 1.8;
  max-width: 62ch;
  margin: 0 0 3rem;
}

.entry-group {
  margin-bottom: 2.5rem;
}

.entry-group:last-child { margin-bottom: 0; }

.group-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0 0 1.25rem;
}

.group-items {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hairline);
}

.group-item {
  font-size: 0.9375rem;
  line-height: 1.7;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--hairline);
}

@media (max-width: 900px) {
  .log-entry {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 3rem 0;
  }

  .entry-meta {
    position: static;
    flex-direction: row;
    align-items: baseline;
    gap: 1.5rem;
  }

  .entry-number { font-size: 2.25rem; }

  .entry-title { font-size: 1.875rem; }
}
</style>
