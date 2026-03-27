/**
 * Collaboration Types for Pattern Language Platform
 * Part II: Multi-user playbook collaboration features
 */

export interface PlaybookMember {
  id: number
  playbook: number
  user: {
    id: number
    name: string
    profileImage?: string
  }
  role: 'creator' | 'collaborator'
  joinedAt: string
  updatedAt: string
}

export interface PlaybookInvitation {
  id: number
  playbook: {
    id: number
    patternTitle: string
  }
  invitedBy: {
    id: number
    name: string
  }
  invitedUser: {
    id: number
    name: string
  }
  status: 'pending' | 'accepted' | 'rejected'
  message?: string
  createdAt: string
  updatedAt: string
}

export interface TaskComment {
  id: number
  playbook: number
  taskId: string
  author: {
    id: number
    name: string
    profileImage?: string
  }
  content: string
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  completedDate: string | null
  dueDate?: string | null
  assignedTo?: number[]
  phase?: number // 1 = Planning, 2 = Development, 3 = Testing & Launch
  subtasks?: Subtask[]
}

export interface SearchedUser {
  id: number
  name: string
  bio?: string
  profileImage?: string
  location?: string
  state?: string
  currentWork?: string
  goals?: string
  interests?: string[]
  createdAt: string
}

export interface DiscussionMessage {
  id: number
  playbook: number
  author: {
    id: number
    name: string
    profileImage?: string
  }
  content: string
  type: 'message' | 'pal_query' | 'pal_response' | 'file'
  fileUrl?: string
  fileName?: string
  mentions?: number[]
  createdAt: string
  updatedAt: string
}

export interface PlaybookActivity {
  id: number
  playbook: number
  user: {
    id: number
    name: string
    profileImage?: string
  }
  action: 'task_created' | 'task_completed' | 'task_comment' | 'member_joined' | 'member_invited' | 'playbook_published' | 'playbook_completed' | 'playbook_paused' | 'playbook_resumed' | 'note_updated' | 'kpi_updated' | 'discussion_message'
  details?: string
  targetTitle?: string
  createdAt: string
}
