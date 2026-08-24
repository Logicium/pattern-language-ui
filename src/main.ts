import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './router'
import { usePatternsStore } from './stores/patterns'
import { useStoriesStore } from './stores/stories'
import { useChallengesStore } from './stores/challenges'
import { useResourcesStore } from './stores/resources'
import { initApotomeAnalytics } from './kit/analytics'
import { applyDeep, initApotomeEditor, loadPublishedContent } from './kit/editor'
import { content } from './data/site'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(createHead())

app.mount('#app')

// Initialize all stores once on app load
const patternsStore = usePatternsStore()
const storiesStore = useStoriesStore()
const challengesStore = useChallengesStore()
const resourcesStore = useResourcesStore()

// Always fetch latest data - stores serve cached data immediately and refresh in background
patternsStore.fetchPatterns().catch((e) => console.error('Failed to load patterns:', e))
storiesStore.fetchStories().catch((e) => console.error('Failed to load stories:', e))
challengesStore.fetchChallenges().catch((e) => console.error('Failed to load challenges:', e))
resourcesStore.fetchResources().catch((e) => console.error('Failed to load resources:', e))

/* ----------------------------------------------------------------------
 * Apotome Labs studio: analytics, published copy overlay, in-situ editor.
 *
 * Opt-in on environment. With either variable unset this block does nothing
 * at all, so the site builds and runs standalone exactly as before.
 *
 * No fallback to VITE_API_URL here, deliberately: that variable is the
 * Pattern Language service's own address. Falling back to it would point
 * the editor and the analytics beacon at this app's backend, which knows
 * nothing about either. The studio gets its own variable or nothing.
 *
 * The published overlay is merged onto the content tree before the editor
 * starts, so the editor edits what visitors actually see rather than the
 * defaults compiled into the bundle. Mounting happens first either way: a
 * slow or unreachable studio API must never delay the site rendering.
 * ---------------------------------------------------------------------- */
const apotomeApi = import.meta.env.VITE_APOTOME_API_URL as string | undefined
const apotomeKey = import.meta.env.VITE_APOTOME_SITE_KEY as string | undefined

if (apotomeApi && apotomeKey) {
  initApotomeAnalytics({ siteKey: apotomeKey, apiUrl: apotomeApi, router })

  void loadPublishedContent({ siteKey: apotomeKey, apiUrl: apotomeApi }).then((overlay) => {
    if (overlay) applyDeep(content, overlay)
    initApotomeEditor({ siteKey: apotomeKey, apiUrl: apotomeApi, config: content })
  })
}
