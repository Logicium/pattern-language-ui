import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/services/api'

export function useSettings() {
  const router = useRouter()
  const authStore = useAuthStore()
  const currentUser = authStore.currentUser

  const myProfile = ref<any>(null)
  const showProfileEdit = ref(false)
  const showToast = ref(false)
  const toastMessage = ref('')
  const showLogoutModal = ref(false)

  const showSuccessToast = (message: string) => {
    toastMessage.value = message
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
  }

  const loadProfile = async () => {
    try {
      myProfile.value = await usersApi.getMyProfile()
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  onMounted(() => { loadProfile() })

  const handleProfileSaved = (updatedProfile: any) => {
    myProfile.value = updatedProfile
    authStore.updateUser(updatedProfile)
    showSuccessToast('Profile updated successfully')
  }

  const confirmLogout = () => {
    authStore.logout()
    router.push('/')
  }

  return {
    currentUser, myProfile, showProfileEdit,
    showToast, toastMessage, showLogoutModal,
    handleProfileSaved, confirmLogout, showSuccessToast
  }
}
