<template>
  <div class="form-step">
    <h2 class="step-title">Create Your Account</h2>

    <!-- Google Signup Button -->
    <button
      type="button"
      class="google-btn"
      @click="handleGoogleSignup"
      :disabled="isLoadingGoogle"
    >
      <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {{ isLoadingGoogle ? 'Connecting...' : 'Sign up with Google' }}
    </button>

    <div class="divider">
      <span class="divider-line"></span>
      <span class="divider-text text-xs text-tertiary">or</span>
      <span class="divider-line"></span>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label text-xs text-tertiary">First Name</label>
        <input
          :value="formData.firstName"
          @input="$emit('update:formData', { ...formData, firstName: ($event.target as HTMLInputElement).value })"
          type="text"
          placeholder="John"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label text-xs text-tertiary">Last Name</label>
        <input
          :value="formData.lastName"
          @input="$emit('update:formData', { ...formData, lastName: ($event.target as HTMLInputElement).value })"
          type="text"
          placeholder="Smith"
          class="form-input"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Email</label>
      <input
        :value="formData.email"
        @input="$emit('update:formData', { ...formData, email: ($event.target as HTMLInputElement).value })"
        type="email"
        placeholder="you@example.com"
        class="form-input"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Password</label>
      <input
        :value="formData.password"
        @input="$emit('update:formData', { ...formData, password: ($event.target as HTMLInputElement).value })"
        type="password"
        placeholder="Create a password"
        class="form-input"
        required
        minlength="6"
      />
    </div>

    <div class="form-actions">
      <button 
        type="button" 
        class="btn btn-lg submit-btn"
        @click="$emit('nextStep')"
      >
        Next
      </button>
      <p class="text-xs text-tertiary auth-link">
        Already have an account? 
        <router-link to="/login" class="link">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SignupFormData } from '@/composables/useSignupForm'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const props = defineProps<{
  formData: SignupFormData
  isGoogleSignup: boolean
}>()

const emit = defineEmits<{
  'update:formData': [value: SignupFormData]
  nextStep: []
  googleSignup: [credential: string]
}>()

const isLoadingGoogle = ref(false)
const googleLoaded = ref(false)

onMounted(() => {
  // Load Google Identity Services SDK
  if (!(window as any).google?.accounts) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => { googleLoaded.value = true }
    document.head.appendChild(script)
  } else {
    googleLoaded.value = true
  }
})

function handleGoogleSignup() {
  isLoadingGoogle.value = true
  const google = (window as any).google

  if (!google?.accounts) {
    isLoadingGoogle.value = false
    return
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: any) => {
      if (response.credential) {
        emit('googleSignup', response.credential)
      }
      isLoadingGoogle.value = false
    },
  })

  google.accounts.id.prompt((notification: any) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Fallback: render a Google button if prompt doesn't show
      const btnContainer = document.createElement('div')
      btnContainer.id = 'g_id_signin_fallback'
      btnContainer.style.display = 'none'
      document.body.appendChild(btnContainer)
      google.accounts.id.renderButton(btnContainer, {
        type: 'standard',
        size: 'large',
      })
      // Click the rendered button
      const gBtn = btnContainer.querySelector('div[role="button"]') as HTMLElement
      if (gBtn) gBtn.click()
      else isLoadingGoogle.value = false
    }
  })
}
</script>

<style scoped>
.form-step {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 2.5rem;
  color: var(--color-text-primary);
}

.google-btn {
  width: 100%;
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

.google-icon {
  flex-shrink: 0;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 2rem 0;
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

.form-group { margin-bottom: 2rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.submit-btn {
  width: 100%;
  margin-bottom: 1.5rem;
}

.auth-link {
  line-height: 1.6;
  text-align: center;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
