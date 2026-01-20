const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

// Helper function to make authenticated requests
async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

// Patterns API
export const patternsApi = {
  getAll: () => authFetch('/patterns'),
  getById: (id: number) => authFetch(`/patterns/${id}`),
  search: (query: string) => authFetch(`/patterns/search?q=${encodeURIComponent(query)}`),
  create: (data: any) => authFetch('/patterns', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => authFetch(`/patterns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => authFetch(`/patterns/${id}`, { method: 'DELETE' }),
}

// Stories API
export const storiesApi = {
  getAll: () => authFetch('/stories'),
  getById: (id: number) => authFetch(`/stories/${id}`),
  search: (query: string) => authFetch(`/stories/search?q=${encodeURIComponent(query)}`),
  create: (data: any) => authFetch('/stories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => authFetch(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => authFetch(`/stories/${id}`, { method: 'DELETE' }),
}

// Challenges API
export const challengesApi = {
  getAll: () => authFetch('/challenges'),
  getById: (id: number) => authFetch(`/challenges/${id}`),
  search: (query: string) => authFetch(`/challenges/search?q=${encodeURIComponent(query)}`),
  create: (data: any) => authFetch('/challenges', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => authFetch(`/challenges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => authFetch(`/challenges/${id}`, { method: 'DELETE' }),
}

// Resources API
export const resourcesApi = {
  getAll: () => authFetch('/resources'),
  getById: (id: number) => authFetch(`/resources/${id}`),
  search: (query: string) => authFetch(`/resources/search?q=${encodeURIComponent(query)}`),
  create: (data: any) => authFetch('/resources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => authFetch(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => authFetch(`/resources/${id}`, { method: 'DELETE' }),
}

// Chat API
export const chatApi = {
  getAll: () => authFetch('/chat'),
  getById: (id: number) => authFetch(`/chat/${id}`),
  create: (data: { title?: string }) => authFetch('/chat', { method: 'POST', body: JSON.stringify(data) }),
  updateTitle: (id: number, title: string) => authFetch(`/chat/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  delete: (id: number) => authFetch(`/chat/${id}`, { method: 'DELETE' }),
  sendMessage: (chatId: number, message: string) => 
    authFetch('/chat/message', { 
      method: 'POST', 
      body: JSON.stringify({ chatId, message }) 
    }),
}

// Playbooks API
export const playbooksApi = {
  getAll: () => authFetch('/playbooks'),
  getById: (id: number) => authFetch(`/playbooks/${id}`),
  create: (data: any) => 
    authFetch('/playbooks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => authFetch(`/playbooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => authFetch(`/playbooks/${id}`, { method: 'DELETE' }),
  
  // Create from AI-generated playbook data
  createFromGenerated: (playbookData: any) =>
    authFetch('/playbooks', { method: 'POST', body: JSON.stringify(playbookData) }),
  
  // Toggle task completion
  toggleTask: (playbookId: number, taskId: string) => 
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/toggle`, { method: 'PATCH' }),
  
  // Update task
  updateTask: (playbookId: number, taskId: string, data: { title?: string; description?: string; dueDate?: string; assignedTo?: number[] }) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}`, { 
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Delete task
  deleteTask: (playbookId: number, taskId: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}`, { method: 'DELETE' }),

  // ========== PART II: COLLABORATION ENDPOINTS ==========
  
  // Publishing
  publish: (id: number) => 
    authFetch(`/playbooks/${id}/publish`, { method: 'PATCH' }),
  unpublish: (id: number) => 
    authFetch(`/playbooks/${id}/unpublish`, { method: 'PATCH' }),
  getLocalPublished: () => 
    authFetch('/playbooks/local/published'),
  
  // Members
  getMembers: (id: number) => 
    authFetch(`/playbooks/${id}/members`),
  removeMember: (id: number, userId: number) => 
    authFetch(`/playbooks/${id}/members/${userId}`, { method: 'DELETE' }),
  
  // Invitations
  invite: (id: number, userId: number, message?: string) => 
    authFetch(`/playbooks/${id}/invite`, { 
      method: 'POST', 
      body: JSON.stringify({ userId, message }) 
    }),
  
  // Task assignments
  assignTask: (playbookId: number, taskId: string, userIds: number[]) => 
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/assign`, { 
      method: 'PATCH', 
      body: JSON.stringify({ userIds }) 
    }),
  
  // Subtasks
  addSubtask: (playbookId: number, taskId: string, title: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/subtasks`, { 
      method: 'POST', 
      body: JSON.stringify({ title }) 
    }),
  toggleSubtask: (playbookId: number, taskId: string, subtaskId: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/subtasks/${subtaskId}`, { 
      method: 'PATCH' 
    }),
  updateSubtask: (playbookId: number, taskId: string, subtaskId: string, data: { title: string }) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  deleteSubtask: (playbookId: number, taskId: string, subtaskId: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/subtasks/${subtaskId}`, { 
      method: 'DELETE' 
    }),
  
  // Comments
  getComments: (playbookId: number, taskId: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/comments`),
  addComment: (playbookId: number, taskId: string, content: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/comments`, { 
      method: 'POST', 
      body: JSON.stringify({ content }) 
    }),
  updateComment: (playbookId: number, taskId: string, commentId: number, content: string) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/comments/${commentId}`, { 
      method: 'PUT', 
      body: JSON.stringify({ content }) 
    }),
  deleteComment: (playbookId: number, taskId: string, commentId: number) =>
    authFetch(`/playbooks/${playbookId}/tasks/${taskId}/comments/${commentId}`, { 
      method: 'DELETE' 
    }),
}

// User Stories API
export const userStoriesApi = {
  getAll: () => authFetch('/user-stories'),
  getById: (id: number) => authFetch(`/user-stories/${id}`),
  create: (data: { title: string; problem: string; solution: string; story?: string; patterns?: string[]; location?: string; color?: string; image?: string; references?: string[]; published?: boolean; playbookId?: number }) => 
    authFetch('/user-stories', { method: 'POST', body: JSON.stringify(data) }),
  generateFromPlaybook: (playbookId: number) =>
    authFetch('/user-stories/generate', { method: 'POST', body: JSON.stringify({ playbookId }) }),
  update: (id: number, data: any) => authFetch(`/user-stories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => authFetch(`/user-stories/${id}`, { method: 'DELETE' }),
}

// Settings API
export const settingsApi = {
  get: () => authFetch('/settings'),
  update: (data: any) => authFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
}

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string; filename: string; size: number; mimetype: string }> => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('file', file)
    
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || 'Failed to upload image')
    }
    
    return response.json()
  },
}

// Users API
export const usersApi = {
  getProfile: (id: number) => authFetch(`/users/${id}`),
  getMyProfile: () => authFetch('/users/me/profile'),
  updateMyProfile: (data: any) => authFetch('/users/me/profile', { method: 'PUT', body: JSON.stringify(data) }),
  
  // Search users
  search: (params?: { location?: string; state?: string; challenges?: string[] }) => {
    const searchParams = new URLSearchParams()
    if (params?.location) searchParams.append('location', params.location)
    if (params?.state) searchParams.append('state', params.state)
    if (params?.challenges) searchParams.append('challenges', params.challenges.join(','))
    
    const queryString = searchParams.toString()
    return authFetch(`/users/search${queryString ? `?${queryString}` : ''}`)
  },
}

// Invitations API
export const invitationsApi = {
  getPending: () => authFetch('/invitations/pending'),
  accept: (id: number) => authFetch(`/invitations/${id}/accept`, { method: 'POST' }),
  reject: (id: number) => authFetch(`/invitations/${id}/reject`, { method: 'POST' }),
}

