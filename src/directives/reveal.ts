import type { Directive } from 'vue'

/**
 * `v-reveal`: the block it sits on starts as `reveal-init` and becomes
 * `revealed` once it has scrolled a little way into view, once. Inside it,
 * `.fade` blocks come up briskly out of nothing, each delayed a little by its
 * `--i`; the styles are in global.css. Headings and hairlines are left static
 * so the page never reads as late. Nothing is hidden when motion is reduced
 * or the observer is missing.
 */
let io: IntersectionObserver | null = null
function observer() {
  if (io || typeof IntersectionObserver === 'undefined') return io
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          io?.unobserve(e.target)
        }
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  )
  return io
}

export const vReveal: Directive<HTMLElement> = {
  mounted(el) {
    const o = observer()
    if (!o || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('reveal-init')
    o.observe(el)
  },
  beforeUnmount(el) {
    io?.unobserve(el)
  }
}
