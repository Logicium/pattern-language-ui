import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { usePatternsStore } from './stores/patterns'
import { useStoriesStore } from './stores/stories'
import { useChallengesStore } from './stores/challenges'
import { useResourcesStore } from './stores/resources'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

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
