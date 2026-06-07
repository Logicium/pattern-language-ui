import { ref, nextTick, onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * Shared scroll behavior for chat-like surfaces: auto-stick to bottom,
 * detect when the user scrolls up, and expose a jump-to-bottom helper.
 */
export function useChatScroll(container: Ref<HTMLElement | null | undefined>) {
  const showJumpToBottom = ref(false)
  const THRESHOLD = 80 // px from bottom considered "at bottom"

  const isAtBottom = (el: HTMLElement): boolean =>
    el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD

  const scrollToBottom = (smooth = false) => {
    nextTick(() => {
      const el = container.value
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
      showJumpToBottom.value = false
    })
  }

  const onScroll = () => {
    const el = container.value
    if (!el) return
    showJumpToBottom.value = !isAtBottom(el)
  }

  onMounted(() => {
    container.value?.addEventListener('scroll', onScroll, { passive: true })
    scrollToBottom()
  })

  onBeforeUnmount(() => {
    container.value?.removeEventListener('scroll', onScroll)
  })

  return { showJumpToBottom, scrollToBottom }
}
