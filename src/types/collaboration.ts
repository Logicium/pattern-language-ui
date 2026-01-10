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
  assignedTo?: number[]
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
