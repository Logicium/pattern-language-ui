import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isTokenExpired } from '@/utils/jwt'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Survives logout on purpose — see enterDemoSession().
const DEMO_SESSION_KEY = 'pl_demo_citizen'

export interface User {
  id: string
  email: string
  name: string
  location?: string
  state?: string
  interests?: string[]
  /** Demo citizen of the fictional Cottonwood Springs sandbox. */
  isDemo?: boolean
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
  const isDemoUser = computed(() => user.value?.isDemo === true)

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
    interests?: string[];
    inviteToken?: string;
    guestData?: import('@/stores/guestChat').GuestSignupData;
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
    inviteToken?: string
    guestData?: import('@/stores/guestChat').GuestSignupData
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

  /**
   * Adopt a session issued by POST /demo/citizen — a real (flagged) account
   * scoped to Cottonwood Springs. From here on the normal authed flows apply.
   *
   * The session is also remembered under its own key, which `logout()`
   * deliberately leaves alone: a visitor who signs out and comes back through
   * the city should land in the citizen they already built playbooks as, not
   * a brand-new stranger.
   */
  function enterDemoSession(data: { access_token: string; user: User }) {
    // A previous session's cached data must not bleed into this citizen.
    localStorage.removeItem('chatSessions')
    localStorage.removeItem('playbooks')
    localStorage.removeItem('notifications')
    token.value = data.access_token
    user.value = data.user
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(data))
    } catch {
      /* private mode: the citizen simply won't survive a sign-out */
    }
  }

  /**
   * A previously issued demo citizen, if one is still usable. Expired tokens
   * are dropped so the caller falls back to minting a fresh citizen.
   */
  function storedDemoSession(): { access_token: string; user: User } | null {
    try {
      const raw = localStorage.getItem(DEMO_SESSION_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { access_token?: string; user?: User }
      if (!parsed?.access_token || !parsed.user || isTokenExpired(parsed.access_token)) {
        localStorage.removeItem(DEMO_SESSION_KEY)
        return null
      }
      return { access_token: parsed.access_token, user: parsed.user }
    } catch {
      return null
    }
  }

  function forgetDemoSession() {
    try {
      localStorage.removeItem(DEMO_SESSION_KEY)
    } catch {
      /* ignore */
    }
  }

  /**
   * Flip the current demo-citizen profile into a real account (keeps all
   * playbooks/chats/memberships — same user row on the server).
   */
  async function claimDemo(claim: { email: string; name: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/claim-demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify(claim),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Could not claim this profile')
    }

    const data = await response.json()
    token.value = data.access_token
    user.value = { ...data.user, isDemo: false }
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(user.value))
    // The citizen is now a real account; never resurrect the demo shortcut.
    forgetDemoSession()
    return data
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
    isDemoUser,
    login,
    signup,
    googleLogin,
    googleSignup,
    logout,
    enterDemoSession,
    storedDemoSession,
    forgetDemoSession,
    claimDemo,
    updateUser,
    checkTokenValidity
  }
})
