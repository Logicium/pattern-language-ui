<template>
  <div class="login-page">
    <Navbar />
    
    <!-- Hero -->
    <section class="login-hero gradient-bg">
      <div class="container">
        <h1 class="hero-title">Welcome Back</h1>
        <p class="hero-subtitle text-secondary">
          Sign in to continue your community<br>
          revitalization journey.
        </p>
      </div>
    </section>

    <!-- Form Section -->
    <section class="section form-section">
      <div class="container">
        <div class="form-layout">
          <!-- Form -->
          <div class="form-container">
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label class="form-label text-xs text-tertiary">Email</label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  class="form-input"
                  required
                  autocomplete="email"
                />
              </div>

              <div class="form-group">
                <label class="form-label text-xs text-tertiary">Password</label>
                <input
                  v-model="password"
                  type="password"
                  placeholder="Enter your password"
                  class="form-input"
                  required
                  autocomplete="current-password"
                />
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-lg submit-btn"
                  :disabled="loading"
                >
                  {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>
                <p class="text-xs text-tertiary auth-link">
                  Don't have an account? 
                  <router-link to="/signup" class="link">Sign up</router-link>
                </p>
              </div>
            </form>
          </div>

          <!-- Sidebar -->
          <div class="sidebar">
            <div class="info-card">
              <h3>Designing Thriving Rural Communities</h3>
              <p class="text-sm text-secondary info-description">
                45 patterns for community-led regeneration, powered by proven 
                strategies and AI-guided implementation.
              </p>
              
              <div class="features-list">
                <div class="feature-item">
                  <h4 class="text-sm">AI Chat Guidance</h4>
                  <p class="text-xs text-tertiary">Get personalized support for your patterns</p>
                </div>
                <div class="feature-item">
                  <h4 class="text-sm">Step-by-Step Playbooks</h4>
                  <p class="text-xs text-tertiary">Track implementation with clear milestones</p>
                </div>
                <div class="feature-item">
                  <h4 class="text-sm">Share Your Stories</h4>
                  <p class="text-xs text-tertiary">Inspire others with your success</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />

    <!-- Error Modal -->
    <ErrorModal
      v-model="showErrorModal"
      :title="errorTitle"
      :message="errorMessage"
      show-secondary-action
      secondary-action-text="Go to Signup"
      @secondary-action="handleGoToSignup"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Navbar, Footer, ErrorModal } from '@/components'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showErrorModal = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  
  try {
    await authStore.login(email.value, password.value)
    
    // Wait a bit for state to update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Redirect to dashboard
    await router.push('/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    
    errorTitle.value = 'Login Failed'
    errorMessage.value = 'Invalid email or password. Please check your credentials and try again, or sign up for a new account.'
    showErrorModal.value = true
  } finally {
    loading.value = false
  }
}

const handleGoToSignup = () => {
  router.push('/signup')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
}

.login-hero {
  padding: 12rem var(--container-padding) 6rem;
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.8;
}

.form-section {
  background: var(--color-bg-secondary);
}

.form-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

.form-container {
  background: var(--color-bg-primary);
  padding: 4rem;
}

.login-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  transition: all var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent-1);
  background: var(--color-bg-primary);
}

.form-actions {
  margin-top: 3rem;
  text-align: center;
}

.submit-btn {
  width: 100%;
  margin-bottom: 1.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-link {
  line-height: 1.6;
}

.auth-link .link {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s;
}

.auth-link .link:hover {
  text-decoration-color: currentColor;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.info-card h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.info-description {
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
}

.feature-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.feature-item h4 {
  font-weight: 500;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.feature-item p {
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .form-container {
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .login-hero {
    padding: 10rem var(--container-padding) 4rem;
  }

  .form-container {
    padding: 2rem;
  }

  .info-card {
    padding: 2rem;
  }
}
</style>
