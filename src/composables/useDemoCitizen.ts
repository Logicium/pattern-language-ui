import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { demoApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

/**
 * Entering the Cottonwood Springs sandbox, from anywhere (the navbar button,
 * /demo, the city page).
 *
 * Resuming comes first: a visitor who already has a citizen — even one who
 * signed out — gets that citizen back, with every playbook and conversation
 * still attached. Only a first-timer (or an expired token) mints a new one.
 */
export function useDemoCitizen() {
  const router = useRouter()
  const authStore = useAuthStore()

  const entering = ref(false)
  const error = ref('')

  async function enterDemo(redirect = '/dashboard') {
    if (entering.value) return
    entering.value = true
    error.value = ''
    try {
      const session = authStore.storedDemoSession() ?? (await demoApi.createCitizen())
      authStore.enterDemoSession(session)
      await router.push(redirect)
    } catch (e) {
      const raw = e instanceof Error ? e.message : ''
      // A dead network surfaces as "Failed to fetch", which tells a visitor
      // nothing — name the actual situation instead.
      error.value = /failed to fetch|networkerror|load failed/i.test(raw)
        ? "We couldn't reach Pattern Language. Check your connection and try again."
        : raw || 'Could not open the demo. Please try again.'
    } finally {
      entering.value = false
    }
  }

  return { entering, error, enterDemo }
}
