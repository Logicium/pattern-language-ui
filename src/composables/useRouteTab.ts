import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Tab state that lives in the address bar (?tab=…).
 *
 * - Refreshing keeps the user on the tab they were viewing.
 * - Each tab switch pushes a history entry, so browser back/forward walks
 *   through previously visited tabs.
 * - The default tab keeps a clean URL (no ?tab param).
 */
export function useRouteTab<T extends string>(validTabs: readonly T[], defaultTab: T) {
  const route = useRoute()
  const router = useRouter()

  return computed<T>({
    get: () => {
      const q = route.query.tab
      return typeof q === 'string' && (validTabs as readonly string[]).includes(q)
        ? (q as T)
        : defaultTab
    },
    set: (tab) => {
      const current = route.query.tab
      const normalized = tab === defaultTab ? undefined : tab
      if ((current ?? undefined) === normalized) return
      router.push({ query: { ...route.query, tab: normalized } })
    },
  })
}
