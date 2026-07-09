import { ref, onMounted } from 'vue'
import { invitationsApi, playbooksApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { PlaybookInvitation } from '@/types/collaboration'

export function useInvitationsPage() {
  const authStore = useAuthStore()

  const invitations = ref<PlaybookInvitation[]>([])
  const joinRequests = ref<PlaybookInvitation[]>([])
  const sentInvitations = ref<PlaybookInvitation[]>([])
  const myPlaybooks = ref<any[]>([])
  const loading = ref(true)
  const processing = ref<number | null>(null)
  const showToast = ref(false)
  const toastMessage = ref('')

  // Platform invite form
  const inviteEmail = ref('')
  const inviteMessage = ref('')
  const invitePlaybookId = ref<number | null>(null)
  const inviteSending = ref(false)

  const showToastMessage = (message: string) => {
    toastMessage.value = message
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  }

  const loadInvitations = async () => {
    loading.value = true
    try {
      const [pending, requests, sent, playbooks] = await Promise.all([
        invitationsApi.getPending(),
        invitationsApi.getJoinRequests(),
        invitationsApi.getSent(),
        playbooksApi.getAll().catch(() => []),
      ])
      invitations.value = pending
      joinRequests.value = requests
      sentInvitations.value = sent
      // Only playbooks the user owns are offered when inviting to the platform
      const userId = authStore.user ? String(authStore.user.id) : null
      myPlaybooks.value = playbooks.filter(
        (p: any) => typeof p.id === 'number' && (!p.user || String(p.user.id) === userId)
      )
    } catch (error) {
      console.error('Failed to load invitations:', error)
      invitations.value = []
      joinRequests.value = []
      sentInvitations.value = []
    } finally {
      loading.value = false
    }
  }

  const removeFromLists = (invitationId: number) => {
    invitations.value = invitations.value.filter(inv => inv.id !== invitationId)
    joinRequests.value = joinRequests.value.filter(inv => inv.id !== invitationId)
    sentInvitations.value = sentInvitations.value.filter(inv => inv.id !== invitationId)
  }

  const acceptInvitation = async (invitationId: number) => {
    const isJoinRequest = joinRequests.value.some(inv => inv.id === invitationId)
    processing.value = invitationId
    try {
      await invitationsApi.accept(invitationId)
      removeFromLists(invitationId)
      showToastMessage(isJoinRequest
        ? 'Join request approved! They are now a team member.'
        : 'Invitation accepted! You can now access the playbook.')
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      showToastMessage('Failed to accept invitation')
    } finally {
      processing.value = null
    }
  }

  const rejectInvitation = async (invitationId: number) => {
    const isJoinRequest = joinRequests.value.some(inv => inv.id === invitationId)
    if (!confirm(isJoinRequest
      ? 'Decline this join request?'
      : 'Are you sure you want to decline this invitation?')) return

    processing.value = invitationId
    try {
      await invitationsApi.reject(invitationId)
      removeFromLists(invitationId)
      showToastMessage(isJoinRequest ? 'Join request declined' : 'Invitation declined')
    } catch (error) {
      console.error('Failed to reject invitation:', error)
      showToastMessage('Failed to decline invitation')
    } finally {
      processing.value = null
    }
  }

  // Withdraw something you sent (join request or invite)
  const cancelSentInvitation = async (invitationId: number) => {
    if (!confirm('Withdraw this invitation?')) return
    processing.value = invitationId
    try {
      await invitationsApi.reject(invitationId)
      removeFromLists(invitationId)
      showToastMessage('Invitation withdrawn')
    } catch (error) {
      console.error('Failed to withdraw invitation:', error)
      showToastMessage('Failed to withdraw invitation')
    } finally {
      processing.value = null
    }
  }

  const isInviteEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const sendPlatformInvite = async () => {
    const email = inviteEmail.value.trim()
    if (!isInviteEmailValid(email) || inviteSending.value) return
    inviteSending.value = true
    try {
      await invitationsApi.invitePlatform(
        email,
        invitePlaybookId.value ?? undefined,
        inviteMessage.value.trim() || undefined,
      )
      showToastMessage(`Invitation sent to ${email}`)
      inviteEmail.value = ''
      inviteMessage.value = ''
      invitePlaybookId.value = null
      // A playbook invite creates a pending record — refresh the sent list
      sentInvitations.value = await invitationsApi.getSent().catch(() => sentInvitations.value)
    } catch (error: any) {
      console.error('Failed to send platform invitation:', error)
      showToastMessage(error.message || 'Failed to send invitation')
    } finally {
      inviteSending.value = false
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
    invitations, joinRequests, sentInvitations, myPlaybooks,
    loading, processing,
    showToast, toastMessage,
    inviteEmail, inviteMessage, invitePlaybookId, inviteSending, isInviteEmailValid,
    acceptInvitation, rejectInvitation, cancelSentInvitation, sendPlatformInvite,
    formatDate
  }
}
