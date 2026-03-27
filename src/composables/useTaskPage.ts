import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { playbooksApi } from '@/services/api'
import type { Task, PlaybookMember, TaskComment } from '@/types/collaboration'

export function useTaskPage(
  props: {
    modelValue: boolean
    playbook: any
    task: Task | null
    members: PlaybookMember[]
    userRole?: 'creator' | 'collaborator' | null
  },
  emit: (event: string, ...args: any[]) => void
) {
  const authStore = useAuthStore()
  const loading = ref(false)

  // Task editing
  const isEditingTask = ref(false)
  const editableTask = ref({ title: '', description: '', dueDate: '' })

  // Delete confirmation
  const showDeleteConfirm = ref(false)

  // Toast
  const showToast = ref(false)
  const toastMessage = ref('')

  // Assignee editing
  const isEditingAssignees = ref(false)
  const showAssignMemberModal = ref(false)
  const memberSearchQuery = ref('')

  // Subtask editing
  const isEditingSubtasks = ref(false)
  const editingSubtaskId = ref<string | null>(null)
  const editingSubtaskTitle = ref('')
  const showAddSubtask = ref(false)
  const newSubtaskTitle = ref('')
  const subtaskInput = ref<HTMLInputElement | null>(null)

  // Comments
  const comments = ref<TaskComment[]>([])
  const newCommentContent = ref('')
  const editingCommentId = ref<number | null>(null)
  const editCommentContent = ref('')

  // Permissions
  const canManage = computed(() => {
    return props.userRole === 'creator' || props.userRole === 'collaborator'
  })

  const canComment = computed(() => {
    return props.userRole === 'creator' || props.userRole === 'collaborator'
  })

  const canEditComment = (comment: TaskComment) => {
    return String(comment.author.id) === String(authStore.user?.id) || props.userRole === 'creator'
  }

  // Computed: Filter assigned members
  const assignedMembers = computed(() => {
    if (!props.task?.assignedTo) return []
    return props.members.filter(m => props.task?.assignedTo?.includes(m.user.id))
  })

  const filteredUnassignedMembers = computed(() => {
    const assignedIds = props.task?.assignedTo || []
    const unassigned = props.members.filter(m => !assignedIds.includes(m.user.id))
    if (!memberSearchQuery.value.trim()) return unassigned
    return unassigned.filter(m =>
      m.user.name.toLowerCase().includes(memberSearchQuery.value.toLowerCase())
    )
  })

  // Task completion
  const toggleTaskCompletion = async () => {
    if (!props.playbook || !props.task || loading.value) return
    loading.value = true
    try {
      await playbooksApi.toggleTask(props.playbook.id, props.task.id)
      emit('refresh')
    } catch (error) {
      console.error('Failed to toggle task:', error)
      alert('Failed to update task')
    } finally {
      loading.value = false
    }
  }

  // Delete task
  const deleteTask = async () => {
    if (!props.playbook || !props.task || loading.value) return
    loading.value = true
    try {
      await playbooksApi.deleteTask(props.playbook.id, props.task.id)
      toastMessage.value = 'Task deleted successfully'
      showToast.value = true
      emit('refresh')
      emit('update:modelValue', false)
    } catch (error) {
      console.error('Failed to delete task:', error)
      toastMessage.value = 'Failed to delete task'
      showToast.value = true
    } finally {
      loading.value = false
      showDeleteConfirm.value = false
    }
  }

  // Task editing
  const startEditingTask = () => {
    if (!props.task) return
    isEditingTask.value = true
    editableTask.value = {
      title: props.task.title,
      description: props.task.description || '',
      dueDate: props.task.dueDate || ''
    }
  }

  const cancelEditingTask = () => {
    isEditingTask.value = false
    editableTask.value = { title: '', description: '', dueDate: '' }
  }

  const saveTaskEdit = async () => {
    if (!props.playbook || !props.task || !editableTask.value.title.trim() || loading.value) return
    loading.value = true
    try {
      await playbooksApi.updateTask(props.playbook.id, props.task.id, {
        title: editableTask.value.title,
        description: editableTask.value.description,
        dueDate: editableTask.value.dueDate
      })
      emit('refresh')
      isEditingTask.value = false
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task')
    } finally {
      loading.value = false
    }
  }

  // Assignee management
  const toggleAssigneeEditMode = () => {
    isEditingAssignees.value = !isEditingAssignees.value
  }

  const assignMember = async (userId: number) => {
    if (!props.playbook || !props.task || loading.value) return
    loading.value = true
    try {
      const updatedAssignedTo = [...(props.task.assignedTo || []), userId]
      await playbooksApi.updateTask(props.playbook.id, props.task.id, { assignedTo: updatedAssignedTo })
      emit('refresh')
      showAssignMemberModal.value = false
      memberSearchQuery.value = ''
    } catch (error) {
      console.error('Failed to assign member:', error)
      alert('Failed to assign member')
    } finally {
      loading.value = false
    }
  }

  const unassignMember = async (userId: number) => {
    if (!props.playbook || !props.task || loading.value) return
    loading.value = true
    try {
      const updatedAssignedTo = (props.task.assignedTo || []).filter(id => id !== userId)
      await playbooksApi.updateTask(props.playbook.id, props.task.id, { assignedTo: updatedAssignedTo })
      emit('refresh')
    } catch (error) {
      console.error('Failed to unassign member:', error)
      alert('Failed to unassign member')
    } finally {
      loading.value = false
    }
  }

  // Subtask management
  const addSubtask = async () => {
    if (!props.playbook || !props.task || !newSubtaskTitle.value.trim() || loading.value) return
    loading.value = true
    try {
      await playbooksApi.addSubtask(props.playbook.id, props.task.id, newSubtaskTitle.value.trim())
      newSubtaskTitle.value = ''
      showAddSubtask.value = false
      await nextTick()
      emit('refresh')
    } catch (error) {
      console.error('Failed to add subtask:', error)
      alert('Failed to add subtask')
    } finally {
      loading.value = false
    }
  }

  const cancelAddSubtask = () => {
    newSubtaskTitle.value = ''
    showAddSubtask.value = false
  }

  const toggleSubtaskCompletion = async (subtaskId: string) => {
    if (!props.playbook || !props.task || loading.value) return
    loading.value = true
    try {
      await playbooksApi.toggleSubtask(props.playbook.id, props.task.id, subtaskId)
      emit('refresh')
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
      alert('Failed to update subtask')
    } finally {
      loading.value = false
    }
  }

  const deleteSubtask = async (subtaskId: string) => {
    if (!props.playbook || !props.task || loading.value) return
    loading.value = true
    try {
      await playbooksApi.deleteSubtask(props.playbook.id, props.task.id, subtaskId)
      emit('refresh')
    } catch (error) {
      console.error('Failed to delete subtask:', error)
      alert('Failed to delete subtask')
    } finally {
      loading.value = false
    }
  }

  const toggleSubtaskEditMode = () => {
    isEditingSubtasks.value = !isEditingSubtasks.value
    if (!isEditingSubtasks.value) cancelSubtaskEdit()
  }

  const startEditingSubtask = (subtaskId: string, title: string) => {
    editingSubtaskId.value = subtaskId
    editingSubtaskTitle.value = title
  }

  const cancelSubtaskEdit = () => {
    editingSubtaskId.value = null
    editingSubtaskTitle.value = ''
  }

  const saveSubtaskEdit = async (subtaskId: string) => {
    if (!props.playbook || !props.task || !editingSubtaskTitle.value.trim() || loading.value) return
    loading.value = true
    try {
      await playbooksApi.updateSubtask(props.playbook.id, props.task.id, subtaskId, { title: editingSubtaskTitle.value.trim() })
      emit('refresh')
      cancelSubtaskEdit()
    } catch (error) {
      console.error('Failed to update subtask:', error)
      alert('Failed to update subtask')
    } finally {
      loading.value = false
    }
  }

  // Comments
  const loadComments = async () => {
    if (!props.playbook || !props.task) return
    try {
      comments.value = await playbooksApi.getComments(props.playbook.id, props.task.id)
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const addComment = async () => {
    if (!props.playbook || !props.task || !newCommentContent.value.trim() || loading.value) return
    loading.value = true
    try {
      await playbooksApi.addComment(props.playbook.id, props.task.id, newCommentContent.value.trim())
      newCommentContent.value = ''
      await loadComments()
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment')
    } finally {
      loading.value = false
    }
  }

  const startEditComment = (comment: TaskComment) => {
    editingCommentId.value = comment.id
    editCommentContent.value = comment.content
  }

  const cancelEditComment = () => {
    editingCommentId.value = null
    editCommentContent.value = ''
  }

  const saveEditComment = async (commentId: number) => {
    if (!props.playbook || !props.task || !editCommentContent.value.trim() || loading.value) return
    loading.value = true
    try {
      await playbooksApi.updateComment(props.playbook.id, props.task.id, commentId, editCommentContent.value.trim())
      editingCommentId.value = null
      editCommentContent.value = ''
      await loadComments()
    } catch (error) {
      console.error('Failed to update comment:', error)
      alert('Failed to update comment')
    } finally {
      loading.value = false
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!props.playbook || !props.task || loading.value) return
    if (!confirm('Delete this comment?')) return
    loading.value = true
    try {
      await playbooksApi.deleteComment(props.playbook.id, props.task.id, commentId)
      await loadComments()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment')
    } finally {
      loading.value = false
    }
  }

  // Watchers
  watch(() => props.task, (newTask) => {
    if (newTask && props.modelValue) loadComments()
  }, { immediate: true })

  watch(showAddSubtask, async (show) => {
    if (show) {
      await nextTick()
      subtaskInput.value?.focus()
    }
  })

  return {
    loading,
    isEditingTask,
    editableTask,
    showDeleteConfirm,
    showToast,
    toastMessage,
    isEditingAssignees,
    showAssignMemberModal,
    memberSearchQuery,
    isEditingSubtasks,
    editingSubtaskId,
    editingSubtaskTitle,
    showAddSubtask,
    newSubtaskTitle,
    subtaskInput,
    comments,
    newCommentContent,
    editingCommentId,
    editCommentContent,
    canManage,
    canComment,
    canEditComment,
    assignedMembers,
    filteredUnassignedMembers,
    toggleTaskCompletion,
    deleteTask,
    startEditingTask,
    cancelEditingTask,
    saveTaskEdit,
    toggleAssigneeEditMode,
    assignMember,
    unassignMember,
    addSubtask,
    cancelAddSubtask,
    toggleSubtaskCompletion,
    deleteSubtask,
    toggleSubtaskEditMode,
    startEditingSubtask,
    cancelSubtaskEdit,
    saveSubtaskEdit,
    loadComments,
    addComment,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    deleteComment,
  }
}
