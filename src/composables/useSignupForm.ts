import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export interface SignupFormData {
  firstName: string
  lastName: string
  communityName: string
  population: string
  state: string
  role: string
  email: string
  password: string
  selectedChallenges: string[]
  currentWork: string
  goals: string
}

export function useSignupForm() {
  const router = useRouter()
  const authStore = useAuthStore()

  const currentStep = ref(1)
  const isSubmitting = ref(false)
  const showErrorModal = ref(false)
  const errorTitle = ref('')
  const errorMessage = ref('')
  const isEmailConflict = ref(false)
  const isGoogleSignup = ref(false)
  const googleToken = ref('')

  const formData = ref<SignupFormData>({
    firstName: '',
    lastName: '',
    communityName: '',
    population: '',
    state: '',
    role: '',
    email: '',
    password: '',
    selectedChallenges: [],
    currentWork: '',
    goals: ''
  })

  const prefillFromGoogle = (credential: string) => {
    try {
      // Decode the Google ID token JWT to extract profile info
      const parts = credential.split('.')
      if (!parts[1]) throw new Error('Invalid token format')
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')))

      isGoogleSignup.value = true
      googleToken.value = credential
      formData.value.email = payload.email || ''
      formData.value.firstName = payload.given_name || ''
      formData.value.lastName = payload.family_name || ''

      // Auto-advance to step 2 since account info is prefilled
      currentStep.value = 2
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      console.error('Failed to decode Google token:', e)
      errorTitle.value = 'Google Sign-Up Failed'
      errorMessage.value = 'Could not read your Google profile data. Please try again.'
      showErrorModal.value = true
    }
  }

  const nextStep = () => {
    if (currentStep.value < 2) {
      currentStep.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    isSubmitting.value = true

    try {
      if (isGoogleSignup.value) {
        await authStore.googleSignup({
          token: googleToken.value,
          name: `${formData.value.firstName} ${formData.value.lastName}`,
          email: formData.value.email,
          location: formData.value.communityName,
          state: formData.value.state,
          currentWork: formData.value.currentWork,
          goals: formData.value.goals,
          interests: formData.value.selectedChallenges,
        })
      } else {
        await authStore.signup({
          email: formData.value.email,
          password: formData.value.password,
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          name: `${formData.value.firstName} ${formData.value.lastName}`,
          location: formData.value.communityName,
          state: formData.value.state,
          currentWork: formData.value.currentWork,
          goals: formData.value.goals,
          interests: formData.value.selectedChallenges
        })
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      await router.push('/dashboard')
    } catch (error: any) {
      console.error('Signup error:', error)

      if (error.message?.includes('409') || error.message?.includes('already exists')) {
        isEmailConflict.value = true
        errorTitle.value = 'Email Already in Use'
        errorMessage.value = `An account with the email "${formData.value.email}" already exists. Would you like to log in instead?`
      } else {
        isEmailConflict.value = false
        errorTitle.value = 'Signup Error'
        errorMessage.value = 'There was an error creating your account. Please try again or contact support if the problem persists.'
      }

      showErrorModal.value = true
    } finally {
      isSubmitting.value = false
    }
  }

  const handleGoToLogin = () => {
    router.push('/login')
  }

  return {
    currentStep,
    isSubmitting,
    showErrorModal,
    errorTitle,
    errorMessage,
    isEmailConflict,
    isGoogleSignup,
    formData,
    nextStep,
    prevStep,
    handleSubmit,
    handleGoToLogin,
    prefillFromGoogle,
  }
}
