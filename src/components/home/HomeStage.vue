<template>
  <div class="stage gradient-bg" :class="[`stage--${theme}`, { 'is-live': theme === 'hero' }]">
    <div class="stage__veil" />
    <div class="stage__orb">
      <PatternSphere
        ref="sphere"
        :place="place"
        :labels="theme === 'hero' && props.b < 0.25 ? [10, 4] : [0, 0]"
        :mask="false"
        :dim="dim"
        :blur="blur"
        :soft="theme !== 'hero' || props.b > 0.2"
        :still="still"
        :cards="cardsOn"
        :hold="pinned"
        :avoid="avoid"
        @hover="(id) => emit('hover', id)"
        @select="onSelect"
      />
    </div>
    <PatternCard :pattern="cardsOn ? pinnedPattern : null" :variant="variant" :locate="locate" @close="pinned = null" />
    <p class="stage__hint" :class="{ 'is-on': hintOn }">Rest on a pattern, or click it, to see where it has worked.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PatternSphere, { type SpherePlace } from '@/components/PatternSphere.vue'
import PatternCard from '@/components/home/PatternCard.vue'
import { allPatterns } from '@/utils/data/patterns'

/**
 * The home page's backdrop: one fixed layer holding the globe and a wash of
 * colour, which the page's panels scroll over. In the hero the globe is a
 * horizon that rises into full view as the copy lifts away; from then on it
 * sits softly out of focus behind the panels while the wash takes each
 * panel's colour. The CTA and footer are opaque and slide over the top.
 *
 * While the globe is the subject, resting on a pattern or clicking it holds
 * it up in a card beside the globe: a line on the horizon, the whole story
 * once the globe is whole.
 */
export type StageTheme = 'hero' | 'what' | 'how' | 'proof' | 'off'

const props = withDefaults(defineProps<{ theme: StageTheme; p: number; b: number; still?: boolean }>(), { p: 0, b: 0, still: false })
const emit = defineEmits<{ hover: [id: number | null] }>()

// The horizon: the radius is a fraction of the viewport's short side and the
// centre a fraction of its height, so the centre is worked out from where the
// top of the arc should be, `REST` once settled and `START` below the fold.
const R = 1.05
const PR = 0.95
const REST = 0.6
const PREST = 0.7
const START = 1.04
const centreFor = (top: number, r: number) => (top * window.innerHeight + r * Math.min(window.innerWidth, window.innerHeight)) / window.innerHeight

// where the globe rests once the hero has lifted away: centred in the room
// below the navbar, so its top is never under the bar, and the same spot
// behind every panel, going out of focus as the first one arrives (`b`)
const MAX_BLUR = 4
let navH = 0
function restPlace() {
  const w = window.innerWidth
  const h = window.innerHeight
  const s = Math.min(w, h)
  const room = h - navH
  const cy = (navH + room / 2) / h
  const r = Math.min(0.42 * s, room / 2 - 28) / s
  const pr = Math.min(0.44 * s, room / 2 - 24) / s
  return { cx: 0.5, cy, r, pcx: 0.5, pcy: cy + 0.02, pr }
}
function measureNav() {
  navH = document.querySelector<HTMLElement>('.navbar')?.offsetHeight ?? 0
}

const place = ref<SpherePlace>({ cx: 0.5, cy: 3, r: R, pcx: 0.5, pcy: 3, pr: PR })
const dim = ref(1)
const blur = ref(0)
const cur = { cx: 0.5, cy: 3, r: R, pcx: 0.5, pcy: 3, pr: PR, dim: 1, p: 0, blur: 0 }
// what the names keep clear of: the hero copy until it has lifted away, then
// the first panel as it arrives, and always the card
const avoid = computed(() =>
  props.theme !== 'hero'
    ? []
    : cur.p > 0.55
      ? ['.navbar', '.beta-banner', '.pcard', '.stage__hint', '.what .panel__title', '.what .panel__lede', '.what .facets']
      : ['.navbar', '.horizon__copy', '.horizon__foot', '.beta-banner', '.pcard']
)

/* ------------------------------------------------------------ the card */

const sphere = ref<InstanceType<typeof PatternSphere> | null>(null)
const pinned = ref<number | null>(null)
const pinnedPattern = computed(() => (pinned.value === null ? null : (allPatterns.find((x) => x.id === pinned.value) ?? null)))
// cards while the globe is the subject; the whole story once it is whole
const cardsOn = computed(() => props.theme === 'hero' && props.b < 0.2)
const variant = computed<'mini' | 'full'>(() => (props.p > 0.85 ? 'full' : 'mini'))
const hintOn = computed(() => cardsOn.value && props.p > 0.9 && props.b < 0.1 && pinned.value === null)
const locate = (id: number) => sphere.value?.locate(id) ?? null
const onSelect = (id: number | null) => {
  pinned.value = id
}
// the card is laid out for one phase; a scroll into the other lets it go
watch([variant, cardsOn], () => {
  pinned.value = null
})
// the page can make room for the card (the hero's foot steps aside on phones)
watch(pinned, (id) => document.body.classList.toggle('orb-card', id !== null))

/* ------------------------------------------------------------ the follower */

let frame = 0
let t0 = 0
let last = 0
let reduce = false
let settled = false

function tick(now: number) {
  if (!t0) t0 = now
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
  last = now
  const arrive = reduce ? 1 : Math.min(1, (now - t0) / 2400)
  const ease = 1 - Math.pow(1 - arrive, 3)

  // the target, and how quickly to follow it: brisk through the hero so the
  // globe answers the scroll, unhurried between panels
  let target: typeof cur
  let k: number
  const REST_PLACE = restPlace()
  if (props.theme === 'hero') {
    // the horizon becomes the globe as the hero's copy lifts away
    const p = props.p
    const lift = 1 - Math.pow(1 - p, 2)
    const cyRest = centreFor(START + (REST - START) * ease, R)
    const pcyRest = centreFor(START + (PREST - START) * ease, PR)
    target = {
      cx: 0.5,
      cy: cyRest + (REST_PLACE.cy - cyRest) * lift,
      r: R + (REST_PLACE.r - R) * p,
      pcx: 0.5,
      pcy: pcyRest + (REST_PLACE.pcy - pcyRest) * lift,
      pr: PR + (REST_PLACE.pr - PR) * p,
      dim: 1 - props.b * 0.35,
      p,
      blur: MAX_BLUR * props.b
    }
    k = 7
  } else {
    target = { ...REST_PLACE, dim: props.theme === 'off' ? 0 : 0.65, p: 1, blur: MAX_BLUR }
    k = 4
  }
  const f = reduce ? 1 : 1 - Math.exp(-dt * k)
  let moving = false
  for (const key of Object.keys(cur) as Array<keyof typeof cur>) {
    const d = target[key] - cur[key]
    if (Math.abs(d) > 0.0004) moving = true
    cur[key] += d * f
  }
  place.value = { cx: cur.cx, cy: cur.cy, r: cur.r, pcx: cur.pcx, pcy: cur.pcy, pr: cur.pr }
  dim.value = cur.dim
  blur.value = cur.blur

  settled = arrive >= 1 && !moving
  if (!settled) frame = requestAnimationFrame(tick)
  else frame = 0
}
const wake = () => {
  if (!frame) {
    last = 0
    frame = requestAnimationFrame(tick)
  }
}

watch(() => [props.theme, props.p, props.b], wake)

const onResize = () => {
  measureNav()
  wake()
}
onMounted(() => {
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  measureNav()
  window.addEventListener('resize', onResize, { passive: true })
  wake()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.body.classList.remove('orb-card')
  if (frame) cancelAnimationFrame(frame)
})
</script>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.stage.is-live {
  pointer-events: auto;
}
/* the wash: each panel's colour, crossfading as the page moves between them */
.stage__veil {
  position: absolute;
  inset: 0;
  background-color: rgba(253, 251, 247, 0);
  transition: background-color 1.6s ease;
}
.stage--what .stage__veil {
  background-color: rgba(184, 212, 200, 0.34);
}
.stage--how .stage__veil {
  background-color: rgba(232, 180, 160, 0.3);
}
.stage--proof .stage__veil {
  background-color: rgba(201, 184, 232, 0.32);
}
.stage--off .stage__veil {
  background-color: rgba(201, 184, 232, 0.32);
}
/* the globe's focus follows the scroll (see PatternSphere's blur); only the exit fades */
.stage__orb {
  position: absolute;
  inset: 0;
  transition: opacity 1.2s ease;
}
.stage--off .stage__orb {
  opacity: 0;
}
/* a word about the globe, once it is whole and nothing is held */
.stage__hint {
  position: absolute;
  left: var(--container-padding);
  bottom: 2.75rem;
  max-width: 16rem;
  margin: 0;
  font-size: 0.68rem;
  line-height: 1.6;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.9s ease, transform 0.9s ease;
  pointer-events: none;
}
.stage__hint.is-on {
  opacity: 1;
  transform: none;
  transition-delay: 0.6s;
}
@media (max-width: 767px) {
  .stage__hint {
    bottom: 1.5rem;
    padding: 0 var(--container-padding);
    font-size: 0.6rem;
  }
}
</style>
