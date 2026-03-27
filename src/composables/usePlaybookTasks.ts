import { ref, computed, watch } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'
import { playbooksApi } from '@/services/api'

export function usePlaybookTasks(playbook: any, showToast: any, toastMessage: any) {
  const playbooksStore = usePlaybooksStore()

  const isAddingTask = ref(false)
  const editingTaskId = ref<string | null>(null)
  const newTask = ref({ title: '', description: '', dueDate: '', phase: 1 })
  const editingTask = ref({ title: '', description: '', dueDate: '', phase: 1 })
  const showDeleteTaskModal = ref(false)
  const taskToDelete = ref<string | null>(null)
  const expandedTaskNotes = ref<Record<string, boolean>>({})
  const taskNotes = ref<Record<string, string>>({})

  const tasksByPhase = computed(() => {
    if (!playbook.value) return { planning: [], development: [], testing: [], ungrouped: [] }
    const grouped = {
      planning: [] as any[],
      development: [] as any[],
      testing: [] as any[],
      ungrouped: [] as any[]
    }
    playbook.value.tasks.forEach((task: any) => {
      if (task.phase === 1) grouped.planning.push(task)
      else if (task.phase === 2) grouped.development.push(task)
      else if (task.phase === 3) grouped.testing.push(task)
      else grouped.ungrouped.push(task)
    })
    return grouped
  })

  const startAddingTask = () => {
    isAddingTask.value = true
    newTask.value = { title: '', description: '', dueDate: '', phase: 1 }
  }

  const cancelAddingTask = () => {
    isAddingTask.value = false
    newTask.value = { title: '', description: '', dueDate: '', phase: 1 }
  }

  const saveNewTask = () => {
    if (!playbook.value || !newTask.value.title.trim()) return
    const task = {
      id: `task_${Date.now()}`,
      title: newTask.value.title.trim(),
      description: newTask.value.description.trim(),
      completed: false,
      dueDate: newTask.value.dueDate || null,
      completedDate: null,
      phase: newTask.value.phase
    }
    const updatedTasks = [...playbook.value.tasks, task]
    playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks })
    cancelAddingTask()
  }

  const startEditingTask = (task: any) => {
    editingTaskId.value = task.id
    editingTask.value = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || '',
      phase: task.phase || 1
    }
  }

  const cancelTaskEdit = () => {
    editingTaskId.value = null
    editingTask.value = { title: '', description: '', dueDate: '', phase: 1 }
  }

  const saveTaskEdit = () => {
    if (!playbook.value || !editingTaskId.value || !editingTask.value.title.trim()) return
    const updatedTasks = playbook.value.tasks.map((task: any) =>
      task.id === editingTaskId.value
        ? {
            ...task,
            title: editingTask.value.title.trim(),
            description: editingTask.value.description.trim(),
            dueDate: editingTask.value.dueDate || null,
            phase: editingTask.value.phase
          }
        : task
    )
    playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks })
    toastMessage.value = 'Task saved successfully'
    showToast.value = true
    cancelTaskEdit()
  }

  const confirmDeleteTask = (taskId: string) => {
    taskToDelete.value = taskId
    showDeleteTaskModal.value = true
  }

  const handleDeleteTask = async (refreshPlaybook: () => Promise<void>) => {
    if (!playbook.value || !taskToDelete.value) return
    try {
      await playbooksApi.deleteTask(playbook.value.id, taskToDelete.value)
      const storageKey = `task-notes-${playbook.value.id}-${taskToDelete.value}`
      localStorage.removeItem(storageKey)
      delete taskNotes.value[taskToDelete.value]
      delete expandedTaskNotes.value[taskToDelete.value]
      await refreshPlaybook()
      showDeleteTaskModal.value = false
      taskToDelete.value = null
      toastMessage.value = 'Task deleted successfully'
      showToast.value = true
      cancelTaskEdit()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toastMessage.value = 'Failed to delete task'
      showToast.value = true
    }
  }

  const toggleTask = (taskId: string) => {
    if (playbook.value) {
      playbooksStore.toggleTaskCompletion(playbook.value.id, taskId)
    }
  }

  const toggleTaskNotes = (taskId: string) => {
    expandedTaskNotes.value[taskId] = !expandedTaskNotes.value[taskId]
  }

  const saveTaskNotes = (taskId: string) => {
    if (playbook.value) {
      const storageKey = `task-notes-${playbook.value.id}-${taskId}`
      localStorage.setItem(storageKey, taskNotes.value[taskId] || '')
    }
  }

  // Load task notes from localStorage
  watch(() => playbook.value, (newPlaybook) => {
    if (newPlaybook) {
      newPlaybook.tasks.forEach((task: any) => {
        const storageKey = `task-notes-${newPlaybook.id}-${task.id}`
        const savedNotes = localStorage.getItem(storageKey)
        if (savedNotes) {
          taskNotes.value[task.id] = savedNotes
        }
      })
    }
  }, { immediate: true })

  return {
    isAddingTask,
    editingTaskId,
    newTask,
    editingTask,
    showDeleteTaskModal,
    taskToDelete,
    expandedTaskNotes,
    taskNotes,
    tasksByPhase,
    startAddingTask,
    cancelAddingTask,
    saveNewTask,
    startEditingTask,
    cancelTaskEdit,
    saveTaskEdit,
    confirmDeleteTask,
    handleDeleteTask,
    toggleTask,
    toggleTaskNotes,
    saveTaskNotes,
  }
}
