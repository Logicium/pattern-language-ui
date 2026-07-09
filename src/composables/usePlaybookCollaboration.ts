import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { playbooksApi, usersApi } from '@/services/api'
import type { PlaybookMember, SearchedUser } from '@/types/collaboration'

export function usePlaybookCollaboration(
  playbook: any,
  members: any,
  loading: any,
  showToast: any,
  toastMessage: any,
  refreshPlaybook: () => Promise<void>
) {
  const authStore = useAuthStore()
  const router = useRouter()

  const showInviteMemberModal = ref(false)
  const searchQuery = ref('')
  const memberScope = ref<'local' | 'all'>('local')
  const allAvailableUsers = ref<SearchedUser[]>([])
  const invitedUserIds = ref<number[]>([])
  const inviteEmailSending = ref(false)

  const filteredAvailableUsers = computed(() => {
    if (!searchQuery.value.trim()) return allAvailableUsers.value
    return allAvailableUsers.value.filter((u: SearchedUser) =>
      u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const loadAvailableUsers = async () => {
    try {
      const users = await usersApi.search({ scope: memberScope.value })
      const memberIds = members.value.map((m: PlaybookMember) => m.user.id)
      allAvailableUsers.value = users.filter((u: SearchedUser) => !memberIds.includes(u.id))
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  watch(showInviteMemberModal, async (isOpen) => {
    if (isOpen) {
      await loadAvailableUsers()
    }
    if (!isOpen) {
      searchQuery.value = ''
    }
  })

  watch(memberScope, () => {
    if (showInviteMemberModal.value) {
      loadAvailableUsers()
    }
  })

  const searchUsers = async () => {
    // Filtering handled by computed property
  }

  const inviteUser = async (user: SearchedUser) => {
    if (!playbook.value || typeof playbook.value.id !== 'number' || loading.value) return
    loading.value = true
    try {
      await playbooksApi.invite(playbook.value.id, user.id)
      invitedUserIds.value.push(user.id)
      toastMessage.value = `Invitation sent to ${user.name}`
      showToast.value = true
    } catch (error: any) {
      console.error('Failed to invite user:', error)
      toastMessage.value = error.message || 'Failed to send invitation'
      showToast.value = true
    } finally {
      loading.value = false
    }
  }

  const inviteByEmail = async (email: string, message?: string): Promise<boolean> => {
    if (!playbook.value || typeof playbook.value.id !== 'number' || inviteEmailSending.value) return false
    inviteEmailSending.value = true
    try {
      await playbooksApi.inviteByEmail(playbook.value.id, email, message)
      toastMessage.value = `Invitation sent to ${email}`
      showToast.value = true
      return true
    } catch (error: any) {
      console.error('Failed to send email invitation:', error)
      toastMessage.value = error.message || 'Failed to send invitation'
      showToast.value = true
      return false
    } finally {
      inviteEmailSending.value = false
    }
  }

  const togglePublishState = async () => {
    if (!playbook.value || typeof playbook.value.id !== 'number' || loading.value) return
    loading.value = true
    try {
      if (playbook.value.isPublic) {
        await playbooksApi.unpublish(playbook.value.id)
        toastMessage.value = 'Playbook unpublished'
      } else {
        await playbooksApi.publish(playbook.value.id)
        toastMessage.value = 'Playbook published to local community'
      }
      showToast.value = true
      await refreshPlaybook()
    } catch (error) {
      console.error('Failed to toggle publish state:', error)
      toastMessage.value = 'Failed to update playbook'
      showToast.value = true
    } finally {
      loading.value = false
    }
  }

  const requestToJoin = async () => {
    if (!playbook.value || typeof playbook.value.id !== 'number' || !authStore.user) return
    loading.value = true
    try {
      await playbooksApi.requestToJoin(playbook.value.id, 'Request to join this playbook')
      toastMessage.value = 'Join request sent to playbook creator'
      showToast.value = true
    } catch (error: any) {
      console.error('Failed to request join:', error)
      toastMessage.value = error.message || 'Failed to send request'
      showToast.value = true
    } finally {
      loading.value = false
    }
  }

  const leavePlaybook = async () => {
    if (!playbook.value || typeof playbook.value.id !== 'number' || loading.value) return
    if (!confirm('Leave this playbook? You will lose access unless you are invited back.')) return
    loading.value = true
    try {
      await playbooksApi.leave(playbook.value.id)
      toastMessage.value = 'You left the playbook'
      showToast.value = true
      setTimeout(() => {
        router.push('/dashboard/playbooks')
      }, 800)
    } catch (error: any) {
      console.error('Failed to leave playbook:', error)
      toastMessage.value = error.message || 'Failed to leave playbook'
      showToast.value = true
    } finally {
      loading.value = false
    }
  }

  const removeMember = async (userId: number) => {
    if (!playbook.value || typeof playbook.value.id !== 'number' || !confirm('Remove this member from the playbook?')) return
    loading.value = true
    try {
      await playbooksApi.removeMember(playbook.value.id, userId)
      toastMessage.value = 'Member removed'
      showToast.value = true
      await refreshPlaybook()
    } catch (error: any) {
      console.error('Failed to remove member:', error)
      toastMessage.value = error.message || 'Failed to remove member'
      showToast.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    showInviteMemberModal,
    searchQuery,
    memberScope,
    allAvailableUsers,
    invitedUserIds,
    inviteEmailSending,
    filteredAvailableUsers,
    searchUsers,
    inviteUser,
    inviteByEmail,
    togglePublishState,
    requestToJoin,
    leavePlaybook,
    removeMember,
  }
}
