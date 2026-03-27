import { ref, watch } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'

export function usePlaybookNotes(playbook: any, showToast: any, toastMessage: any) {
  const playbooksStore = usePlaybooksStore()

  const isEditingNotes = ref(false)
  const editableNotes = ref('')

  const startEditingNotes = () => {
    editableNotes.value = playbook.value?.notes || ''
    isEditingNotes.value = true
  }

  const cancelEditingNotes = () => {
    editableNotes.value = playbook.value?.notes || ''
    isEditingNotes.value = false
  }

  const saveNotes = () => {
    if (playbook.value) {
      playbooksStore.updatePlaybookNotes(playbook.value.id, editableNotes.value)
      isEditingNotes.value = false
      toastMessage.value = 'Notes saved successfully'
      showToast.value = true
    }
  }

  watch(() => playbook.value?.notes, (newNotes) => {
    if (newNotes !== undefined && !isEditingNotes.value) {
      editableNotes.value = newNotes
    }
  }, { immediate: true })

  // Resources editing
  const isEditingResources = ref(false)
  const showDeleteResourceModal = ref(false)
  const resourceToDelete = ref<number | null>(null)

  const startEditingResources = () => {
    isEditingResources.value = true
  }

  const cancelEditingResources = () => {
    isEditingResources.value = false
  }

  const confirmDeleteResource = (resourceId: number) => {
    resourceToDelete.value = resourceId
    showDeleteResourceModal.value = true
  }

  const handleDeleteResource = () => {
    if (!playbook.value || !resourceToDelete.value) return
    const updatedResources = playbook.value.resources.filter(
      (resource: any) => resource.id !== resourceToDelete.value
    )
    playbooksStore.updatePlaybook(playbook.value.id, { resources: updatedResources })
    showDeleteResourceModal.value = false
    resourceToDelete.value = null
    toastMessage.value = 'Resource deleted successfully'
    showToast.value = true
    if (updatedResources.length === 0) {
      isEditingResources.value = false
    }
  }

  return {
    isEditingNotes,
    editableNotes,
    startEditingNotes,
    cancelEditingNotes,
    saveNotes,
    isEditingResources,
    showDeleteResourceModal,
    resourceToDelete,
    startEditingResources,
    cancelEditingResources,
    confirmDeleteResource,
    handleDeleteResource,
  }
}
