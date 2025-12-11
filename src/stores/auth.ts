import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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
  async function login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      token.value = data.access_token
      user.value = data.user

      // Persist to localStorage
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function signup(signupData: { email: string; password: string; name: string; location?: string; interests?: string[] }) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      const data = await response.json()
      
      token.value = data.access_token
      user.value = data.user

      // Persist to localStorage
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  async function updateUser(updates: Partial<User>) {
    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      const data = await response.json()
      
      if (user.value) {
        user.value = { ...user.value, ...data }
        localStorage.setItem('user', JSON.stringify(user.value))
      }

      return data
    } catch (error) {
      console.error('Update error:', error)
      throw error
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
