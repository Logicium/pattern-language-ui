<template>
  <div class="login-page">
    <Navbar />
    
    <section class="login-hero gradient-bg">
      <div class="container">
        <h1 class="hero-title">Welcome Back</h1>
        <p class="hero-subtitle text-secondary">
          Sign in to continue your community<br>
          revitalization journey.
        </p>
      </div>
    </section>

    <section class="section form-section">
      <div class="container">
        <div class="form-layout">
          <div class="form-container">
            <!-- Google Login Button -->
            <button
              type="button"
              class="google-btn"
              @click="handleGoogleLogin"
              :disabled="isLoadingGoogle"
            >
              <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {{ isLoadingGoogle ? 'Connecting...' : 'Sign in with Google' }}
            </button>

            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text text-xs text-tertiary">or</span>
              <span class="divider-line"></span>
            </div>

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

          <LoginSidebar />
        </div>
      </div>
    </section>

    <Footer />

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
import { Navbar, Footer, ErrorModal } from '@/components'
import LoginSidebar from '@/components/login/LoginSidebar.vue'
import { useLoginPage } from '@/composables/useLoginPage'

const {
  email, password, loading, isLoadingGoogle,
  showErrorModal, errorTitle, errorMessage,
  handleLogin, handleGoogleLogin, handleGoToSignup
} = useLoginPage()
</script>

<style scoped>
.login-page { min-height: 100vh; }

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

.hero-subtitle { font-size: 1.125rem; line-height: 1.8; }
.form-section { background: var(--color-bg-secondary); }

.form-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

.form-container {
  background: var(--color-bg-primary);
  padding: 4rem;
}

.google-btn {
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.15);
  cursor: pointer;
  transition: all var(--transition-base);
  letter-spacing: 0.01em;
}

.google-btn:hover {
  border-color: rgba(42, 42, 42, 0.3);
  background: var(--color-bg-secondary);
}

.google-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-icon { flex-shrink: 0; }

.divider {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 2rem 0;
  max-width: 600px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(42, 42, 42, 0.08);
}

.divider-text {
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.login-form { max-width: 600px; }
.form-group { margin-bottom: 2rem; }

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
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.submit-btn { width: 100%; margin-bottom: 1.5rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-link { line-height: 1.6; text-align: center; }

.auth-link .link {
  color: var(--color-text-primary);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s;
}

.auth-link .link:hover { text-decoration-color: currentColor; }

@media (max-width: 1024px) {
  .form-layout { grid-template-columns: 1fr; gap: 3rem; }
  .form-container { padding: 3rem; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .login-hero { padding: 10rem var(--container-padding) 4rem; }
  .form-container { padding: 2rem; }
}
</style>
