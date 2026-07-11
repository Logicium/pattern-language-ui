import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * Pagination state that lives in the address bar (?page=…), so a refresh
 * doesn't bounce the user back to page one. Uses replace navigation — page
 * flips don't pile up in browser history the way tab switches do.
 * Page 1 keeps a clean URL (no ?page param).
 */
export function useRoutePage() {
  const route = useRoute()
  const router = useRouter()

  return computed<number>({
    get: () => {
      const p = Number(route.query.page)
      return Number.isInteger(p) && p > 1 ? p : 1
    },
    set: (page) => {
      const normalized = page > 1 ? String(page) : undefined
      if ((route.query.page ?? undefined) === normalized) return
      router.replace({ query: { ...route.query, page: normalized } })
    },
  })
}
