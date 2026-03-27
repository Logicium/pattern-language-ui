import { ref, onMounted } from 'vue'
import { invitationsApi } from '@/services/api'
import type { PlaybookInvitation } from '@/types/collaboration'

export function useInvitationsPage() {
  const invitations = ref<PlaybookInvitation[]>([])
  const loading = ref(true)
  const processing = ref<number | null>(null)
  const showToast = ref(false)
  const toastMessage = ref('')

  const showToastMessage = (message: string) => {
    toastMessage.value = message
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  }

  const loadInvitations = async () => {
    loading.value = true
    try {
      invitations.value = await invitationsApi.getPending()
    } catch (error) {
      console.error('Failed to load invitations:', error)
      invitations.value = []
    } finally {
      loading.value = false
    }
  }

  const acceptInvitation = async (invitationId: number) => {
    processing.value = invitationId
    try {
      await invitationsApi.accept(invitationId)
      invitations.value = invitations.value.filter(inv => inv.id !== invitationId)
      showToastMessage('Invitation accepted! You can now access the playbook.')
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      showToastMessage('Failed to accept invitation')
    } finally {
      processing.value = null
    }
  }

  const rejectInvitation = async (invitationId: number) => {
    if (!confirm('Are you sure you want to decline this invitation?')) return

    processing.value = invitationId
    try {
      await invitationsApi.reject(invitationId)
      invitations.value = invitations.value.filter(inv => inv.id !== invitationId)
      showToastMessage('Invitation declined')
    } catch (error) {
      console.error('Failed to reject invitation:', error)
      showToastMessage('Failed to decline invitation')
    } finally {
      processing.value = null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  onMounted(() => { loadInvitations() })

  return {
    invitations, loading, processing,
    showToast, toastMessage,
    acceptInvitation, rejectInvitation, formatDate
  }
}
