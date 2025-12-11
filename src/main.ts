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

// Fetch data if stores are empty - with error boundaries
if (patternsStore.patterns.length === 0) {
  patternsStore.fetchPatterns().catch((e) => console.error('Failed to load patterns:', e))
}
if (storiesStore.stories.length === 0) {
  storiesStore.fetchStories().catch((e) => console.error('Failed to load stories:', e))
}
if (challengesStore.challenges.length === 0) {
  challengesStore.fetchChallenges().catch((e) => console.error('Failed to load challenges:', e))
}
if (resourcesStore.resources.length === 0) {
  resourcesStore.fetchResources().catch((e) => console.error('Failed to load resources:', e))
}
