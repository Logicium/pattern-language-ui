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
            <form @submit.prevent="handleSubmit" class="signup-form">
              <!-- Community Info -->
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

              <!-- Your Role -->
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

              <!-- Contact -->
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

              <!-- Password -->
              <div class="form-group">
                <label class="form-label text-xs text-tertiary">Password</label>
                <input
                  v-model="formData.password"
                  type="password"
                  placeholder="Create a password"
                  class="form-input"
                  required
                />
              </div>

              <!-- Current Challenges -->
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

              <!-- What You're Working On -->
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

              <!-- Goals -->
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

              <!-- Submit -->
              <div class="form-actions">
                <button type="submit" class="btn btn-lg submit-btn">
                  Get Started
                </button>
                <p class="text-xs text-tertiary privacy-note">
                  By creating a profile, you agree to share your community's story 
                  with the Pattern Language network. We'll never sell your data.
                </p>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Navbar, Footer } from '@/components'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface FormData {
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

const formData = ref<FormData>({
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

const handleSubmit = () => {
  // Create user with auth store
  authStore.signup({
    email: formData.value.email,
    password: formData.value.password,
    name: formData.value.communityName,
    location: formData.value.communityName,
    interests: formData.value.selectedChallenges
  })
  
  // Redirect to dashboard
  router.push('/dashboard')
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

.submit-btn {
  width: 100%;
  margin-bottom: 1.5rem;
}

.privacy-note {
  line-height: 1.6;
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

.step-number {
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
}
</style>
