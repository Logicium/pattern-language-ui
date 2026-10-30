<template>
  <div class="pcl" :class="[`pcl--${variant}`, { 'is-drawn': drawn && !phone }]">
    <!-- the wire from the card to its pattern -->
    <svg class="pcl__wire" aria-hidden="true">
      <path :d="wire" pathLength="1" />
      <circle :cx="node.x" :cy="node.y" r="5.5" />
    </svg>

    <!-- the side is on the card itself, so a card on its way out keeps its place -->
    <Transition name="pcard" @after-enter="onEntered">
      <article v-if="pattern" :key="pattern.id" ref="card" class="pcard" :class="`pcard--${side}`" role="dialog" :aria-label="pattern.title">
        <div class="pcard__in">
          <header class="pcard__head">
            <span class="pcard__num">{{ String(pattern.id).padStart(2, '0') }}</span>
            <span v-if="pattern.category" class="pcard__cat">{{ pattern.category }}</span>
            <button type="button" class="pcard__x" aria-label="Close" @click="emit('close')">
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" /></svg>
            </button>
          </header>

          <h3 class="pcard__title">{{ pattern.title }}</h3>
          <p class="pcard__desc">{{ pattern.description }}</p>

          <template v-if="variant === 'full'">
            <ul v-if="pattern.addresses?.length" class="pcard__for">
              <li v-for="a in pattern.addresses.slice(0, 3)" :key="a">{{ a }}</li>
            </ul>

            <ol v-if="stories.length" class="pcard__stories">
              <li v-for="(s, i) in stories" :key="i">
                <component
                  :is="s.url ? 'a' : 'div'"
                  class="story"
                  :href="s.url || undefined"
                  :target="s.url ? '_blank' : undefined"
                  :rel="s.url ? 'noopener noreferrer' : undefined"
                >
                  <span class="story__img" :class="{ 'is-empty': !s.image }">
                    <img v-if="s.image" :src="s.image" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="onImgError" />
                  </span>
                  <span class="story__body">
                    <span class="story__meta">
                      <template v-if="s.place">{{ s.place }}</template>
                      <template v-if="s.place && s.date"> · </template>
                      <template v-if="s.date">{{ s.date.slice(0, 4) }}</template>
                    </span>
                    <span class="story__title">{{ s.title }}</span>
                  </span>
                </component>
              </li>
            </ol>
          </template>

          <router-link :to="`/patterns/${pattern.id}`" class="pcard__go">
            Read the pattern
            <span class="pcard__arrow" aria-hidden="true">→</span>
          </router-link>
        </div>
      </article>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { examplesFor } from '@/data/pattern-examples'
import type { Pattern } from '@/types'

/**
 * A pattern, held up beside the globe: its number, name and one line, and in
 * the full card the problems it answers and the places it has already
 * worked, from the same real stories the game uses. A hairline runs from the
 * card to the pattern's dot and follows it. The card sits on whichever side
 * of the screen the dot is on; on phones it is a sheet at the foot.
 */
const props = defineProps<{
  pattern: Pattern | null
  variant: 'mini' | 'full'
  /** Where a pattern's dot is on screen, in the layer's pixels. */
  locate: (id: number) => { x: number; y: number; front: number } | null
}>()
const emit = defineEmits<{ close: [] }>()

const card = ref<HTMLElement | null>(null)
const side = ref<'left' | 'right'>('right')
const drawn = ref(false)
const phone = ref(false)
const node = ref({ x: 0, y: 0 })
const wire = ref('')

const stories = computed(() => (props.pattern ? examplesFor(props.pattern.id).slice(0, 3) : []))
function onImgError(e: Event) {
  ;(e.target as HTMLElement).closest('.story__img')?.classList.add('is-empty')
}

/* ------------------------------------------------------------ the wire */

let frame = 0
// while one card gives way to the next the wire is cut and held where it was,
// so it never swings to the new dot before there is a card to run from
let held = false

/** Where the wire runs now: from the card's near edge, a short run towards the globe, then straight to just short of the dot. */
function measure(at: { x: number; y: number }) {
  node.value = { x: at.x, y: at.y }
  const el = card.value
  if (!el || phone.value) return
  const r = el.getBoundingClientRect()
  const ax = side.value === 'right' ? r.left : r.right
  const ay = r.top + Math.min(r.height / 2, 44)
  const ex = side.value === 'right' ? ax - 28 : ax + 28
  const dx = at.x - ex
  const dy = at.y - ay
  const len = Math.hypot(dx, dy) || 1
  const stop = 9
  const tx = at.x - (dx / len) * stop
  const ty = at.y - (dy / len) * stop
  wire.value = `M${ax.toFixed(1)} ${ay.toFixed(1)}H${ex.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`
}
function follow() {
  frame = 0
  const p = props.pattern
  if (!p) return
  const at = props.locate(p.id)
  // the pattern has turned away (a drag): let the card go
  if (!at || at.front < 0.05) {
    emit('close')
    return
  }
  if (!held) measure(at)
  frame = requestAnimationFrame(follow)
}
function onEntered() {
  held = false
  const p = props.pattern
  const at = p && props.locate(p.id)
  if (at) measure(at)
  drawn.value = true
}

watch(
  () => props.pattern?.id,
  (id) => {
    drawn.value = false
    if (id === undefined) return
    held = true
    // which side the dot is on decides where the card stands; settled once, so
    // it never flips while the globe turns under it
    const at = props.locate(id)
    side.value = at && at.x < window.innerWidth / 2 ? 'left' : 'right'
    if (!frame) frame = requestAnimationFrame(follow)
  },
  { immediate: true }
)

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.pattern) emit('close')
}
const onResize = () => {
  phone.value = window.innerWidth < 768
}
onMounted(() => {
  onResize()
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.pcl {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.pcl__wire {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  stroke: var(--color-text-primary);
  stroke-width: 1;
}
/* the wire draws out from the card once it has arrived; when the card goes
   it fades where it is, then resets unseen, ready to draw again */
.pcl__wire path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
  transition: opacity 0.18s ease, stroke-dashoffset 0s linear 0.18s;
}
.pcl__wire circle {
  stroke: var(--color-accent-warm);
  opacity: 0;
  transition: opacity 0.12s ease;
}
.is-drawn .pcl__wire path {
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset 0.9s cubic-bezier(0.2, 0.75, 0.15, 1), opacity 0.15s ease;
}
.is-drawn .pcl__wire circle {
  opacity: 1;
  transition: opacity 0.5s ease 0.6s;
}

/* where the card stands */
.pcard {
  position: absolute;
  width: 17rem;
  pointer-events: auto;
}
.pcard--right {
  right: var(--container-padding);
}
.pcard--left {
  left: var(--container-padding);
}
.pcl--mini .pcard {
  top: 56vh;
}
.pcl--full .pcard {
  top: 50%;
  transform: translateY(-50%);
  width: 20rem;
}
.pcard__in {
  padding: 1.1rem 1.25rem 1.2rem;
  background: rgba(253, 251, 247, 0.78);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: 1px solid var(--hairline-strong);
}

/* the card arriving: out of a blur, the way PAL's replies do (the fade is on
   the root, where Vue times the transition; the small rise on the inside).
   One card giving way to the next: the old one lets go where it stands, a
   short settle up and out with no blur (a filter over the frosted panel is
   what stuttered), and the new one arrives a beat later, so on the same side
   it reads as one card becoming another and never a blink */
.pcard-enter-active {
  transition: opacity 0.5s ease 0.16s, filter 0.5s ease 0.16s;
}
.pcard-leave-active {
  transition: opacity 0.28s cubic-bezier(0.4, 0, 0.7, 0.2);
  pointer-events: none;
}
.pcard-enter-from {
  opacity: 0;
  filter: blur(5px);
}
.pcard-leave-to {
  opacity: 0;
}
.pcard__in {
  transition: transform 0.6s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.pcard-enter-active .pcard__in {
  transition-delay: 0.16s;
}
.pcard-enter-from .pcard__in {
  transform: translateY(10px);
}
.pcard-leave-active .pcard__in {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.7, 0.2);
}
.pcard-leave-to .pcard__in {
  transform: translateY(-6px);
}

.pcard__head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.pcard__num {
  color: var(--color-accent-warm);
  font-variant-numeric: tabular-nums;
}
.pcard__cat {
  color: var(--color-text-tertiary);
}
.pcard__x {
  margin-left: auto;
  width: 22px;
  height: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color 0.3s ease;
  align-self: center;
}
.pcard__x svg {
  width: 10px;
  height: 10px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
}
.pcard__x:hover {
  color: var(--color-text-primary);
}
.pcard__title {
  margin: 0 0 0.45rem;
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.pcard__desc {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* full: what it answers, and where it has worked */
.pcard__for {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}
.pcard__for li::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  margin-right: 0.5rem;
  vertical-align: middle;
  background: var(--color-accent-warm);
  border-radius: 50%;
}
.pcard__stories {
  margin: 1.1rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--hairline);
}
.story {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--hairline);
  color: inherit;
  text-decoration: none;
}
a.story:hover .story__title {
  color: var(--color-accent-warm);
}
.story__img {
  flex: none;
  width: 42px;
  height: 42px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.05), rgba(42, 42, 42, 0.11));
}
.story__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.85);
}
.story__img.is-empty img {
  display: none;
}
.story__body {
  min-width: 0;
}
.story__meta {
  display: block;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 0.15rem;
}
.story__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--color-text-primary);
  transition: color 0.3s ease;
}

/* the way through */
.pcard__go {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.1rem;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--color-text-primary);
  padding-bottom: 0.15rem;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.pcard__go:hover {
  color: var(--color-accent-warm);
  border-color: var(--color-accent-warm);
}
.pcard__arrow {
  display: inline-block;
  transition: transform 0.35s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.pcard__go:hover .pcard__arrow {
  transform: translateX(4px);
}

@media (max-width: 1100px) {
  .pcl--full .pcard {
    width: 17rem;
  }
}
/* phones: a sheet at the foot, no wire */
@media (max-width: 767px) {
  .pcl__wire {
    display: none;
  }
  .pcard--right,
  .pcard--left,
  .pcl--mini .pcard,
  .pcl--full .pcard {
    left: var(--container-padding);
    right: var(--container-padding);
    top: auto;
    /* above the beta banner, which sits at the foot on phones */
    bottom: 6rem;
    width: auto;
    transform: none;
  }
  .pcard__in {
    background: rgba(253, 251, 247, 0.92);
  }
  .pcard__stories li:nth-child(n + 3) {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pcl__wire path,
  .pcard-enter-active .pcard__in,
  .pcard-leave-active .pcard__in {
    transition: none;
  }
}
</style>
