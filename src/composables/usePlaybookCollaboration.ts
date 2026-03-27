import { ref, computed, watch } from 'vue'
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

  const showInviteMemberModal = ref(false)
  const searchQuery = ref('')
  const allAvailableUsers = ref<SearchedUser[]>([])
  const invitedUserIds = ref<number[]>([])

  const filteredAvailableUsers = computed(() => {
    if (!searchQuery.value.trim()) return allAvailableUsers.value
    return allAvailableUsers.value.filter((u: SearchedUser) =>
      u.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const loadAvailableUsers = async () => {
    try {
      const users = await usersApi.search()
      const memberIds = members.value.map((m: PlaybookMember) => m.user.id)
      allAvailableUsers.value = users.filter((u: SearchedUser) => !memberIds.includes(u.id))
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  watch(showInviteMemberModal, async (isOpen) => {
    if (isOpen && allAvailableUsers.value.length === 0) {
      await loadAvailableUsers()
    }
    if (!isOpen) {
      searchQuery.value = ''
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
      const creator = members.value.find((m: PlaybookMember) => m.role === 'creator')
      if (creator) {
        const userId = parseInt(authStore.user.id, 10)
        await playbooksApi.invite(playbook.value.id, userId, 'Request to join this playbook')
        toastMessage.value = 'Join request sent to playbook creator'
        showToast.value = true
      } else {
        toastMessage.value = 'Unable to send request - creator not found'
        showToast.value = true
      }
    } catch (error) {
      console.error('Failed to request join:', error)
      toastMessage.value = 'Failed to send request'
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
    } catch (error) {
      console.error('Failed to remove member:', error)
      toastMessage.value = 'Failed to remove member'
      showToast.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    showInviteMemberModal,
    searchQuery,
    allAvailableUsers,
    invitedUserIds,
    filteredAvailableUsers,
    searchUsers,
    inviteUser,
    togglePublishState,
    requestToJoin,
    removeMember,
  }
}
