import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { invitationsApi } from '@/services/api'

export function useDashboardLayout() {
  const authStore = useAuthStore()
  const router = useRouter()
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
    router.push('/logout')
  }

  const loadPendingInvitations = async () => {
    try {
      const [invitations, joinRequests] = await Promise.all([
        invitationsApi.getPending(),
        invitationsApi.getJoinRequests(),
      ])
      pendingInvitationsCount.value = invitations.length + joinRequests.length
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
