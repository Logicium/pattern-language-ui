<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { allNotes, contingency, notesMeta, speakerNames } from '@/data/speakerNotes'

/**
 * Stage notes, advanced one card at a time alongside the deck — read from a
 * phone in a dim room, or printed (print shows every card at once).
 * Deliberately dark and single-theme: glare is the enemy at a podium.
 */
useHead({ title: 'Speaker Notes' })

const route = useRoute()
const router = useRouter()

const total = allNotes.length

function clampIndex(value: number) {
  return Math.min(total - 1, Math.max(0, value))
}

const initial = Number.parseInt(String(route.query.n ?? '1'), 10)
const index = ref(clampIndex(Number.isNaN(initial) ? 0 : initial - 1))
const note = computed(() => allNotes[index.value]!)

function go(target: number) {
  const next = clampIndex(target)
  if (next === index.value) return
  index.value = next
  router.replace({ query: { ...route.query, n: String(next + 1) } })
}

const nextNote = () => go(index.value + 1)
const prevNote = () => go(index.value - 1)

/** `[beat]` stage directions get their own quiet treatment. */
function formatLine(line: string) {
  return line.replace(/\[([^\]]+)\]/g, '<span class="pause">[$1]</span>')
}

const cueGlyph = { advance: '→', hand: '✳', hold: '⏸' } as const

function onKeydown(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      e.preventDefault()
      nextNote()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault()
      prevNote()
      break
    case 'Home':
      e.preventDefault()
      go(0)
      break
    case 'End':
      e.preventDefault()
      go(total - 1)
      break
  }
}

// Swipe, since this is mostly read from a phone.
let touchStartX = 0
let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
  touchStartY = e.changedTouches[0]?.clientY ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  // Ignore vertical scrolling; only horizontal swipes navigate.
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return
  if (dx < 0) nextNote()
  else prevNote()
}

const FONT_ID = 'pres-space-grotesk'

onMounted(() => {
  if (!document.getElementById(FONT_ID)) {
    const link = document.createElement('link')
    link.id = FONT_ID
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap'
    document.head.appendChild(link)
  }
  window.addEventListener('keydown', onKeydown)
  document.body.classList.add('notes-body')
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('notes-body')
})
</script>

<template>
  <div class="notes" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
    <!-- One card at a time on screen; print renders them all (see @media print). -->
    <header class="bar">
      <span class="bar__act">{{ note.actLabel }} · {{ note.actTitle }}</span>
      <span class="bar__meta">{{ notesMeta.date }}</span>
    </header>

    <main class="stage">
      <article :key="note.num" class="card">
        <div class="card__head">
          <a
            class="num"
            :href="`/presentation?slide=${note.num}`"
            target="_blank"
            rel="noopener"
            :title="`Open slide ${note.num}`"
            >{{ String(note.num).padStart(2, '0') }}</a
          >
          <span class="name">{{ note.name }}</span>
          <span class="chip" :class="`chip--${note.speaker}`">{{ speakerNames[note.speaker] }}</span>
          <span class="timing">{{ note.timing }}</span>
        </div>

        <p class="beat">{{ note.beat }}</p>

        <!-- eslint-disable-next-line vue/no-v-html -- authored in src/data/speakerNotes.ts -->
        <p v-for="(line, i) in note.lines" :key="i" class="say" v-html="formatLine(line)" />

        <div v-if="note.cues.length" class="cues">
          <span v-for="cue in note.cues" :key="cue.text" :class="cue.kind">
            {{ cueGlyph[cue.kind] }} {{ cue.text }}
          </span>
        </div>
      </article>
    </main>

    <footer class="foot">
      <button class="nav" :disabled="index === 0" aria-label="Previous note" @click="prevNote">
        ←
      </button>
      <div class="track">
        <div class="track__fill" :style="{ width: `${((index + 1) / total) * 100}%` }" />
      </div>
      <span class="count">{{ index + 1 }} / {{ total }}</span>
      <button
        class="nav"
        :disabled="index === total - 1"
        aria-label="Next note"
        @click="nextNote"
      >
        →
      </button>
    </footer>

    <!-- Print-only: the full run, plus the contingency plan. -->
    <div class="print-all">
      <h1>{{ notesMeta.event }} — Speaker Notes</h1>
      <p>{{ notesMeta.presenters }} · {{ notesMeta.date }} · {{ notesMeta.runtime }}</p>
      <article v-for="n in allNotes" :key="`p-${n.num}`" class="print-card">
        <h2>{{ String(n.num).padStart(2, '0') }} · {{ n.name }} — {{ speakerNames[n.speaker] }} ({{ n.timing }})</h2>
        <p class="beat">{{ n.beat }}</p>
        <!-- eslint-disable-next-line vue/no-v-html -- authored in src/data/speakerNotes.ts -->
        <p v-for="(line, i) in n.lines" :key="i" v-html="formatLine(line)" />
        <p v-for="cue in n.cues" :key="cue.text" class="print-cue">
          {{ cueGlyph[cue.kind] }} {{ cue.text }}
        </p>
      </article>
      <p class="print-cue">{{ contingency }}</p>
    </div>
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
  --ink-soft: #c8cac4;
  --muted: #83877f;
  --green: #00ff88;
  --pink: #f7b8d8;
  --amber: #f2e860;
  --hairline: rgba(242, 241, 237, 0.14);
  --display: 'Space Grotesk', var(--font-family);

  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--bg);
  color: var(--ink);
  font-weight: 300;
  line-height: 1.6;
  overflow: hidden;
}

.bar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.15rem 0.5rem;
  font-family: var(--display);
  font-weight: 500;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.bar__act {
  color: var(--green);
}

.stage {
  overflow-y: auto;
  padding: 0.5rem 1.15rem 1rem;
  -webkit-overflow-scrolling: touch;
}

.card {
  max-width: 46rem;
  margin: 0 auto;
  background: var(--card);
  border: 1px solid var(--hairline);
  padding: 1.4rem 1.3rem 1.25rem;
  animation: cardIn 0.28s ease-out;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card__head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.6rem 0.8rem;
  margin-bottom: 1rem;
}

.num {
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.9rem;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  text-decoration: none;
}

.num:hover,
.num:focus-visible {
  color: var(--green);
}

.name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: rgba(0, 255, 136, 0.14);
  padding: 0.14em 0.42em;
}

.chip {
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 0.24em 0.5em;
  border: 1px solid currentColor;
}

.chip--kisora {
  color: var(--green);
}

.chip--joze {
  color: var(--pink);
}

.chip--both {
  color: var(--amber);
}

.timing {
  margin-left: auto;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--muted);
  white-space: nowrap;
}

.beat {
  margin: 0 0 0.85rem;
  font-weight: 400;
  font-size: 0.98rem;
  color: var(--ink);
  border-left: 2px solid var(--green);
  padding-left: 0.7rem;
}

.say {
  margin: 0 0 0.7rem;
  font-size: 1.12rem;
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
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  padding: 0 0.25em;
}

.cues {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px dashed var(--hairline);
  font-family: var(--display);
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.cues .advance {
  color: var(--green);
}

.cues .hand {
  color: var(--pink);
}

.cues .hold {
  color: var(--amber);
}

.foot {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.7rem 1.15rem calc(0.7rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--hairline);
}

.nav {
  flex: none;
  width: 3rem;
  height: 2.6rem;
  background: transparent;
  border: 1px solid var(--hairline);
  color: var(--ink);
  font-size: 1.1rem;
  cursor: pointer;
}

.nav:disabled {
  opacity: 0.3;
  cursor: default;
}

.nav:not(:disabled):hover,
.nav:focus-visible {
  border-color: var(--green);
  color: var(--green);
}

.track {
  flex: 1;
  height: 2px;
  background: var(--hairline);
}

.track__fill {
  height: 100%;
  background: var(--green);
  transition: width 0.28s ease;
}

.count {
  font-family: var(--display);
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Phones: trim a little so the longer cards land without scrolling. */
@media (max-width: 480px) {
  .say {
    font-size: 1.02rem;
    margin-bottom: 0.6rem;
  }

  .beat {
    font-size: 0.92rem;
  }

  .card {
    padding: 1.15rem 1.05rem 1rem;
  }
}

.print-all {
  display: none;
}

@media print {
  .notes {
    position: static;
    display: block;
    overflow: visible;
    background: #fff;
    color: #000;
  }

  .bar,
  .stage,
  .foot {
    display: none;
  }

  .print-all {
    display: block;
    font-size: 10.5pt;
  }

  .print-card {
    break-inside: avoid;
    page-break-inside: avoid;
    border-bottom: 1px solid #bbb;
    padding-bottom: 0.5rem;
    margin-bottom: 0.7rem;
  }

  .print-card h2 {
    font-size: 11pt;
    margin: 0 0 0.25rem;
  }

  .print-card p {
    margin: 0 0 0.3rem;
  }

  .print-cue {
    font-size: 9pt;
    color: #444;
  }
}
</style>
