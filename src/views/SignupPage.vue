<template>
  <div class="signup-page">
    <Navbar />
    
    <!-- Hero -->
    <section class="signup-hero gradient-bg">
      <div class="container">
        <h1 class="hero-title">Create Your Profile</h1>
        <p class="hero-subtitle text-secondary">
          Tell us about your community and we'll suggest<br>
          patterns to help you build a thriving future.
        </p>
      </div>
    </section>

    <!-- Form Section -->
    <section class="section form-section">
      <div class="container">
        <div class="form-layout">
          <!-- Form -->
          <div class="form-container">
            <!-- Step Indicator -->
            <div class="step-indicator">
              <div 
                class="step" 
                :class="{ active: currentStep === 1, completed: currentStep > 1 }"
              >
                <div class="step-number">1</div>
                <div class="step-label">Account</div>
              </div>
              <div class="step-divider"></div>
              <div 
                class="step" 
                :class="{ active: currentStep === 2, completed: currentStep > 2 }"
              >
                <div class="step-number">2</div>
                <div class="step-label">Community</div>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" class="signup-form">
              <!-- Step 1: Account Info -->
              <div v-show="currentStep === 1" class="form-step">
                <h2 class="step-title">Create Your Account</h2>
                
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label text-xs text-tertiary">First Name</label>
                    <input
                      v-model="formData.firstName"
                      type="text"
                      placeholder="John"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-xs text-tertiary">Last Name</label>
                    <input
                      v-model="formData.lastName"
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
                    v-model="formData.email"
                    type="email"
                    placeholder="you@example.com"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label text-xs text-tertiary">Password</label>
                  <input
                    v-model="formData.password"
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
                    @click="nextStep"
                  >
                    Next
                  </button>
                  <p class="text-xs text-tertiary auth-link">
                    Already have an account? 
                    <router-link to="/login" class="link">Sign in</router-link>
                  </p>
                </div>
              </div>

              <!-- Step 2: Community Info -->
              <div v-show="currentStep === 2" class="form-step">
                <h2 class="step-title">Tell Us About Your Community</h2>
                
                <div class="form-group">
                  <label class="form-label text-xs text-tertiary">Community Name</label>
                  <input
                    v-model="formData.communityName"
                    type="text"
                    placeholder="e.g., Trinidad, Colorado"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label text-xs text-tertiary">Population</label>
                    <input
                      v-model="formData.population"
                      type="text"
                      placeholder="e.g., 8,000"
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label text-xs text-tertiary">Region</label>
                    <select v-model="formData.region" class="form-input" required>
                      <option value="">Select region</option>
                      <option value="northeast">Northeast</option>
                      <option value="southeast">Southeast</option>
                      <option value="midwest">Midwest</option>
                      <option value="southwest">Southwest</option>
                      <option value="west">West</option>
                      <option value="northwest">Northwest</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label text-xs text-tertiary">Your Role</label>
                  <select v-model="formData.role" class="form-input" required>
                    <option value="">Select your role</option>
                    <option value="civic-leader">Civic Leader / Elected Official</option>
                    <option value="nonprofit">Nonprofit / Community Organizer</option>
                    <option value="entrepreneur">Entrepreneur / Business Owner</option>
                    <option value="educator">Educator</option>
                    <option value="resident">Engaged Resident</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label text-xs text-tertiary">
                    What challenges is your community facing? (Select all that apply)
                  </label>
                  <div class="checkbox-grid">
                    <label
                      v-for="challenge in challenges"
                      :key="challenge"
                      class="checkbox-label text-sm"
                    >
                      <input
                        v-model="formData.selectedChallenges"
                        type="checkbox"
                        :value="challenge"
                        class="checkbox-input"
                      />
                      <span>{{ challenge }}</span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label text-xs text-tertiary">
                    What are you currently working on?
                  </label>
                  <textarea
                    v-model="formData.currentWork"
                    placeholder="Tell us about initiatives, projects, or ideas you're exploring..."
                    class="form-textarea"
                    rows="4"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label text-xs text-tertiary">
                    What would success look like in 12 months?
                  </label>
                  <textarea
                    v-model="formData.goals"
                    placeholder="Describe your vision for your community's future..."
                    class="form-textarea"
                    rows="4"
                  ></textarea>
                </div>

                <div class="form-actions">
                  <div class="button-group">
                    <button 
                      type="button" 
                      class="btn btn-lg btn-secondary"
                      @click="prevStep"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-lg submit-btn"
                      :disabled="isSubmitting"
                    >
                      {{ isSubmitting ? 'Creating...' : 'Get Started' }}
                    </button>
                  </div>
                  <p class="text-xs text-tertiary privacy-note">
                    By creating a profile, you agree to share your community's story 
                    with the Pattern Language network. We'll never sell your data.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <!-- Sidebar -->
          <div class="sidebar">
            <div class="info-card">
              <h3>What Happens Next?</h3>
              <ol class="steps-list">
                <li class="text-sm text-secondary">
                  <span class="step-number text-xs">1</span>
                  We'll analyze your community's context and challenges
                </li>
                <li class="text-sm text-secondary">
                  <span class="step-number text-xs">2</span>
                  Our AI suggests relevant patterns tailored to your needs
                </li>
                <li class="text-sm text-secondary">
                  <span class="step-number text-xs">3</span>
                  You explore playbooks and connect with similar communities
                </li>
                <li class="text-sm text-secondary">
                  <span class="step-number text-xs">4</span>
                  Start building with a 90-day sprint and track progress
                </li>
              </ol>
            </div>

            <div class="testimonial-card">
              <p class="testimonial-text text-sm">
                "PatternLanguage.ai helped us see connections we'd missed and gave 
                us a clear starting point. Within 3 months we had our first win."
              </p>
              <div class="testimonial-author">
                <span class="text-xs text-tertiary">— Community Leader</span>
                <span class="text-xs text-tertiary">Rural Nebraska</span>
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
      :show-secondary-action="isEmailConflict"
      secondary-action-text="Go to Login"
      @secondary-action="handleGoToLogin"
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

interface FormData {
  firstName: string
  lastName: string
  communityName: string
  population: string
  region: string
  role: string
  email: string
  password: string
  selectedChallenges: string[]
  currentWork: string
  goals: string
}

const currentStep = ref(1)
const isSubmitting = ref(false)
const showErrorModal = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const isEmailConflict = ref(false)

const formData = ref<FormData>({
  firstName: '',
  lastName: '',
  communityName: '',
  population: '',
  region: '',
  role: '',
  email: '',
  password: '',
  selectedChallenges: [],
  currentWork: '',
  goals: ''
})

const challenges = [
  'Youth Flight & Talent Drain',
  'Aging Population',
  'Economic Stagnation',
  'Infrastructure Decay',
  'Food Insecurity',
  'Low Civic Trust',
  'Isolation & Disconnection',
  'Skills Gap',
  'Environmental Degradation',
  'Civic Apathy'
]

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Create user with auth store
    await authStore.signup({
      email: formData.value.email,
      password: formData.value.password,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      name: `${formData.value.firstName} ${formData.value.lastName}`,
      location: formData.value.communityName,
      interests: formData.value.selectedChallenges
    })
    
    // Wait a bit for state to update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Redirect to dashboard
    await router.push('/dashboard')
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Check if it's an email conflict error (409 status)
    if (error.message?.includes('409') || error.message?.includes('already exists')) {
      isEmailConflict.value = true
      errorTitle.value = 'Email Already in Use'
      errorMessage.value = `An account with the email "${formData.value.email}" already exists. Would you like to log in instead?`
    } else {
      isEmailConflict.value = false
      errorTitle.value = 'Signup Error'
      errorMessage.value = 'There was an error creating your account. Please try again or contact support if the problem persists.'
    }
    
    showErrorModal.value = true
  } finally {
    isSubmitting.value = false
  }
}

const handleGoToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
}

.signup-hero {
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
<style scoped>
.signup-page {
  min-height: 100vh;
}

.signup-hero {
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

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 2px solid var(--color-text-tertiary);
  border-radius: 50%;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: var(--color-accent-1);
  color: var(--color-accent-1);
  background: rgba(232, 180, 160, 0.1);
}

.step.completed .step-number {
  border-color: var(--color-accent-2);
  background: var(--color-accent-2);
  color: var(--color-bg-primary);
}

.step-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
}

.step.active .step-label {
  color: var(--color-text-primary);
}

.step-divider {
  width: 80px;
  height: 2px;
  background: var(--color-text-tertiary);
  opacity: 0.2;
}

/* Form Steps */
.form-step {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 2.5rem;
  color: var(--color-text-primary);
}

.signup-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 2rem;
}

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

.form-input,
.form-textarea {
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

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent-1);
  background: var(--color-bg-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid transparent;
  transition: all var(--transition-base);
}

.checkbox-label:hover {
  background: var(--color-bg-secondary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent-1);
}

.form-actions {
  margin-top: 3rem;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.button-group .btn {
  flex: 1;
}

.submit-btn {
  width: 100%;
  margin-bottom: 1.5rem;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-text-tertiary);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  border-color: var(--color-text-primary);
  box-shadow: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.privacy-note {
  line-height: 1.6;
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

.info-card,
.testimonial-card {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.info-card h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

.steps-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.steps-list li {
  display: flex;
  gap: 1rem;
  line-height: 1.7;
}

.steps-list .step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-accent-1);
  color: var(--color-bg-primary);
  border-radius: 50%;
  flex-shrink: 0;
  letter-spacing: 0;
  border: none;
}

.testimonial-card {
  border-left: 3px solid var(--color-accent-2);
}

.testimonial-text {
  line-height: 1.8;
  font-style: italic;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .form-container {
    padding: 3rem;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .signup-hero {
    padding: 10rem var(--container-padding) 4rem;
  }

  .form-container {
    padding: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .info-card,
  .testimonial-card {
    padding: 2rem;
  }

  .button-group {
    flex-direction: column;
  }

  .step-indicator {
    gap: 1rem;
  }

  .step-divider {
    width: 40px;
  }
}
</style>
