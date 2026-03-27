import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { invitationsApi } from '@/services/api'

export function useDashboardLayout() {
  const authStore = useAuthStore()
  const user = computed(() => authStore.currentUser)

  const pendingInvitationsCount = ref(0)
  const isMobileMenuOpen = ref(false)

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
    document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }

  const handleLogout = () => {
    authStore.logout()
    closeMobileMenu()
  }

  const loadPendingInvitations = async () => {
    try {
      const invitations = await invitationsApi.getPending()
      pendingInvitationsCount.value = invitations.length
    } catch (error) {
      console.error('Failed to load pending invitations:', error)
    }
  }

  onMounted(() => {
    loadPendingInvitations()
    setInterval(loadPendingInvitations, 30000)
  })

  return {
    user, pendingInvitationsCount, isMobileMenuOpen,
    toggleMobileMenu, closeMobileMenu, handleLogout
  }
}
