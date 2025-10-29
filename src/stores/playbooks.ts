import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pattern } from '@/types'

export interface PlaybookTask {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string | null
  completedDate: string | null
}

export interface Playbook {
  id: string
  patternId: number
  patternTitle: string
  challenge: string
  solution: string
  location: string
  status: 'active' | 'completed' | 'paused'
  progress: number // 0-100
  startDate: string
  targetCompletionDate: string
  completedDate: string | null
  tasks: PlaybookTask[]
  resources: Array<{ type: 'pattern' | 'story' | 'challenge' | 'link'; id: number; title: string; url?: string }>
  notes: string
}

export const usePlaybooksStore = defineStore('playbooks', () => {
  // State
  const playbooks = ref<Playbook[]>(
    localStorage.getItem('playbooks')
      ? JSON.parse(localStorage.getItem('playbooks')!)
      : [
          // Mock playbook data
          {
            id: 'playbook_1',
            patternId: 1,
            patternTitle: 'Community Anchor Point',
            challenge: 'Youth Flight',
            solution: 'Create a physical hub where everything connects',
            location: 'Trinidad, CO',
            status: 'active',
            progress: 65,
            startDate: '2025-09-15',
            targetCompletionDate: '2025-12-15',
            completedDate: null,
            tasks: [
              {
                id: 'task_1_1',
                title: 'Identify potential building locations',
                description: 'Survey underused buildings (library, firehouse, church) that could serve as anchor point',
                completed: true,
                dueDate: '2025-09-30',
                completedDate: '2025-09-28'
              },
              {
                id: 'task_1_2',
                title: 'Form steering committee',
                description: 'Recruit 5-7 trusted community champions across sectors',
                completed: true,
                dueDate: '2025-10-05',
                completedDate: '2025-10-03'
              },
              {
                id: 'task_1_3',
                title: 'Host community visioning session',
                description: 'Gather input on what programs and services the anchor should offer',
                completed: true,
                dueDate: '2025-10-15',
                completedDate: '2025-10-12'
              },
              {
                id: 'task_1_4',
                title: 'Secure building lease/agreement',
                description: 'Negotiate terms with building owner and draft shared-use agreement',
                completed: false,
                dueDate: '2025-10-30',
                completedDate: null
              },
              {
                id: 'task_1_5',
                title: 'Design welcoming signage',
                description: 'Create clear exterior signage, posted hours, wayfinding',
                completed: false,
                dueDate: '2025-11-10',
                completedDate: null
              },
              {
                id: 'task_1_6',
                title: 'Launch pilot programming',
                description: 'Run first month of drop-in coffee hours and resource fair',
                completed: false,
                dueDate: '2025-11-25',
                completedDate: null
              },
              {
                id: 'task_1_7',
                title: 'Establish feedback loop',
                description: 'Set up simple system for gathering and responding to community input',
                completed: false,
                dueDate: '2025-12-10',
                completedDate: null
              }
            ],
            resources: [
              { type: 'pattern', id: 7, title: 'Village Broadcast Loop' },
              { type: 'pattern', id: 5, title: 'Local Pride Rituals' },
              { type: 'story', id: 1, title: 'From Ghost Town to Creative Hub' }
            ],
            notes: 'Working with the old library building downtown. Strong interest from youth programs and local businesses.'
          },
          {
            id: 'playbook_2',
            patternId: 12,
            patternTitle: 'Micro-Credential Academy',
            challenge: 'Economic Stagnation',
            solution: 'Fast, practical learning for real jobs and rural needs',
            location: 'Rural Nebraska',
            status: 'active',
            progress: 35,
            startDate: '2025-10-01',
            targetCompletionDate: '2026-01-15',
            completedDate: null,
            tasks: [
              {
                id: 'task_2_1',
                title: 'Survey local employers',
                description: 'Identify top 5 in-demand skills for the region',
                completed: true,
                dueDate: '2025-10-15',
                completedDate: '2025-10-14'
              },
              {
                id: 'task_2_2',
                title: 'Partner with community college',
                description: 'Establish partnership with regional CC for course delivery',
                completed: true,
                dueDate: '2025-10-25',
                completedDate: '2025-10-22'
              },
              {
                id: 'task_2_3',
                title: 'Design welding micro-credential',
                description: 'Create 6-week welding course with industry certification',
                completed: false,
                dueDate: '2025-11-10',
                completedDate: null
              },
              {
                id: 'task_2_4',
                title: 'Recruit first cohort',
                description: 'Enroll 12-15 learners for pilot welding program',
                completed: false,
                dueDate: '2025-11-30',
                completedDate: null
              },
              {
                id: 'task_2_5',
                title: 'Launch pilot course',
                description: 'Run first 6-week welding micro-credential',
                completed: false,
                dueDate: '2026-01-15',
                completedDate: null
              }
            ],
            resources: [
              { type: 'pattern', id: 10, title: 'Village Learning Hub' },
              { type: 'pattern', id: 13, title: 'Work-and-Learn Tracks' }
            ],
            notes: 'Manufacturing partners very interested. Need to secure equipment and space.'
          },
          {
            id: 'playbook_3',
            patternId: 4,
            patternTitle: 'Social Timebank',
            challenge: 'Isolation',
            solution: 'Build reciprocity through time-based exchange',
            location: 'Northern Maine',
            status: 'completed',
            progress: 100,
            startDate: '2025-06-01',
            targetCompletionDate: '2025-09-01',
            completedDate: '2025-08-28',
            tasks: [
              {
                id: 'task_3_1',
                title: 'Recruit timebank coordinator',
                description: 'Find trusted host to log exchanges and mediate',
                completed: true,
                dueDate: '2025-06-15',
                completedDate: '2025-06-12'
              },
              {
                id: 'task_3_2',
                title: 'Set up tracking system',
                description: 'Create simple paper/whiteboard system for exchange logs',
                completed: true,
                dueDate: '2025-06-30',
                completedDate: '2025-06-25'
              },
              {
                id: 'task_3_3',
                title: 'Host launch event',
                description: 'Community potluck to explain timebank and sign up members',
                completed: true,
                dueDate: '2025-07-15',
                completedDate: '2025-07-14'
              },
              {
                id: 'task_3_4',
                title: 'Facilitate first exchanges',
                description: 'Support 10-15 successful time exchanges in first month',
                completed: true,
                dueDate: '2025-08-15',
                completedDate: '2025-08-10'
              },
              {
                id: 'task_3_5',
                title: 'Document and share stories',
                description: 'Collect testimonials and share success stories',
                completed: true,
                dueDate: '2025-08-30',
                completedDate: '2025-08-28'
              }
            ],
            resources: [
              { type: 'pattern', id: 3, title: 'Trust Infrastructure' },
              { type: 'pattern', id: 7, title: 'Village Broadcast Loop' },
              { type: 'story', id: 5, title: 'Timebank Rebuilds Trust' }
            ],
            notes: 'Successfully launched with 42 members! Elder tech coaching and yard work most popular exchanges.'
          }
        ]
  )

  // Getters
  const activePlaybooks = computed(() =>
    playbooks.value.filter((p) => p.status === 'active')
  )

  const completedPlaybooks = computed(() =>
    playbooks.value.filter((p) => p.status === 'completed')
  )

  const pausedPlaybooks = computed(() =>
    playbooks.value.filter((p) => p.status === 'paused')
  )

  // Actions
  function addPlaybook(playbook: Playbook) {
    playbooks.value.push(playbook)
    saveToLocalStorage()
  }

  function updatePlaybook(id: string, updates: Partial<Playbook>) {
    const playbook = playbooks.value.find((p) => p.id === id)
    if (!playbook) return
    
    Object.assign(playbook, updates)
    
    // Recalculate progress based on completed tasks
    const completedTasks = playbook.tasks.filter(t => t.completed).length
    playbook.progress = Math.round((completedTasks / playbook.tasks.length) * 100)
    
    // Auto-complete playbook if all tasks done
    if (playbook.progress === 100 && playbook.status === 'active') {
      playbook.status = 'completed'
      const today = new Date().toISOString().split('T')[0]
      if (today) playbook.completedDate = today
    }
    
    saveToLocalStorage()
  }

  function deletePlaybook(id: string) {
    playbooks.value = playbooks.value.filter((p) => p.id !== id)
    saveToLocalStorage()
  }

  function toggleTaskCompletion(playbookId: string, taskId: string) {
    const playbook = playbooks.value.find((p) => p.id === playbookId)
    if (playbook) {
      const task = playbook.tasks.find((t) => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        const today = new Date().toISOString().split('T')[0]
        if (today) task.completedDate = task.completed ? today : null
        
        // Recalculate progress
        const completedTasks = playbook.tasks.filter(t => t.completed).length
        playbook.progress = Math.round((completedTasks / playbook.tasks.length) * 100)
        
        // Auto-complete playbook if all tasks done
        if (playbook.progress === 100 && playbook.status === 'active') {
          playbook.status = 'completed'
          if (today) playbook.completedDate = today
        }
        
        saveToLocalStorage()
      }
    }
  }

  function addResourceToPlaybook(playbookId: string, resource: { type: 'pattern' | 'story' | 'challenge' | 'link'; id: number; title: string; url?: string }) {
    const playbook = playbooks.value.find((p) => p.id === playbookId)
    if (playbook) {
      // Check if resource already exists
      const exists = playbook.resources.some(r => r.type === resource.type && r.id === resource.id)
      if (!exists) {
        playbook.resources.push(resource)
        saveToLocalStorage()
      }
    }
  }

  function updatePlaybookNotes(playbookId: string, notes: string) {
    const playbook = playbooks.value.find((p) => p.id === playbookId)
    if (playbook) {
      playbook.notes = notes
      saveToLocalStorage()
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem('playbooks', JSON.stringify(playbooks.value))
  }

  return {
    playbooks,
    activePlaybooks,
    completedPlaybooks,
    pausedPlaybooks,
    addPlaybook,
    updatePlaybook,
    deletePlaybook,
    toggleTaskCompletion,
    addResourceToPlaybook,
    updatePlaybookNotes
  }
})
