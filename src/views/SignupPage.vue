<template>
  <div class="signup-page">
    <Navbar />
    
    <section class="signup-hero gradient-bg">
      <div class="container">
        <h1 class="hero-title">Create Your Profile</h1>
        <p class="hero-subtitle text-secondary">
          Tell us about your community and we'll suggest<br>
          patterns to help you build a thriving future.
        </p>
      </div>
    </section>

    <section class="section form-section">
      <div class="container">
        <div class="form-layout">
          <div class="form-container">
            <!-- Step Indicator -->
            <div class="step-indicator">
              <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
                <div class="step-number">1</div>
                <div class="step-label">Account</div>
              </div>
              <div class="step-divider"></div>
              <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
                <div class="step-number">2</div>
                <div class="step-label">Community</div>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" class="signup-form">
              <SignupStepAccount
                v-show="currentStep === 1"
                :form-data="formData"
                :is-google-signup="isGoogleSignup"
                @update:form-data="formData = $event"
                @next-step="nextStep"
                @google-signup="prefillFromGoogle"
              />
              <SignupStepCommunity
                v-show="currentStep === 2"
                :form-data="formData"
                :is-submitting="isSubmitting"
                :is-google-signup="isGoogleSignup"
                @update:form-data="formData = $event"
                @prev-step="prevStep"
              />
            </form>
          </div>

          <SignupSidebar />
        </div>
      </div>
    </section>

    <Footer />

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
import { Navbar, Footer, ErrorModal } from '@/components'
import SignupStepAccount from '@/components/signup/SignupStepAccount.vue'
import SignupStepCommunity from '@/components/signup/SignupStepCommunity.vue'
import SignupSidebar from '@/components/signup/SignupSidebar.vue'
import { useSignupForm } from '@/composables/useSignupForm'

const {
  currentStep, isSubmitting, showErrorModal, errorTitle, errorMessage,
  isEmailConflict, isGoogleSignup, formData, nextStep, prevStep,
  handleSubmit, handleGoToLogin, prefillFromGoogle,
} = useSignupForm()
</script>

<style scoped>
.signup-page { min-height: 100vh; }

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

.signup-form { max-width: 600px; }

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

.step.active, .step.completed { opacity: 1; }

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

.step.active .step-label { color: var(--color-text-primary); }

.step-divider {
  width: 80px;
  height: 2px;
  background: var(--color-text-tertiary);
  opacity: 0.2;
}

@media (max-width: 1024px) {
  .form-layout { grid-template-columns: 1fr; gap: 3rem; }
  .form-container { padding: 3rem; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .signup-hero { padding: 10rem var(--container-padding) 4rem; }
  .form-container { padding: 2rem; }
  .step-indicator { gap: 1rem; }
  .step-divider { width: 40px; }
}
</style>
