import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function useLoginPage() {
  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const isLoadingGoogle = ref(false)
  const showErrorModal = ref(false)
  const errorTitle = ref('')
  const errorMessage = ref('')

  onMounted(() => {
    if (!(window as any).google?.accounts) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  const handleLogin = async () => {
    loading.value = true
    try {
      await authStore.login(email.value, password.value)
      await new Promise(resolve => setTimeout(resolve, 100))
      await router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      errorTitle.value = 'Login Failed'
      errorMessage.value = 'Invalid email or password. Please check your credentials and try again, or sign up for a new account.'
      showErrorModal.value = true
    } finally {
      loading.value = false
    }
  }

  const handleGoogleLogin = () => {
    isLoadingGoogle.value = true
    const google = (window as any).google

    if (!google?.accounts) {
      errorTitle.value = 'Google Sign-In Unavailable'
      errorMessage.value = 'Google Sign-In is not loaded. Please refresh the page and try again.'
      showErrorModal.value = true
      isLoadingGoogle.value = false
      return
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        if (response.credential) {
          try {
            await authStore.googleLogin(response.credential)
            await router.push('/dashboard')
          } catch (error: any) {
            console.error('Google login error:', error)
            const isNoAccount = error.message?.includes('No account found') || error.message?.includes('sign up')
            errorTitle.value = isNoAccount ? 'No Account Found' : 'Google Login Failed'
            errorMessage.value = isNoAccount
              ? 'No account is associated with this Google account. Please sign up first.'
              : 'Google authentication failed. Please try again.'
            showErrorModal.value = true
          }
        }
        isLoadingGoogle.value = false
      },
    })

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const btnContainer = document.createElement('div')
        btnContainer.style.display = 'none'
        document.body.appendChild(btnContainer)
        google.accounts.id.renderButton(btnContainer, {
          type: 'standard',
          size: 'large',
        })
        const gBtn = btnContainer.querySelector('div[role="button"]') as HTMLElement
        if (gBtn) gBtn.click()
        else isLoadingGoogle.value = false
      }
    })
  }

  const handleGoToSignup = () => {
    router.push('/signup')
  }

  return {
    email, password, loading, isLoadingGoogle,
    showErrorModal, errorTitle, errorMessage,
    handleLogin, handleGoogleLogin, handleGoToSignup
  }
}
