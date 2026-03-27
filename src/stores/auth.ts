import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isTokenExpired } from '@/utils/jwt'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface User {
  id: string
  email: string
  name: string
  location?: string
  state?: string
  interests?: string[]
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )

  // Check if token is expired on initialization and clear if needed
  if (token.value && isTokenExpired(token.value)) {
    console.log('Token expired on initialization, clearing auth state')
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  // Getters
  const isAuthenticated = computed(() => {
    if (!token.value) return false
    if (isTokenExpired(token.value)) {
      // Schedule cleanup outside the computed to avoid reactive loops
      queueMicrotask(() => logout())
      return false
    }
    return true
  })
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
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Login failed'
        throw new Error(`${response.status}: ${errorMessage}`)
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

  async function signup(signupData: { 
    email: string; 
    password: string; 
    firstName?: string;
    lastName?: string;
    name: string; 
    location?: string;
    state?: string;
    currentWork?: string;
    goals?: string;
    interests?: string[] 
  }) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Signup failed'
        throw new Error(`${response.status}: ${errorMessage}`)
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

  async function googleLogin(googleToken: string) {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Google authentication failed'
        throw new Error(`${response.status}: ${errorMessage}`)
      }

      const data = await response.json()

      token.value = data.access_token
      user.value = data.user

      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  async function googleSignup(signupData: {
    token: string
    name: string
    email: string
    location?: string
    state?: string
    currentWork?: string
    goals?: string
    interests?: string[]
  }) {
    try {
      const response = await fetch(`${API_URL}/auth/google-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || 'Google signup failed'
        throw new Error(`${response.status}: ${errorMessage}`)
      }

      const data = await response.json()

      token.value = data.access_token
      user.value = data.user

      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error) {
      console.error('Google signup error:', error)
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  // Check if the current token is valid (not expired)
  function checkTokenValidity(): boolean {
    if (!token.value) return false
    if (isTokenExpired(token.value)) {
      logout()
      return false
    }
    return true
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
    googleLogin,
    googleSignup,
    logout,
    updateUser,
    checkTokenValidity
  }
})
