import { onBeforeUnmount, watch, type Ref } from 'vue'

/**
 * A pinned hero: the hero holds at the top of the page (`position: sticky`,
 * via the `hero-pin` class in global.css) while everything after it slides
 * over it as a sheet. For depth, the hero's copy lifts away at a fraction
 * of the scroll, as the home hero's copy does, and fades out before the
 * sheet's edge reaches it. Both are tied to the scroll and
 * follow it through a damped follower, never raw scrollY, so trackpads and
 * frame drops never read as jumps. Once the sheet covers the hero it is
 * hidden so nothing behind the page keeps painting.
 *
 * Writes `--hero-shift` (px) and `--hero-fade` (0..1) on the element and
 * toggles `is-covered`. Reduced motion keeps the pin and the fade, but the
 * copy stays put. The element may arrive late (a hero inside a `v-if`), so
 * the ref is watched rather than read once.
 */
export function usePinnedHero(el: Ref<HTMLElement | null>, enabled: () => boolean = () => true) {
  const DRIFT = 0.3 // the copy's share of the scroll
  const FADE_BY = 0.75 // the copy is gone by this much of the hero's height
  const K = 10 // follower stiffness

  let host: HTMLElement | null = null
  let frame = 0
  let last = 0
  let cur = 0
  let target = 0
  let height = 1
  let reduce = false
  let covered = false
  let ro: ResizeObserver | null = null

  const measure = () => {
    height = Math.max(1, host?.offsetHeight ?? 1)
  }
  const aim = () => {
    target = Math.min(1, Math.max(0, window.scrollY / height))
  }

  function paint() {
    if (!host) return
    const f = Math.min(1, cur / FADE_BY)
    const fade = 1 - f * f * (3 - 2 * f)
    host.style.setProperty('--hero-shift', `${(reduce ? 0 : -cur * height * DRIFT).toFixed(1)}px`)
    host.style.setProperty('--hero-fade', fade.toFixed(3))
    const c = cur > 0.995
    if (c !== covered) {
      covered = c
      host.classList.toggle('is-covered', c)
    }
  }

  function tick(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
    last = now
    const d = target - cur
    cur += reduce ? d : d * (1 - Math.exp(-dt * K))
    if (Math.abs(target - cur) < 0.0005) cur = target
    paint()
    frame = cur !== target ? requestAnimationFrame(tick) : 0
  }

  const wake = () => {
    aim()
    if (!frame) {
      last = 0
      frame = requestAnimationFrame(tick)
    }
  }
  const onResize = () => {
    measure()
    wake()
  }

  function start(node: HTMLElement) {
    host = node
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    host.classList.add('hero-pin')
    // inline, since every hero's own scoped `position: relative` outranks a global class
    host.style.position = 'sticky'
    measure()
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(onResize)
      ro.observe(host)
    }
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', onResize)
    wake()
  }

  // `release` strips the pin from the element again. Not on unmount: the page
  // transition keeps the old page on screen after Vue has run these hooks, and
  // dropping the pin then makes the hero and the sheet's padding snap back
  // while the page is still fading out.
  function stop(release: boolean) {
    cancelAnimationFrame(frame)
    frame = 0
    ro?.disconnect()
    ro = null
    window.removeEventListener('scroll', wake)
    window.removeEventListener('resize', onResize)
    if (host && release) {
      host.classList.remove('hero-pin', 'is-covered')
      host.style.position = ''
    }
    host = null
    cur = target = 0
    covered = false
  }

  watch(
    el,
    (node) => {
      if (host) stop(true)
      if (node && enabled()) start(node)
    },
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(() => stop(false))
}
