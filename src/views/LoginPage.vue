<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-content">
        <router-link to="/" class="logo-link">
          <div class="logo">Pattern Language</div>
        </router-link>

        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to continue your community revitalization journey</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              placeholder="you@example.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password"
              v-model="password" 
              type="password" 
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-large" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <p class="signup-prompt">
          Don't have an account? 
          <router-link to="/signup" class="link">Sign up</router-link>
        </p>
      </div>
    </div>

    <div class="login-hero">
      <div class="hero-content">
        <h2>Building thriving rural communities</h2>
        <p>45 patterns for community-led regeneration, powered by proven strategies and AI-guided implementation.</p>
        
        <div class="features">
          <div class="feature">
            <div class="feature-icon">💬</div>
            <div class="feature-text">
              <h3>AI Chat Guidance</h3>
              <p>Get personalized support for your patterns</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">📋</div>
            <div class="feature-text">
              <h3>Step-by-Step Playbooks</h3>
              <p>Track implementation with clear milestones</p>
            </div>
          </div>
          <div class="feature">
            <div class="feature-icon">🌟</div>
            <div class="feature-text">
              <h3>Share Your Stories</h3>
              <p>Inspire others with your success</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock login - any email/password works
    authStore.login(email.value, password.value)
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.login-content {
  width: 100%;
  max-width: 420px;
}

.logo-link {
  display: inline-block;
  margin-bottom: 3rem;
  text-decoration: none;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: opacity 0.2s;
}

.logo-link:hover .logo {
  opacity: 0.7;
}

h1 {
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.subtitle {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  margin-bottom: 3rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input {
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.form-group input::placeholder {
  color: var(--color-text-tertiary);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: var(--color-bg-primary);
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.signup-prompt {
  text-align: center;
  color: var(--color-text-secondary);
}

.link {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s;
}

.link:hover {
  text-decoration-color: currentColor;
}

/* Hero Section */
.login-hero {
  background: linear-gradient(135deg, var(--color-sage) 0%, var(--color-lavender) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  position: relative;
  overflow: hidden;
}

.login-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1), transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  max-width: 540px;
  color: var(--color-text-primary);
}

.hero-content h2 {
  font-size: 3rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-content > p {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.feature-text p {
  font-size: 1rem;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1024px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-hero {
    display: none;
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .hero-content h2 {
    font-size: 2rem;
  }
}
</style>
