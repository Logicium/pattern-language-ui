import { ref, computed, watch } from 'vue'
import { usePlaybooksStore } from '@/stores/playbooks'
import type { PlaybookSection } from '@/stores/playbooks'
import { playbooksApi } from '@/services/api'

const DEFAULT_SECTIONS: PlaybookSection[] = [
  { id: 'section_1', title: 'Planning' },
  { id: 'section_2', title: 'Development' },
  { id: 'section_3', title: 'Testing & Launch' },
]

const PHASE_TO_SECTION: Record<number, string> = {
  1: 'section_1',
  2: 'section_2',
  3: 'section_3',
}

export function usePlaybookTasks(playbook: any, showToast: any, toastMessage: any) {
  const playbooksStore = usePlaybooksStore()

  const isAddingTask = ref(false)
  const editingTaskId = ref<string | null>(null)
  const newTask = ref({ title: '', description: '', dueDate: '', sectionId: '' })
  const editingTask = ref({ title: '', description: '', dueDate: '', sectionId: '' })
  const showDeleteTaskModal = ref(false)
  const taskToDelete = ref<string | null>(null)
  const expandedTaskNotes = ref<Record<string, boolean>>({})
  const taskNotes = ref<Record<string, string>>({})
  const isAddingSection = ref(false)
  const newSectionTitle = ref('')
  const editingSectionId = ref<string | null>(null)
  const editingSectionTitle = ref('')

  // Get resolved sections — migrate old phase-based playbooks to sections
  const sections = computed<PlaybookSection[]>(() => {
    if (!playbook.value) return []
    if (playbook.value.sections && playbook.value.sections.length > 0) {
      return playbook.value.sections
    }
    // Backward compat: generate sections from hardcoded phases
    return [...DEFAULT_SECTIONS]
  })

  // Get tasks for a specific section
  const getTasksForSection = (sectionId: string) => {
    if (!playbook.value) return []
    return playbook.value.tasks.filter((task: any) => {
      if (task.sectionId) return task.sectionId === sectionId
      // Backward compat: map phase to sectionId
      if (task.phase && PHASE_TO_SECTION[task.phase]) {
        return PHASE_TO_SECTION[task.phase] === sectionId
      }
      return false
    })
  }

  // Get ungrouped tasks (no section or phase)
  const ungroupedTasks = computed(() => {
    if (!playbook.value) return []
    const sectionIds = new Set(sections.value.map(s => s.id))
    return playbook.value.tasks.filter((task: any) => {
      if (task.sectionId) return !sectionIds.has(task.sectionId)
      if (task.phase && PHASE_TO_SECTION[task.phase]) return false
      return true
    })
  })

  // Persist sections and tasks to the store/backend
  const persistSectionsAndTasks = (updatedSections: PlaybookSection[], updatedTasks?: any[]) => {
    if (!playbook.value) return
    const updates: any = { sections: updatedSections }
    if (updatedTasks !== undefined) {
      updates.tasks = updatedTasks
    }
    playbooksStore.updatePlaybook(playbook.value.id, updates)
  }

  // Ensure tasks have sectionId (migrate from phase)
  const migrateTasksToSections = () => {
    if (!playbook.value) return
    let needsMigration = false
    const migrated = playbook.value.tasks.map((task: any) => {
      if (!task.sectionId && task.phase && PHASE_TO_SECTION[task.phase]) {
        needsMigration = true
        return { ...task, sectionId: PHASE_TO_SECTION[task.phase] }
      }
      return task
    })
    if (needsMigration || !playbook.value.sections || playbook.value.sections.length === 0) {
      persistSectionsAndTasks(sections.value, migrated)
    }
  }

  // --- Section CRUD ---

  const startAddingSection = () => {
    isAddingSection.value = true
    newSectionTitle.value = ''
  }

  const cancelAddingSection = () => {
    isAddingSection.value = false
    newSectionTitle.value = ''
  }

  const saveNewSection = () => {
    if (!newSectionTitle.value.trim()) return
    const newSection: PlaybookSection = {
      id: `section_${Date.now()}`,
      title: newSectionTitle.value.trim(),
    }
    const updatedSections = [...sections.value, newSection]
    persistSectionsAndTasks(updatedSections)
    cancelAddingSection()
    toastMessage.value = 'Section added'
    showToast.value = true
  }

  const startEditingSection = (sectionId: string) => {
    const section = sections.value.find(s => s.id === sectionId)
    if (!section) return
    editingSectionId.value = sectionId
    editingSectionTitle.value = section.title
  }

  const cancelSectionEdit = () => {
    editingSectionId.value = null
    editingSectionTitle.value = ''
  }

  const saveSectionEdit = () => {
    if (!editingSectionId.value || !editingSectionTitle.value.trim()) return
    const updatedSections = sections.value.map(s =>
      s.id === editingSectionId.value
        ? { ...s, title: editingSectionTitle.value.trim() }
        : s
    )
    persistSectionsAndTasks(updatedSections)
    cancelSectionEdit()
    toastMessage.value = 'Section renamed'
    showToast.value = true
  }

  const deleteSection = (sectionId: string) => {
    if (!playbook.value) return
    const updatedSections = sections.value.filter(s => s.id !== sectionId)
    // Move tasks from deleted section to ungrouped (clear sectionId)
    const updatedTasks = playbook.value.tasks.map((task: any) =>
      task.sectionId === sectionId ? { ...task, sectionId: undefined } : task
    )
    persistSectionsAndTasks(updatedSections, updatedTasks)
    toastMessage.value = 'Section deleted'
    showToast.value = true
  }

  // --- Section reordering ---

  const onSectionsReorder = (reorderedSections: PlaybookSection[]) => {
    persistSectionsAndTasks(reorderedSections)
  }

  // --- Task reordering / moving between sections ---

  const onTasksReorder = (sectionId: string, reorderedTasks: any[]) => {
    if (!playbook.value) return
    // Build a new full tasks array maintaining order
    const otherTasks = playbook.value.tasks.filter((t: any) => {
      if (!sectionId) {
        // Ungrouped: keep tasks that DO have a section assignment
        return !!(t.sectionId || (t.phase && PHASE_TO_SECTION[t.phase]))
      }
      const taskSection = t.sectionId || (t.phase && PHASE_TO_SECTION[t.phase])
      return taskSection !== sectionId
    })
    // Ensure all reordered tasks have the correct sectionId
    const updatedSectionTasks = reorderedTasks.map((t: any) => ({
      ...t,
      sectionId: sectionId || undefined,
    }))
    const allTasks = [...otherTasks, ...updatedSectionTasks]
    playbooksStore.updatePlaybook(playbook.value.id, { tasks: allTasks, sections: sections.value })
  }

  // --- Task CRUD ---

  const startAddingTask = (sectionId?: string) => {
    isAddingTask.value = true
    newTask.value = {
      title: '',
      description: '',
      dueDate: '',
      sectionId: sectionId || (sections.value.length > 0 ? sections.value[0]!.id : ''),
    }
  }

  const cancelAddingTask = () => {
    isAddingTask.value = false
    newTask.value = { title: '', description: '', dueDate: '', sectionId: '' }
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
      sectionId: newTask.value.sectionId,
    }
    const updatedTasks = [...playbook.value.tasks, task]
    playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks, sections: sections.value })
    cancelAddingTask()
  }

  const startEditingTask = (task: any) => {
    editingTaskId.value = task.id
    editingTask.value = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate || '',
      sectionId: task.sectionId || (task.phase && PHASE_TO_SECTION[task.phase]) || '',
    }
  }

  const cancelTaskEdit = () => {
    editingTaskId.value = null
    editingTask.value = { title: '', description: '', dueDate: '', sectionId: '' }
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
            sectionId: editingTask.value.sectionId,
          }
        : task
    )
    playbooksStore.updatePlaybook(playbook.value.id, { tasks: updatedTasks, sections: sections.value })
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
      // Auto-migrate old phase-based playbooks
      migrateTasksToSections()
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
    sections,
    ungroupedTasks,
    getTasksForSection,
    isAddingSection,
    newSectionTitle,
    editingSectionId,
    editingSectionTitle,
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
    startAddingSection,
    cancelAddingSection,
    saveNewSection,
    startEditingSection,
    cancelSectionEdit,
    saveSectionEdit,
    deleteSection,
    onSectionsReorder,
    onTasksReorder,
  }
}
