<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type Directive } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import Lenis from 'lenis'
import PatternPlay from '@/components/hackathon/PatternPlay.vue'
import PremiumCursor from '@/components/hackathon/PremiumCursor.vue'
import { hackathon } from '@/data/hackathon'
import { eventsApi } from '@/services/api'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { demoApi } from '@/services/api'
import { useAuthStore, HACKATHON_SESSION_KEY } from '@/stores/auth'

/**
 * /hackathon — the Community Solution Sprint, 9 November 2026.
 *
 * A presentation, not a page. The site layer is a stack of full-height
 * panels, each a field of colour; the next one rises over the last, which
 * eases back and darkens beneath it. Type arrives slowly out of masks.
 * One inertial scroller carries all of it. The Field (PatternPlay) sits
 * under everything as the fixed backdrop and, in 'game' mode, takes the
 * viewport; closing it raises the site like a curtain over the same web.
 */

useHead({ title: 'Community Solution Sprint' })

const route = useRoute()
const mode = ref<'game' | 'site'>(route.hash === '#play' ? 'game' : 'site')
const view = ref<'full' | 'register'>(route.hash === '#register' ? 'register' : 'full')
const nameInput = ref<HTMLInputElement | null>(null)
const stackEl = ref<HTMLElement | null>(null)
const scrolled = ref(false)
const section = ref(0)
const progress = ref(0)
const chromeOn = ref('var(--ink)')
/** The colour of the panel under the chrome, for the band it lays down once the page scrolls. */
const chromeBg = ref('transparent')

// Numbered as the panels are: the opening is 00, then 01 Why … 07 Questions.
const SECTIONS = ['Open', 'Why', 'Details', 'How it works', 'The day', 'Judging', 'Register', 'Questions']
const morning = computed(() => hackathon.schedule.slice(0, 8))
const afternoon = computed(() => hackathon.schedule.slice(8))
const sectionLabel = computed(() => SECTIONS[section.value] ?? '')
const sectionN = computed(() => String(section.value).padStart(2, '0'))

/* ---- reveal: masked lines rise, blocks fade, slowly, once ---- */

const revealIO =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('revealed')
              revealIO?.unobserve(e.target)
            }
          }
        },
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
      )
    : null

const vReveal: Directive<HTMLElement> = {
  mounted(el) {
    if (!revealIO || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('reveal-init')
    revealIO.observe(el)
  },
  beforeUnmount(el) {
    revealIO?.unobserve(el)
  }
}

/* ---- the scroller ---- */

let lenis: Lenis | null = null
let lenisRaf = 0

function startLenis() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.2, smoothWheel: true })
  const loop = (t: number) => {
    lenis?.raf(t)
    lenisRaf = requestAnimationFrame(loop)
  }
  lenisRaf = requestAnimationFrame(loop)
}
function stopLenis() {
  cancelAnimationFrame(lenisRaf)
  lenis?.destroy()
  lenis = null
}
function scrollToY(top: number, immediate = false) {
  if (lenis) lenis.scrollTo(top, { immediate, duration: 1.6 })
  else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
}
function scrollTo(id: string, immediate = false) {
  const el = document.getElementById(id)
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY, immediate)
}

function lockScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? 'hidden' : ''
  if (lock) lenis?.stop()
  else lenis?.start()
}

/* ---- the stack: how far each panel's follower has covered it ---- */

let stackRaf = 0
function updateStack() {
  stackRaf = 0
  const root = stackEl.value
  const vh = window.innerHeight
  if (root) {
    const panels = Array.from(root.querySelectorAll<HTMLElement>(':scope > .panel'))
    const tail = root.nextElementSibling as HTMLElement | null
    panels.forEach((p, i) => {
      // A panel taller than the screen scrolls to its foot before it sticks,
      // so nothing below the fold is ever covered unread.
      const top = `${Math.min(0, vh - p.offsetHeight)}px`
      if (p.style.top !== top) p.style.top = top
      const next = panels[i + 1] ?? tail
      const cover = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh)) : 0
      p.style.setProperty('--cover', cover.toFixed(4))
    })
  }
  const max = document.documentElement.scrollHeight - vh
  progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
  scrolled.value = window.scrollY > 24
}
function onScroll() {
  if (!stackRaf) stackRaf = requestAnimationFrame(updateStack)
}

/* ---- which section holds the middle, and what colour sits under the chrome ---- */

let sectionIO: IntersectionObserver | null = null
let toneTimer = 0
function sampleTone() {
  if (mode.value === 'game') {
    chromeOn.value = 'var(--ink)'
    chromeBg.value = 'transparent'
    return
  }
  const els = document.elementsFromPoint(window.innerWidth * 0.5, 30)
  for (const el of els) {
    if (el.closest('.chrome, .hud-index, .cursor')) continue
    const fieldEl = el.closest<HTMLElement>('[class*="field-"]')
    if (!fieldEl) continue
    const style = getComputedStyle(fieldEl)
    chromeOn.value = style.getPropertyValue('--on') || 'var(--ink)'
    const bg = style.getPropertyValue('--bg').trim()
    // Clear sections sit over the web; give them warm paper, mostly opaque.
    chromeBg.value = !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)' ? 'rgba(247, 242, 233, 0.9)' : bg
    return
  }
  chromeOn.value = 'var(--ink)'
}

function observeSections() {
  sectionIO?.disconnect()
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-index]'))
  sectionIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) section.value = Number((e.target as HTMLElement).dataset.index ?? 0)
      }
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  )
  targets.forEach((t) => sectionIO?.observe(t))
}

/* ---- modes and views ---- */

function closeGame(target?: 'about' | 'register', payload?: { name: string; pitch: string }) {
  if (payload) {
    pitchName.value = payload.name
    form.note = `I want to bring the pitch I made in the game, ${payload.name}: ${payload.pitch}`
  }
  view.value = target === 'register' ? 'register' : 'full'
  mode.value = 'site'
  lockScroll(false)
  window.scrollTo({ top: 0 })
  nextTick(observeSections)
  if (target === 'register') setTimeout(() => nameInput.value?.focus({ preventScroll: true }), 1200)
}

function openGame() {
  mode.value = 'game'
  lockScroll(true)
}

/**
 * Hand an idea to PAL as a real playbook: become (or resume) a temporary
 * citizen, then open the dashboard chat with the pitch as the first message.
 * The chat recognises "create a playbook" and builds one from it.
 */
const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated, isDemoUser, currentUser } = storeToRefs(authStore)
const handingOff = ref(false)
const handoffError = ref('')
function handoffIdea(idea: {
  problem: string
  patterns: string[]
  brief: { name: string; pitch: string; build: string[]; ask: string; headline?: string }
}) {
  const b = idea.brief
  const prompt = [
    `Create a playbook for Cañon City, Colorado called "${b.name}".`,
    `The problem it answers: ${idea.problem}.`,
    `Combine these patterns: ${idea.patterns.join(', ')}.`,
    `The pitch: ${b.pitch}`,
    b.build.length ? `The first 90 days: ${b.build.join(' Then ')}` : '',
    b.ask ? `Who to bring in first: ${b.ask}` : '',
    'Build the playbook from this, keeping the name.'
  ]
    .filter(Boolean)
    .join(' ')
  const target = `/dashboard?prompt=${encodeURIComponent(prompt)}&title=${encodeURIComponent(b.name)}`
  void (async () => {
    if (handingOff.value) return
    handingOff.value = true
    handoffError.value = ''
    try {
      // A real account, or a hackathon profile already in use: carry on as them.
      const onHackathonProfile = isDemoUser.value && currentUser.value?.location === 'Cañon City'
      if (!isAuthenticated.value || (isDemoUser.value && !onHackathonProfile)) {
        const session =
          authStore.storedDemoSession(HACKATHON_SESSION_KEY) ?? (await demoApi.createCitizen('hackathon'))
        authStore.enterDemoSession(session, HACKATHON_SESSION_KEY)
      }
      lockScroll(false)
      await router.push(target)
    } catch (e) {
      handoffError.value = e instanceof Error ? e.message : 'Could not reach PAL. Please try again.'
      handingOff.value = false
    }
  })()
}

/**
 * Change views the way the game hands over to the site: the page lowers like
 * a curtain onto the web behind it, the view changes out of sight, and the
 * curtain rises again on the new view. The clip is set in page pixels around
 * the current scroll, so the sweep crosses the viewport evenly however long
 * the page is.
 */
const siteEl = ref<HTMLElement | null>(null)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
let swapping = false
async function curtainSwap(change: () => Promise<void> | void) {
  const el = siteEl.value
  if (!el || swapping || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await change()
    return
  }
  swapping = true
  const vh = window.innerHeight
  const set = (clip: string, transform: string, transition: string) => {
    el.style.transition = transition
    el.style.clipPath = clip
    el.style.transform = transform
  }
  const fall = 'cubic-bezier(0.64, 0, 0.78, 0)'
  const rise = 'cubic-bezier(0.22, 1, 0.36, 1)'
  const y0 = window.scrollY
  set(`inset(${y0}px 0 0 0)`, 'none', 'none')
  void el.offsetHeight
  set(`inset(${y0 + vh}px 0 0 0)`, 'translateY(6vh)', `clip-path 0.9s ${fall}, transform 0.9s ${fall}`)
  await sleep(950)
  await change()
  await nextTick()
  const y1 = window.scrollY
  set(`inset(${y1 + vh}px 0 0 0)`, 'translateY(6vh)', 'none')
  void el.offsetHeight
  set(`inset(${y1}px 0 0 0)`, 'none', `clip-path 1.3s ${rise}, transform 1.3s ${rise}`)
  await sleep(1350)
  set('', '', 'none')
  void el.offsetHeight
  el.style.transition = ''
  swapping = false
}

/** From the registration screen to the sprint: they have seen the opening, so land on the second panel. */
function showFull(target = 'why') {
  void curtainSwap(async () => {
    view.value = 'full'
    await nextTick()
    observeSections()
    updateStack()
    lenis?.resize()
    // measure from the top: a stuck panel reports where it is stuck, not where it lives
    window.scrollTo({ top: 0 })
    lenis?.scrollTo(0, { immediate: true, force: true })
    const el = document.getElementById(target)
    const top = el ? el.getBoundingClientRect().top + window.scrollY : 0
    window.scrollTo({ top })
    lenis?.scrollTo(top, { immediate: true, force: true })
  })
}

function showRegister() {
  if (view.value === 'full' && document.getElementById('register')) {
    scrollTo('register')
    setTimeout(() => nameInput.value?.focus({ preventScroll: true }), 1500)
    return
  }
  view.value = 'register'
  window.scrollTo({ top: 0 })
  nextTick(() => {
    observeSections()
    nameInput.value?.focus({ preventScroll: true })
  })
}

watch(mode, (m) => {
  if (m === 'site') startLenis()
})

/* ---- registration ---- */

const form = reactive({ name: '', email: '', organization: '', note: '' })
const sending = ref(false)
const done = ref(false)
const error = ref('')
const pitchName = ref('')

/**
 * Registrations are reviewed: sending one is a request, and the invite
 * follows by email. This browser remembers it, so a returning visitor sees
 * that they are already registered instead of an empty form; the backend
 * also refuses a second registration for the same email.
 */
const REG_KEY = 'plh.registration'
interface Registered { slug: string; name: string; email: string; at: string; repeat?: boolean }
const registered = ref<Registered | null>(null)
try {
  const saved = JSON.parse(localStorage.getItem(REG_KEY) ?? 'null') as Registered | null
  if (saved?.slug === hackathon.slug) {
    registered.value = { ...saved, repeat: true }
    done.value = true
  }
} catch {
  /* storage blocked: the form simply shows */
}

async function submit() {
  if (sending.value) return
  if (!form.note.trim()) {
    error.value = 'Tell us why you’re interested.'
    return
  }
  sending.value = true
  error.value = ''
  try {
    const result = await eventsApi.signup({
      eventSlug: hackathon.slug,
      name: form.name,
      email: form.email,
      organization: form.organization || undefined,
      note: form.note.trim()
    })
    registered.value = { slug: hackathon.slug, name: form.name.trim(), email: form.email.trim().toLowerCase(), at: new Date().toISOString(), repeat: !!result.already }
    try {
      localStorage.setItem(REG_KEY, JSON.stringify(registered.value))
    } catch {
      /* fine */
    }
    done.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
  } finally {
    sending.value = false
  }
}

/** Someone else on this device wants to register. */
function registerAnother() {
  try {
    localStorage.removeItem(REG_KEY)
  } catch {
    /* fine */
  }
  registered.value = null
  Object.assign(form, { name: '', email: '', organization: '', note: '' })
  done.value = false
  nextTick(() => nameInput.value?.focus({ preventScroll: true }))
}

/* ---- lifecycle ---- */

onMounted(async () => {
  lockScroll(mode.value === 'game')
  if (mode.value === 'site') startLenis()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  toneTimer = window.setInterval(sampleTone, 160)
  updateStack()
  await nextTick()
  observeSections()
  if (route.hash && route.hash !== '#play' && view.value === 'full') {
    setTimeout(() => scrollTo(route.hash.slice(1), true), 80)
  }
})

onBeforeUnmount(() => {
  lockScroll(false)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.clearInterval(toneTimer)
  sectionIO?.disconnect()
  revealIO?.disconnect()
  stopLenis()
})
</script>

<template>
  <div class="hk" :class="[`mode-${mode}`, `view-${view}`, { 'is-scrolled': scrolled }]" :style="{ '--chrome-on': chromeOn, '--chrome-bg': chromeBg }">
    <PremiumCursor :active="mode === 'game'" />
    <PatternPlay :mode="mode" @close="closeGame" @handoff="handoffIdea" />
    <Transition name="veil">
      <div v-if="handingOff" class="veil" role="status"><span class="eyebrow">Opening PAL<span class="sep">/</span>setting up your profile</span></div>
    </Transition>
    <Transition name="veil">
      <div v-if="handoffError" class="veil veil--error" role="alert" @click="handoffError = ''"><span class="eyebrow">{{ handoffError }}</span></div>
    </Transition>

    <!-- one chrome for both layers -->
    <header class="chrome">
      <router-link to="/" class="chrome__brand" title="Pattern Language">
        <span>Pattern Language</span>
        <span class="chrome__sep">/</span>
        <span class="chrome__sub">Community Solution Sprint</span>
      </router-link>
      <nav class="chrome__nav">
        <template v-if="mode === 'game'">
          <button class="chrome__link" type="button" @click="closeGame('register')">Register</button>
          <button class="chrome__link" type="button" @click="closeGame('about')">Close <span aria-hidden="true">×</span></button>
        </template>
        <template v-else-if="view === 'register'">
          <button class="chrome__link" type="button" @click="openGame">Play</button>
          <button class="chrome__link chrome__link--strong" type="button" @click="showFull()">The sprint</button>
        </template>
        <template v-else>
          <button class="chrome__link" type="button" @click="openGame">Play</button>
          <button class="chrome__link chrome__link--strong" type="button" @click="showRegister">Register</button>
        </template>
      </nav>
    </header>

    <!-- the site, under the curtain -->
    <div ref="siteEl" class="site" :inert="mode === 'game'">
      <!-- the presentation -->
      <main v-if="view === 'full'" ref="stackEl" class="stack">
        <!-- 00 open: over the field -->
        <section id="about" class="panel field-clear" data-index="0" style="z-index: 1">
          <div class="panel__in hero" v-reveal>
            <p class="eyebrow fade" style="--i: 0">{{ hackathon.dayLabel }}<span class="sep">/</span>{{ hackathon.dateLabel }}</p>
            <h1 class="display">
              <span class="mask" style="--i: 1"><span>Build with a town,</span></span>
              <span class="mask" style="--i: 2"><span>not for it.</span></span>
            </h1>
            <div class="hero__row">
              <div class="hero__lead">
                <p class="lede fade" style="--i: 3">{{ hackathon.lede }}</p>
                <p class="tease fade" style="--i: 4">{{ hackathon.tease }}</p>
                <div class="actions fade" style="--i: 5">
                  <button class="btn-line" type="button" data-cursor="Play" @click="openGame">Play the game</button>
                  <button class="link" type="button" @click="showRegister">Register</button>
                </div>
              </div>
              <dl class="meta fade" style="--i: 4">
                <div><dt>Where</dt><dd>{{ hackathon.location }}</dd></div>
                <div><dt>When</dt><dd>{{ hackathon.timeLabel }}</dd></div>
                <div><dt>Format</dt><dd>{{ hackathon.format }}</dd></div>
                <div class="meta__host">
                  <dt>Hosted by</dt>
                  <dd>
                    <a class="host" :href="hackathon.host.url" target="_blank" rel="noopener noreferrer" :aria-label="hackathon.host.name">
                      <img class="host__logo" :src="hackathon.host.logo" :alt="hackathon.host.name" width="1300" height="358" />
                    </a>
                  </dd>
                </div>
                <div class="meta__host">
                  <dt>Sponsored by</dt>
                  <dd>
                    <a class="host sponsor" :href="hackathon.sponsor.url" target="_blank" rel="noopener noreferrer" :aria-label="hackathon.sponsor.name">
                      <img v-if="hackathon.sponsor.logo" class="host__logo" :src="hackathon.sponsor.logo" :alt="hackathon.sponsor.name" />
                      <span v-else class="sponsor__word">Boettcher<br />Foundation</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <!-- 01 why: ink -->
        <section id="why" class="panel field-ink" data-nav="dark" data-index="1" style="z-index: 2">
          <i class="panel__veil" aria-hidden="true" />
          <div class="panel__in" v-reveal>
            <p class="eyebrow fade" style="--i: 0"><span class="n">01</span><span class="sep">/</span>Why</p>
            <div class="manifesto">
              <p v-for="(line, i) in hackathon.manifesto" :key="i" class="manifesto__line">
                <span class="mask" :style="{ '--i': i + 1 }"><span>{{ line }}</span></span>
              </p>
            </div>
          </div>
        </section>

        <!-- 02 details: mint -->
        <section class="panel field-mint" data-index="2" style="z-index: 3">
          <i class="panel__veil" aria-hidden="true" />
          <div class="panel__in two" v-reveal>
            <div class="two__label">
              <p class="eyebrow fade" style="--i: 0"><span class="n">02</span><span class="sep">/</span>Details</p>
              <h2 class="h2"><span class="mask" style="--i: 1"><span>One day,</span></span><span class="mask" style="--i: 2"><span>in a real town.</span></span></h2>
            </div>
            <dl class="ledger">
              <div v-for="(d, i) in hackathon.details" :key="d.label" class="ledger__row fade" :style="{ '--i': i + 2 }">
                <dt>{{ d.label }}</dt>
                <dd>{{ d.value }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- 03 how it works: paper -->
        <section id="how" class="panel field-paper" data-index="3" style="z-index: 4">
          <i class="panel__veil" aria-hidden="true" />
          <div class="panel__in two" v-reveal>
            <div class="two__label">
              <p class="eyebrow fade" style="--i: 0"><span class="n">03</span><span class="sep">/</span>How it works</p>
              <p class="note fade" style="--i: 1">Values, then patterns, then a 90-day playbook. The same path for every team, so the plans can be judged side by side.</p>
              <div class="res fade" style="--i: 2">
                <p class="eyebrow eyebrow--dim">
                  {{ hackathon.resourcesReady ? 'On the table, and here to read first' : 'On the table on the day' }}
                  <span v-if="!hackathon.resourcesReady" class="soon">Coming soon</span>
                </p>
                <ul class="res__list" :class="{ 'is-soon': !hackathon.resourcesReady }">
                  <li v-for="r in hackathon.resources" :key="r.href">
                    <a v-if="hackathon.resourcesReady" :href="r.href" download data-cursor="Save">
                      <span class="res__name">{{ r.name }}</span>
                      <span class="res__what">{{ r.what }}</span>
                    </a>
                    <span v-else class="res__item">
                      <span class="res__name">{{ r.name }}</span>
                      <span class="res__what">{{ r.what.split(' · ')[0] }}</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <ol class="tracks">
              <li v-for="(t, i) in hackathon.method" :key="t.name" class="track">
                <span class="track__n fade" :style="{ '--i': i + 1 }">0{{ i + 1 }}</span>
                <span class="track__name"><span class="mask" :style="{ '--i': i + 1 }"><span>{{ t.name }}</span></span></span>
                <span class="track__blurb fade" :style="{ '--i': i + 2 }">{{ t.blurb }}</span>
              </li>
            </ol>
          </div>
        </section>

        <!-- 04 the day: lavender -->
        <section id="day" class="panel field-lavender" data-index="4" style="z-index: 5">
          <i class="panel__veil" aria-hidden="true" />
          <div class="panel__in two" v-reveal>
            <div class="two__label">
              <p class="eyebrow fade" style="--i: 0"><span class="n">04</span><span class="sep">/</span>The day</p>
              <h2 class="h2"><span class="mask" style="--i: 1"><span>Coffee at nine.</span></span><span class="mask" style="--i: 2"><span>Plans by five.</span></span></h2>
              <p class="note fade" style="--i: 3">{{ hackathon.timeLabel }}. The winning project receives up to $250 to keep going, and we say so at nine, not at the end.</p>
            </div>
            <div class="day">
              <div>
                <p class="eyebrow eyebrow--dim fade day__half" style="--i: 2">Morning</p>
                <ol class="schedule">
                  <li v-for="(s, i) in morning" :key="s.time" class="fade" :style="{ '--i': i + 3 }">
                    <span class="schedule__time">{{ s.time }}</span>
                    <span>{{ s.what }}</span>
                  </li>
                </ol>
              </div>
              <div>
                <p class="eyebrow eyebrow--dim fade day__half" style="--i: 3">Afternoon</p>
                <ol class="schedule">
                  <li v-for="(s, i) in afternoon" :key="s.time" class="fade" :style="{ '--i': i + 4 }">
                    <span class="schedule__time">{{ s.time }}</span>
                    <span>{{ s.what }}</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <!-- 05 judging: mint -->
        <section id="judging" class="panel field-mint" data-index="5" style="z-index: 6">
          <i class="panel__veil" aria-hidden="true" />
          <div class="panel__in two" v-reveal>
            <div class="two__label">
              <p class="eyebrow fade" style="--i: 0"><span class="n">05</span><span class="sep">/</span>Judging</p>
              <h2 class="h2"><span class="mask" style="--i: 1"><span>Five criteria.</span></span><span class="mask" style="--i: 2"><span>Twenty percent each.</span></span></h2>
              <p class="note fade" style="--i: 3">{{ hackathon.judgingNote }}</p>
            </div>
            <div class="judging">
              <ul class="crit">
                <li v-for="(j, i) in hackathon.judging" :key="j.name" class="fade" :style="{ '--i': i + 2 }">
                  <span class="crit__name">{{ j.name }}<span class="crit__w">20%</span></span>
                  <span class="crit__blurb">{{ j.blurb }}</span>
                </li>
              </ul>
              <p class="eyebrow eyebrow--dim fade judging__prizes" style="--i: 7">The award</p>
              <ul class="crit">
                <li v-for="(p, i) in hackathon.prizes" :key="p.place" class="fade" :style="{ '--i': i + 8 }">
                  <span class="crit__name">{{ p.place }}</span>
                  <span class="crit__blurb">{{ p.what }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 06 register: ink -->
        <section id="register" class="panel field-ink" data-nav="dark" data-index="6" style="z-index: 7">
          <i class="panel__veil" aria-hidden="true" />
          <div class="panel__in two" v-reveal>
            <div class="two__label">
              <p class="eyebrow fade" style="--i: 0"><span class="n">06</span><span class="sep">/</span>Register</p>
              <h2 class="display display--sm"><span class="mask" style="--i: 1"><span>Request</span></span><span class="mask" style="--i: 2"><span>a seat.</span></span></h2>
              <p class="note note--meta fade" style="--i: 3">
                {{ hackathon.dayLabel }}, {{ hackathon.dateLabel }}<br />{{ hackathon.timeLabel }}<br />{{ hackathon.location }}
              </p>
              <a class="host host--dark fade" style="--i: 3" :href="hackathon.host.url" target="_blank" rel="noopener noreferrer">
                <span class="host__by">Hosted by</span>
                <img class="host__logo" :src="hackathon.host.logoOnDark" :alt="hackathon.host.name" width="1301" height="357" />
              </a>
              <a class="host host--dark sponsor fade" style="--i: 3" :href="hackathon.sponsor.url" target="_blank" rel="noopener noreferrer">
                <span class="host__by">Sponsored by</span>
                <img v-if="hackathon.sponsor.logoOnDark" class="host__logo" :src="hackathon.sponsor.logoOnDark" :alt="hackathon.sponsor.name" />
                <span v-else class="sponsor__word">Boettcher<br />Foundation</span>
              </a>
              <p v-if="pitchName && !done" class="note fade" style="--i: 3">We'll attach your pitch, <em>{{ pitchName }}</em>, to your registration.</p>
            </div>
            <div class="fade" style="--i: 3">
              <form v-if="!done" class="form" @submit.prevent="submit">
                <label class="fld">
                  <span>Name</span>
                  <input ref="nameInput" v-model="form.name" type="text" name="name" autocomplete="name" required maxlength="120" />
                </label>
                <label class="fld">
                  <span>Email</span>
                  <input v-model="form.email" type="email" name="email" autocomplete="email" required maxlength="200" />
                </label>
                <label class="fld">
                  <span>Town, team or organization <em>optional</em></span>
                  <input v-model="form.organization" type="text" name="organization" autocomplete="organization" maxlength="200" />
                </label>
                <label class="fld fld--wide">
                  <span>Why are you interested?</span>
                  <textarea v-model="form.note" name="note" rows="3" maxlength="1000" required placeholder="The problem you care about, or what you hope to build" />
                </label>
                <p v-if="error" class="form__error" role="alert">{{ error }}</p>
                <div class="form__actions">
                  <button class="btn-line" type="submit" :disabled="sending" data-cursor="Send">{{ sending ? 'Sending…' : 'Register' }}</button>
                  <p class="fine">Free. Seats are limited: we read every registration and send invites by email.</p>
                </div>
              </form>
              <div v-else class="done">
                <p class="display display--sm">{{ registered?.repeat ? 'Already registered.' : 'Request received.' }}</p>
                <p class="note">
                  <template v-if="registered?.repeat">We already have a registration for {{ registered.email }}. We'll be in touch there.</template>
                  <template v-else>Thank you{{ registered?.name ? `, ${registered.name.split(' ')[0]}` : '' }}. We read every registration; if there's a seat for you, your official invite will follow by email{{ registered?.email ? ` to ${registered.email}` : '' }}.</template>
                  Bring a community problem you can't stop thinking about.
                </p>
                <button class="link done__again" type="button" @click="registerAnother">Register someone else</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- after the stack: questions and the foot, back over the field -->
      <section v-if="view === 'full'" class="tail field-clear" data-index="7">
        <div class="panel__in two" v-reveal>
          <div class="two__label">
            <p class="eyebrow fade" style="--i: 0"><span class="n">07</span><span class="sep">/</span>Questions</p>
          </div>
          <div class="faq">
            <details v-for="(f, i) in hackathon.faq" :key="f.q" class="faq__item fade" :style="{ '--i': i + 1 }">
              <summary>{{ f.q }}</summary>
              <p>{{ f.a }}</p>
            </details>
          </div>
        </div>
        <footer class="foot" v-reveal>
          <div class="foot__lead fade" style="--i: 0">
            <p class="foot__tag">{{ hackathon.tagline }}</p>
            <div class="credits">
              <a class="host host--foot" :href="hackathon.host.url" target="_blank" rel="noopener noreferrer">
                <span class="host__by">Hosted by</span>
                <img class="host__logo" :src="hackathon.host.logo" :alt="hackathon.host.name" width="1300" height="358" />
              </a>
              <a class="host sponsor" :href="hackathon.sponsor.url" target="_blank" rel="noopener noreferrer">
                <span class="host__by">Sponsored by</span>
                <img v-if="hackathon.sponsor.logo" class="host__logo" :src="hackathon.sponsor.logo" :alt="hackathon.sponsor.name" />
                <span v-else class="sponsor__word">Boettcher<br />Foundation</span>
              </a>
            </div>
          </div>
          <nav class="foot__links fade" style="--i: 1">
            <router-link to="/">ruralpatternlanguage.com</router-link>
            <router-link to="/patterns">The 50 patterns</router-link>
            <router-link to="/demo">Try PAL</router-link>
            <a :href="`mailto:${hackathon.contact}`">{{ hackathon.contact }}</a>
            <button class="foot__play" type="button" @click="openGame">Play again</button>
          </nav>
        </footer>
      </section>

      <!-- registration alone -->
      <main v-if="view === 'register'" class="solo field-ink" data-nav="dark">
        <div class="panel__in two" v-reveal>
          <div class="two__label">
            <p class="eyebrow fade" style="--i: 0">Register</p>
            <h2 class="display display--sm"><span class="mask" style="--i: 1"><span>Request</span></span><span class="mask" style="--i: 2"><span>a seat.</span></span></h2>
            <p class="note note--meta fade" style="--i: 3">
              {{ hackathon.dayLabel }}, {{ hackathon.dateLabel }}<br />{{ hackathon.timeLabel }}<br />{{ hackathon.location }}
            </p>
            <a class="host host--dark fade" style="--i: 3" :href="hackathon.host.url" target="_blank" rel="noopener noreferrer">
              <span class="host__by">Hosted by</span>
              <img class="host__logo" :src="hackathon.host.logoOnDark" :alt="hackathon.host.name" width="1301" height="357" />
            </a>
            <a class="host host--dark sponsor fade" style="--i: 3" :href="hackathon.sponsor.url" target="_blank" rel="noopener noreferrer">
              <span class="host__by">Sponsored by</span>
              <img v-if="hackathon.sponsor.logoOnDark" class="host__logo" :src="hackathon.sponsor.logoOnDark" :alt="hackathon.sponsor.name" />
              <span v-else class="sponsor__word">Boettcher<br />Foundation</span>
            </a>
            <p v-if="pitchName && !done" class="note fade" style="--i: 3">We'll attach your pitch, <em>{{ pitchName }}</em>, to your registration.</p>
          </div>
          <div class="fade" style="--i: 3">
            <form v-if="!done" class="form" @submit.prevent="submit">
              <label class="fld">
                <span>Name</span>
                <input ref="nameInput" v-model="form.name" type="text" name="name" autocomplete="name" required maxlength="120" />
              </label>
              <label class="fld">
                <span>Email</span>
                <input v-model="form.email" type="email" name="email" autocomplete="email" required maxlength="200" />
              </label>
              <label class="fld">
                <span>Town, team or organization <em>optional</em></span>
                <input v-model="form.organization" type="text" name="organization" autocomplete="organization" maxlength="200" />
              </label>
              <label class="fld fld--wide">
                <span>Why are you interested?</span>
                <textarea v-model="form.note" name="note" rows="3" maxlength="1000" required placeholder="The problem you care about, or what you hope to build" />
              </label>
              <p v-if="error" class="form__error" role="alert">{{ error }}</p>
              <div class="form__actions">
                <button class="btn-line" type="submit" :disabled="sending" data-cursor="Send">{{ sending ? 'Sending…' : 'Register' }}</button>
                <p class="fine">Free. Seats are limited: we read every registration and send invites by email.</p>
              </div>
            </form>
            <div v-else class="done">
              <p class="display display--sm">{{ registered?.repeat ? 'Already registered.' : 'Request received.' }}</p>
              <p class="note">
                <template v-if="registered?.repeat">We already have a registration for {{ registered.email }}. We'll be in touch there.</template>
                <template v-else>Thank you{{ registered?.name ? `, ${registered.name.split(' ')[0]}` : '' }}. We read every registration; if there's a seat for you, your official invite will follow by email{{ registered?.email ? ` to ${registered.email}` : '' }}.</template>
                Bring a community problem you can't stop thinking about.
              </p>
              <button class="link done__again" type="button" @click="registerAnother">Register someone else</button>
            </div>
            <p class="solo__more">
              <button class="link" type="button" @click="showFull()">Read about the sprint</button>
              <button class="link" type="button" @click="openGame">Back to the game</button>
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- the index: which panel holds the middle, and how far down -->
    <div v-if="mode === 'site' && view === 'full'" class="hud-index" aria-hidden="true">
      <div class="hud-index__slot"><Transition name="flip"><span :key="sectionN">{{ sectionN }}</span></Transition></div>
      <span class="hud-index__of">/ {{ String(SECTIONS.length - 1).padStart(2, '0') }}</span>
      <div class="hud-index__slot hud-index__slot--lbl"><Transition name="flip"><span :key="sectionLabel">{{ sectionLabel }}</span></Transition></div>
      <i class="hud-index__track"><i :style="{ transform: `scaleX(${progress})` }" /></i>
    </div>
  </div>
</template>

<style scoped>
.hk {
  --paper: #f7f2e9;
  --bone: #f3eee4;
  --ink: #1b1b1b;
  --ink-2: #454545;
  --ink-3: #7a7a7a;
  --mint: #a9cfbf;
  --lavender: #c0b1e3;
  --peach: #e9b39a;
  --warm: #c4572f;
  --hair: rgba(27, 27, 27, 0.16);
  --hair-strong: rgba(27, 27, 27, 0.34);
  --hk-chrome: 64px;
  --hk-pad: clamp(1.25rem, 4vw, 3.5rem);
  --ease-slow: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.76, 0, 0.24, 1);
  --curtain: 1.3s var(--ease-slow);
  --bg: var(--paper);
  --on: var(--ink);

  position: relative;
  min-height: 100vh;
  color: var(--ink);
  font-weight: 300;
  letter-spacing: -0.01em;
  line-height: 1.5;
}

/* fields: each panel sets its own ink and background */
.field-clear { --bg: transparent; --on: var(--ink); }
.field-paper { --bg: var(--paper); --on: var(--ink); }
.field-ink { --bg: var(--ink); --on: var(--bone); }
.field-mint { --bg: var(--mint); --on: var(--ink); }
.field-lavender { --bg: var(--lavender); --on: var(--ink); }

/* the moment between the game and PAL */
.veil {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  background: rgba(247, 242, 233, 0.82);
}
.veil-enter-active { transition: opacity 0.6s ease; }
.veil-leave-active { transition: opacity 0.4s ease; }
.veil-enter-from, .veil-leave-to { opacity: 0; }

/* ------------------------------------------------------------- chrome */
.chrome {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: var(--hk-chrome);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 var(--hk-pad);
  color: var(--chrome-on, var(--ink));
  transition: color 0.5s linear;
}
/*
 * Once the page scrolls, the chrome lays down a band in the colour of the
 * panel beneath it, fading at its foot, so text never runs under the links.
 */
.chrome::before {
  content: '';
  position: absolute;
  inset: 0 0 -1.25rem 0;
  z-index: -1;
  background: linear-gradient(to bottom, var(--chrome-bg, transparent) calc(100% - 1.25rem), transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease;
}
.is-scrolled.mode-site .chrome::before {
  opacity: 1;
}
.chrome__brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.6rem;
  color: inherit;
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
/* in the game the brand steps aside; the game's step takes its line */
.chrome__brand {
  transition: opacity 1.2s cubic-bezier(0.45, 0.05, 0.2, 1) 0.4s, visibility 0s linear 0s;
}
.mode-game .chrome__brand {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.8s ease, visibility 0s linear 0.8s;
}
.chrome__sep,
.sep {
  font-weight: 300;
  opacity: 0.5;
  margin: 0 0.1em;
}
.chrome__sub {
  opacity: 0.7;
}
.chrome__nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}
.chrome__link {
  padding: 0.4rem 0;
  border: 0;
  border-bottom: 1px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  opacity: 0.75;
  cursor: pointer;
  transition: opacity 0.3s ease, border-color 0.3s ease;
}
.chrome__link:hover {
  opacity: 1;
  border-bottom-color: currentColor;
}
.chrome__link--strong {
  opacity: 1;
  border-bottom-color: currentColor;
}

/* ------------------------------------------------------------ curtain */
.site {
  position: relative;
  z-index: 10;
  clip-path: inset(100% 0 0 0);
  transform: translateY(6vh);
  transition: clip-path var(--curtain) 0.15s, transform var(--curtain) 0.15s;
  pointer-events: none;
}
.mode-site .site {
  clip-path: inset(0 0 0 0);
  transform: none;
  pointer-events: auto;
}

/* ------------------------------------------------------------- the stack */
.stack {
  position: relative;
}
.panel {
  position: sticky;
  top: 0;
  min-height: 100vh;
  min-height: 100svh;
  background: var(--bg);
  color: var(--on);
  overflow: hidden;
}
/* the panel beneath eases back and darkens as the next rises over it */
.panel__in {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: calc(var(--hk-chrome) + 2rem) var(--hk-pad) clamp(3rem, 8vh, 6rem);
  max-width: 1500px;
  margin: 0 auto;
  transform: scale(calc(1 - var(--cover, 0) * 0.06)) translateY(calc(var(--cover, 0) * -4vh));
  transform-origin: center 42%;
  will-change: transform;
}
.panel__veil {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--ink);
  opacity: calc(var(--cover, 0) * 0.45);
  pointer-events: none;
}
.field-ink .panel__veil {
  background: #000;
}

/* after the stack */
.tail {
  position: relative;
  z-index: 7;
  color: var(--ink);
}
.tail .panel__in {
  min-height: auto;
  padding-top: clamp(5rem, 12vh, 9rem);
  transform: none;
}
.solo {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  background: var(--bg);
  color: var(--on);
}

/* ------------------------------------------------------------- reveals */
.mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
  margin-bottom: -0.08em;
}
.mask > span {
  display: block;
}
.reveal-init .mask > span {
  transform: translateY(112%);
}
.reveal-init .fade {
  opacity: 0;
  transform: translateY(22px);
}
.revealed .mask > span {
  transform: none;
  transition: transform 1.6s var(--ease-slow) calc(var(--i, 0) * 0.14s);
}
.revealed .fade {
  opacity: 1;
  transform: none;
  transition: opacity 1.4s ease calc(var(--i, 0) * 0.14s), transform 1.6s var(--ease-slow) calc(var(--i, 0) * 0.14s);
}

/* --------------------------------------------------------------- type */
.eyebrow {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--on);
  opacity: 0.85;
}
.eyebrow .n {
  font-variant-numeric: tabular-nums;
}
.eyebrow--dim {
  opacity: 0.6;
}
.display {
  font-weight: 200;
  font-size: clamp(2.8rem, 1rem + 7vw, 7.6rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
}
.display--sm {
  font-size: clamp(2.2rem, 1rem + 4vw, 5rem);
  letter-spacing: -0.035em;
}
.h2 {
  font-weight: 200;
  font-size: clamp(2rem, 1rem + 3.2vw, 4.4rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
}
.lede {
  max-width: 32ch;
  font-size: clamp(1.15rem, 1rem + 0.8vw, 1.6rem);
  line-height: 1.38;
  letter-spacing: -0.015em;
}
.tease {
  max-width: 46ch;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--ink-2);
}
.note {
  max-width: 34ch;
  font-size: 1rem;
  line-height: 1.55;
  opacity: 0.8;
}
.note em {
  font-style: normal;
  opacity: 1;
  font-weight: 500;
}
.note--meta {
  line-height: 1.65;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
  margin-top: 0.25rem;
}
.btn-line {
  position: relative;
  padding: 0.85rem 1.8rem;
  border: 1.5px solid var(--on);
  background: transparent;
  color: var(--on);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.45s ease, opacity 0.3s ease;
  z-index: 0;
}
.btn-line::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--on);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.55s var(--ease-slow);
  z-index: -1;
}
.btn-line:hover:not(:disabled) {
  color: var(--bg);
}
.field-clear .btn-line:hover:not(:disabled) {
  color: var(--paper);
}
.btn-line:hover:not(:disabled)::before {
  transform: scaleX(1);
}
.btn-line:disabled {
  opacity: 0.4;
  cursor: wait;
}
.link {
  padding: 0.5rem 0;
  border: 0;
  border-bottom: 1px solid currentColor;
  background: none;
  color: var(--on);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.75;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.link:hover {
  opacity: 1;
}

/* --------------------------------------------------------------- hero */
.hero {
  gap: 1.5rem;
}
.hero__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--hair-strong);
}
@media (min-width: 900px) {
  .hero__row {
    grid-template-columns: 1.2fr 1fr;
    gap: 4rem;
  }
}
.hero__lead {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.meta {
  margin: 0;
  display: grid;
  gap: 0.6rem;
  align-content: start;
}
.meta div {
  display: grid;
  grid-template-columns: 6.6rem 1fr;
  gap: 1rem;
  align-items: baseline;
}
.meta dt {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.meta dd {
  margin: 0;
  font-size: 0.98rem;
}
.meta__host {
  align-items: center !important;
  margin-top: 0.4rem;
}
/* the host's wordmark: small, quiet, its own colour */
.host {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  color: inherit;
  text-decoration: none;
  opacity: 0.92;
  transition: opacity 0.4s ease;
}
.host:hover {
  opacity: 1;
}
.host__logo {
  display: block;
  width: auto;
  height: 2.1rem;
}
.host__by {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.6;
}
.host--dark {
  margin-top: 0.5rem;
}
.host--dark + .host--dark {
  margin-top: 0;
}
/* the sponsor's name, set as a stacked wordmark beside the host's */
.sponsor__word {
  display: block;
  font-size: 0.86rem;
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.credits {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2.5rem;
}
.foot__lead {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ----------------------------------------------------------- panels */
.two {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
}
.two > * {
  min-width: 0;
}
@media (min-width: 900px) {
  .two {
    grid-template-columns: minmax(16rem, 2fr) minmax(0, 3fr);
    gap: 5rem;
    align-items: start;
  }
}
.two__label {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.manifesto {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2.5vh, 1.5rem);
  margin-top: 2rem;
}
.manifesto__line {
  max-width: 22ch;
  font-weight: 200;
  font-size: clamp(2rem, 1rem + 4.2vw, 5.4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.ledger {
  margin: 0;
  border-top: 1px solid currentColor;
}
.ledger__row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(27, 27, 27, 0.22);
}
.ledger__row dt {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.65;
  padding-top: 0.4rem;
}
.ledger__row dd {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.3rem, 1rem + 1.4vw, 2.3rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hair-strong);
}
.track {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  grid-template-areas: 'n name' 'n blurb';
  column-gap: 1rem;
  align-items: baseline;
  padding: clamp(0.6rem, 1.2vh, 0.9rem) 0;
  border-bottom: 1px solid var(--hair);
}
.track__n {
  grid-area: n;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  color: var(--ink-3);
}
.track__name {
  grid-area: name;
  font-weight: 200;
  font-size: clamp(1.6rem, 1rem + 2.6vw, 3.6rem);
  line-height: 1.04;
  letter-spacing: -0.04em;
}
.track__blurb {
  grid-area: blurb;
  font-size: 0.92rem;
  color: var(--ink-2);
}
@media (min-width: 900px) {
  .track {
    grid-template-columns: 2.5rem 1fr auto;
    grid-template-areas: 'n name blurb';
  }
  .track__blurb {
    text-align: right;
  }
}

.day {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}
@media (min-width: 1100px) {
  .day {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
}
.schedule,
.crit {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid currentColor;
}
.schedule li {
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(27, 27, 27, 0.2);
  font-size: 1.05rem;
}
.schedule__time {
  font-variant-numeric: tabular-nums;
  opacity: 0.6;
}
.judging {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.judging__prizes {
  margin-top: 1.5rem;
}
.crit__w {
  margin-left: 0.75rem;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  opacity: 0.55;
  vertical-align: middle;
}
.day__half {
  margin-bottom: 0.75rem;
}
/* resources to read before the day */
.res {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.res__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hair-strong);
}
/* the documents, before they are ready: listed, not linked */
.soon {
  display: inline-block;
  margin-left: 0.6rem;
  padding: 0.18rem 0.5rem 0.14rem;
  border: 1px solid currentColor;
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--warm);
  vertical-align: middle;
}
.res__item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--hair);
}
.res__list.is-soon .res__name::after {
  content: none;
}
.res__list.is-soon .res__name {
  opacity: 0.7;
}
.res__list a {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--hair);
  color: inherit;
  text-decoration: none;
  transition: padding-left 0.6s var(--ease-slow), border-color 0.4s ease;
}
.res__list a:hover {
  padding-left: 0.5rem;
  border-color: currentColor;
}
.res__name {
  font-weight: 300;
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}
.res__name::after {
  content: '\00a0\00a0\2193';
  font-size: 0.8em;
  opacity: 0.5;
}
.res__what {
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  opacity: 0.65;
}
.crit li {
  display: grid;
  gap: 0.15rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(27, 27, 27, 0.2);
}
.crit__name {
  font-weight: 300;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.crit__blurb {
  font-size: 0.95rem;
  opacity: 0.75;
}

/* ----------------------------------------------------------- register */
.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1.75rem 2.5rem;
  max-width: min(52rem, 100%);
}
.fld {
  display: grid;
  gap: 0.5rem;
}
.fld--wide {
  grid-column: 1 / -1;
}
.fld > span {
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.65;
}
.fld em {
  font-style: normal;
  text-transform: none;
  letter-spacing: 0;
  margin-left: 0.4rem;
}
.fld input,
.fld textarea {
  width: 100%;
  padding: 0.65rem 0;
  border: 0;
  border-bottom: 1px solid currentColor;
  border-radius: 0;
  background: transparent;
  color: var(--on);
  font: inherit;
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}
.fld textarea {
  resize: vertical;
}
.fld input:focus,
.fld textarea:focus {
  outline: none;
  opacity: 1;
}
.form__actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 2rem;
}
.fine {
  font-size: 0.85rem;
  opacity: 0.6;
}
.done__again {
  margin-top: 1.25rem;
}
.form__error {
  grid-column: 1 / -1;
  color: var(--peach);
  font-weight: 500;
}
.done {
  display: grid;
  gap: 1rem;
}
.solo__more {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  margin-top: 2.5rem;
}

/* ----------------------------------------------------------------- faq */
.faq {
  max-width: 52rem;
  border-top: 1px solid var(--hair-strong);
}
.faq__item {
  border-bottom: 1px solid var(--hair);
}
.faq__item summary {
  list-style: none;
  position: relative;
  padding: 1.1rem 2.5rem 1.1rem 0;
  font-weight: 200;
  font-size: clamp(1.2rem, 1rem + 1vw, 1.8rem);
  letter-spacing: -0.025em;
  cursor: pointer;
}
.faq__item summary::-webkit-details-marker {
  display: none;
}
.faq__item summary::after {
  content: '+';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 200;
  font-size: 1.5rem;
  color: var(--ink-3);
  transition: transform 0.4s var(--ease-slow);
}
.faq__item[open] summary::after {
  transform: translateY(-50%) rotate(45deg);
}
.faq__item p {
  padding: 0 0 1.25rem;
  max-width: 58ch;
  color: var(--ink-2);
  line-height: 1.55;
}

/* ---------------------------------------------------------------- foot */
.foot {
  max-width: 1500px;
  margin: clamp(4rem, 10vh, 8rem) auto 0;
  padding: 1.5rem var(--hk-pad) clamp(3rem, 8vh, 6rem);
  border-top: 1.5px solid var(--ink);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.25rem 3rem;
}
.foot__tag {
  font-weight: 200;
  font-size: clamp(1.1rem, 1rem + 0.8vw, 1.6rem);
  letter-spacing: -0.025em;
}
.foot__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.75rem;
}
.foot__links a,
.foot__play {
  padding: 0;
  border: 0;
  border-bottom: 1px solid transparent;
  background: none;
  color: var(--ink-2);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.foot__links a:hover,
.foot__play:hover {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

/* ----------------------------------------------------------- the index */
/* phones and short screens: the index has nowhere to sit that is not over the content */
@media (max-width: 760px), (max-height: 560px) {
  .hud-index {
    display: none !important;
  }
}
.hud-index {
  position: fixed;
  left: var(--hk-pad);
  right: var(--hk-pad);
  bottom: calc(var(--hk-pad) - 6px);
  z-index: 30;
  display: flex;
  align-items: baseline;
  gap: 0.9em;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--chrome-on, var(--ink));
  pointer-events: none;
  mix-blend-mode: normal;
}
.hud-index__slot {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: 1.5em;
  min-width: 2ch;
  vertical-align: bottom;
}
.hud-index__slot > span {
  display: block;
}
.hud-index__slot--lbl {
  min-width: 9ch;
}
.hud-index__of {
  opacity: 0.5;
}
.hud-index__track {
  flex: 1;
  display: block;
  height: 1px;
  margin-left: 1.5rem;
  background: currentColor;
  opacity: 0.25;
  position: relative;
}
.hud-index__track i {
  position: absolute;
  inset: 0;
  background: currentColor;
  transform-origin: left;
  opacity: 1;
}
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.7s var(--ease-slow), opacity 0.5s ease;
}
.flip-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.flip-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.flip-leave-active {
  position: absolute;
  left: 0;
  top: 0;
}

@media (max-width: 640px) {
  .chrome__sub,
  .chrome__sep {
    display: none;
  }
  .chrome__nav {
    gap: 1.25rem;
  }
  .ledger__row {
    grid-template-columns: 5rem 1fr;
  }
  .meta div {
    grid-template-columns: 6.1rem 1fr;
  }
  .hud-index__slot--lbl {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site,
  .panel__in,
  .track__name,
  .flip-enter-active,
  .flip-leave-active {
    transition: none;
  }
}
</style>
