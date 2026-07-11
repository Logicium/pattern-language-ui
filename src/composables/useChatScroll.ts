import { ref, nextTick, onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * Shared scroll behavior for chat-like surfaces.
 *
 * Pinning is based on user INTENT, not position: only an upward scroll
 * (wheel, drag, scrollbar — anything that decreases scrollTop) releases the
 * pin, and reaching the bottom re-pins. Position alone can't be trusted
 * because the typing bubble grows through animated height transitions — the
 * view chronically lags a few pixels behind, which must not count as
 * "scrolled away".
 *
 * While pinned, a per-frame glue loop keeps the view locked to the bottom,
 * so continuously growing content (typing animations) never slides under
 * the fold between discrete scroll calls.
 */
export function useChatScroll(container: Ref<HTMLElement | null | undefined>) {
  const showJumpToBottom = ref(false)
  const pinnedToBottom = ref(true)
  const THRESHOLD = 80 // px from bottom considered "at bottom"

  let lastScrollTop = 0
  let rafId = 0

  const isAtBottom = (el: HTMLElement): boolean =>
    el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD

  /** Unconditional scroll — for user-initiated actions (send, jump button). */
  const scrollToBottom = (smooth = false) => {
    pinnedToBottom.value = true
    nextTick(() => {
      const el = container.value
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
      showJumpToBottom.value = false
    })
  }

  /** Follow output only while the user hasn't scrolled away. */
  const maybeScrollToBottom = () => {
    if (pinnedToBottom.value) scrollToBottom()
  }

  const onScroll = () => {
    const el = container.value
    if (!el) return

    // Content growth and the glue loop only ever INCREASE scrollTop, so a
    // decrease is always the user moving up — release the pin.
    if (el.scrollTop < lastScrollTop - 1) {
      pinnedToBottom.value = false
    } else if (isAtBottom(el)) {
      pinnedToBottom.value = true
    }
    lastScrollTop = el.scrollTop

    showJumpToBottom.value = !isAtBottom(el)
  }

  // Glue loop: while pinned, track the bottom every frame so animated height
  // growth (typing bubbles) can never outrun the view.
  const glue = () => {
    const el = container.value
    if (el && pinnedToBottom.value) {
      const target = el.scrollHeight - el.clientHeight
      if (target - el.scrollTop > 0.5) {
        el.scrollTop = target
        lastScrollTop = el.scrollTop
      }
    }
    rafId = requestAnimationFrame(glue)
  }

  onMounted(() => {
    container.value?.addEventListener('scroll', onScroll, { passive: true })
    scrollToBottom()
    rafId = requestAnimationFrame(glue)
  })

  onBeforeUnmount(() => {
    container.value?.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(rafId)
  })

  return { showJumpToBottom, pinnedToBottom, scrollToBottom, maybeScrollToBottom }
}
