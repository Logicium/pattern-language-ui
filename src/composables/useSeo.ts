import { toValue, type MaybeRefOrGetter } from 'vue'
import { useHead, useSeoMeta } from '@unhead/vue'

export const SITE_URL = 'https://www.ruralpatternlanguage.com'
export const SITE_NAME = 'Pattern Language'
export const DEFAULT_TITLE = 'Pattern Language — Designing Thriving Rural Communities'
export const DEFAULT_DESCRIPTION =
  'A collaborative tool empowering rural communities to design, plan, and implement innovative solutions to complex challenges.'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

/** Meta descriptions render best in search results under ~160 characters. */
export function truncateDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

export interface SeoOptions {
  /** Bare page title; the app-level titleTemplate appends the site name. */
  title: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  /** Canonical path (e.g. `/patterns/12`). Defaults to the current route path via App.vue. */
  path?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  type?: 'website' | 'article'
  noindex?: MaybeRefOrGetter<boolean | undefined>
}

/**
 * Sets title, description, canonical, Open Graph, and Twitter tags for a page.
 * Values are reactive: pass getters for data that loads asynchronously.
 */
export function useSeo(options: SeoOptions) {
  const description = () =>
    truncateDescription(toValue(options.description) || DEFAULT_DESCRIPTION)
  const canonical = () => {
    const path = toValue(options.path)
    return path !== undefined ? `${SITE_URL}${path}` : undefined
  }
  const image = () => toValue(options.image) || DEFAULT_OG_IMAGE

  useSeoMeta({
    title: () => toValue(options.title),
    description,
    ogSiteName: SITE_NAME,
    ogType: options.type || 'website',
    ogTitle: () => toValue(options.title) || DEFAULT_TITLE,
    ogDescription: description,
    ogUrl: canonical,
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title) || DEFAULT_TITLE,
    twitterDescription: description,
    twitterImage: image,
    robots: () => (toValue(options.noindex) ? 'noindex, nofollow' : undefined)
  })

  useHead({
    link: () => {
      const href = canonical()
      return href ? [{ rel: 'canonical', href }] : []
    }
  })
}
