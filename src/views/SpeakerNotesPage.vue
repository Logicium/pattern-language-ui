<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useHead } from '@unhead/vue'
import { acts, contingency, notesMeta } from '@/data/speakerNotes'

/**
 * Stage notes, read from a phone in a dim room (or printed). Deliberately
 * dark and single-theme — glare is the enemy at a podium — and outside the
 * site's light chrome, so it opens straight into the notes.
 */
useHead({ title: 'Speaker Notes' })

const FONT_ID = 'pres-space-grotesk'

/** `[beat]` stage directions get their own quiet treatment. */
function formatLine(line: string) {
  return line.replace(/\[([^\]]+)\]/g, '<span class="pause">[$1]</span>')
}

onMounted(() => {
  if (!document.getElementById(FONT_ID)) {
    const link = document.createElement('link')
    link.id = FONT_ID
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap'
    document.head.appendChild(link)
  }
  document.body.classList.add('notes-body')
})

onUnmounted(() => {
  document.body.classList.remove('notes-body')
})
</script>

<template>
  <div class="notes">
    <header class="top">
      <p class="kicker">
        {{ notesMeta.event }} &nbsp;·&nbsp; {{ notesMeta.date }}
      </p>
      <h1 class="title">Speaker Notes</h1>
      <p class="meta">{{ notesMeta.presenters }}</p>

      <div class="legend">
        <span><b class="g">&rarr; Advance</b> when to click</span>
        <span><b class="p">&#10035; Joze</b> hand-off</span>
        <span><b>[beat]</b> breathe, two counts</span>
      </div>
    </header>

    <section v-for="act in acts" :key="act.id" class="act">
      <div class="act__head">
        <span class="act__label">{{ act.label }}</span>
        <h2 class="act__title">{{ act.title }}</h2>
        <p class="act__summary">{{ act.summary }}</p>
      </div>

      <article v-for="slide in act.slides" :key="slide.num" class="card">
        <div class="card__head">
          <a
            class="num"
            :href="`/presentation?slide=${slide.num}`"
            target="_blank"
            rel="noopener"
            :title="`Open slide ${slide.num}`"
          >{{ String(slide.num).padStart(2, '0') }}</a>
          <span class="slide-name">{{ slide.name }}</span>
          <span class="timing">{{ slide.timing }}</span>
        </div>

        <p class="beat">{{ slide.beat }}</p>

        <!-- eslint-disable-next-line vue/no-v-html -- authored in src/data/speakerNotes.ts -->
        <p v-for="(line, i) in slide.lines" :key="i" class="say" v-html="formatLine(line)" />

        <div v-if="slide.cues.length" class="cue">
          <span v-for="cue in slide.cues" :key="cue.text" :class="cue.kind">
            {{ cue.kind === 'hand' ? '✳' : '→' }} {{ cue.text }}
          </span>
        </div>
      </article>
    </section>

    <footer class="foot">
      <p>{{ contingency }}</p>
      <router-link to="/presentation" class="foot__link">Open the deck</router-link>
    </footer>
  </div>
</template>

<style>
/* The page owns the viewport background so overscroll stays dark on iOS. */
body.notes-body {
  background: #0e0f0e;
}
</style>

<style scoped>
.notes {
  --bg: #0e0f0e;
  --card: #161816;
  --ink: #f2f1ed;
  --ink-soft: #c4c6c2;
  --muted: #83877f;
  --green: #00ff88;
  --pink: #f7b8d8;
  --hairline: rgba(242, 241, 237, 0.14);
  --display: 'Space Grotesk', var(--font-family);

  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  padding: 2.5rem 1.15rem 4rem;
  max-width: 46rem;
  margin: 0 auto;
  font-weight: 300;
  line-height: 1.6;
}

.top {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 2.5rem;
}

.kicker {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--green);
}

.title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: clamp(1.9rem, 8vw, 2.6rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.meta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 1.3rem;
  font-size: 0.78rem;
  color: var(--muted);
  border-top: 1px solid var(--hairline);
  padding-top: 0.9rem;
  margin-top: 0.4rem;
}

.legend b {
  font-family: var(--display);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.68rem;
  margin-right: 0.35rem;
}

.legend .g { color: var(--green); }
.legend .p { color: var(--pink); }

.act__head {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.act__label {
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

.act__title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
}

.act__summary {
  margin: 0;
  font-size: 0.88rem;
  color: var(--muted);
}

.card {
  background: var(--card);
  border: 1px solid var(--hairline);
  padding: 1.35rem 1.25rem 1.2rem;
  margin-bottom: 1rem;
}

.card__head {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  margin-bottom: 0.85rem;
}

.num {
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  text-decoration: none;
}

.num:hover,
.num:focus-visible {
  color: var(--green);
}

.slide-name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  background: rgba(0, 255, 136, 0.14);
  padding: 0.12em 0.4em;
}

.timing {
  margin-left: auto;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--muted);
  white-space: nowrap;
}

.beat {
  margin: 0 0 0.6rem;
  font-weight: 400;
  font-size: 1rem;
  color: var(--ink);
}

.say {
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  color: var(--ink-soft);
}

.say :deep(em) {
  font-style: normal;
  font-weight: 600;
  color: var(--ink);
}

.say :deep(.pause) {
  font-family: var(--display);
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 0 0.25em;
}

.cue {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin-top: 0.9rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--hairline);
}

.cue span {
  font-family: var(--display);
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green);
}

.cue span.hand {
  color: var(--pink);
}

.foot {
  margin-top: 2rem;
  border-top: 1px solid var(--hairline);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  font-size: 0.82rem;
  color: var(--muted);
}

.foot p { margin: 0; }

.foot__link {
  align-self: flex-start;
  font-family: var(--display);
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
  border-bottom: 1px solid var(--hairline);
  padding-bottom: 2px;
}

.foot__link:hover,
.foot__link:focus-visible {
  border-bottom-color: var(--green);
}

@media print {
  .notes {
    --bg: #ffffff;
    --card: #ffffff;
    --ink: #000000;
    --ink-soft: #1c1c1c;
    --muted: #555555;
    --green: #007a46;
    --pink: #a03a72;
    --hairline: rgba(0, 0, 0, 0.28);
    max-width: none;
    padding: 0;
  }

  .card {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .slide-name {
    background: rgba(0, 122, 70, 0.14);
  }

  .foot__link { display: none; }
}
</style>
