import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name: string
  location?: string
  interests?: string[]
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // Actions
  function login(email: string, password: string) {
    // Mock authentication - generate a fake token
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0] || 'User',
      location: 'Rural America',
      interests: [],
      createdAt: new Date().toISOString()
    }

    token.value = mockToken
    user.value = mockUser

    // Persist to localStorage
    localStorage.setItem('auth_token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))

    return { token: mockToken, user: mockUser }
  }

  function signup(signupData: { email: string; name: string; location?: string; interests?: string[] }) {
    // Mock signup - generate a fake token
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email: signupData.email,
      name: signupData.name,
      location: signupData.location,
      interests: signupData.interests || [],
      createdAt: new Date().toISOString()
    }

    token.value = mockToken
    user.value = mockUser

    // Persist to localStorage
    localStorage.setItem('auth_token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))

    return { token: mockToken, user: mockUser }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  function updateUser(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    currentUser,
    login,
    signup,
    logout,
    updateUser
  }
})
