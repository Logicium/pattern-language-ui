<template>
  <div class="form-step">
    <h2 class="step-title">Tell Us About Your Community</h2>

    <!-- Google account summary when using Google signup -->
    <div v-if="isGoogleSignup" class="google-account-summary">
      <div class="account-info">
        <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span class="text-sm">{{ formData.firstName }} {{ formData.lastName }}</span>
        <span class="text-xs text-tertiary">&middot;</span>
        <span class="text-xs text-tertiary">{{ formData.email }}</span>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Community Name</label>
      <input
        :value="formData.communityName"
        @input="update('communityName', ($event.target as HTMLInputElement).value)"
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
          :value="formData.population"
          @input="update('population', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="e.g., 8,000"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label text-xs text-tertiary">State</label>
        <select :value="formData.state" @change="update('state', ($event.target as HTMLSelectElement).value)" class="form-input" required>
          <option value="">Select state</option>
          <option v-for="state in usStates" :key="state.value" :value="state.value">
            {{ state.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Your Role</label>
      <select :value="formData.role" @change="update('role', ($event.target as HTMLSelectElement).value)" class="form-input" required>
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
          v-for="challenge in wickedChallenges"
          :key="challenge"
          class="checkbox-label text-sm"
        >
          <input
            type="checkbox"
            :value="challenge"
            :checked="formData.selectedChallenges.includes(challenge)"
            @change="toggleChallenge(challenge)"
            class="checkbox-input"
          />
          <span>{{ challenge }}</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">What are you currently working on?</label>
      <textarea
        :value="formData.currentWork"
        @input="update('currentWork', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Tell us about initiatives, projects, or ideas you're exploring..."
        class="form-textarea"
        rows="4"
      ></textarea>
    </div>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">What would success look like in 12 months?</label>
      <textarea
        :value="formData.goals"
        @input="update('goals', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Describe your vision for your community's future..."
        class="form-textarea"
        rows="4"
      ></textarea>
    </div>

    <div class="form-actions">
      <div class="button-group">
        <button type="button" class="btn btn-lg btn-secondary" @click="$emit('prevStep')">
          Back
        </button>
        <button type="submit" class="btn btn-lg submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Get Started' }}
        </button>
      </div>
      <p class="text-xs text-tertiary privacy-note">
        By creating a profile, you agree to share your community's story 
        with the Pattern Language network. We'll never sell your data.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { US_STATES, WICKED_CHALLENGES } from '@/utils/constants'
import type { SignupFormData } from '@/composables/useSignupForm'

const props = defineProps<{
  formData: SignupFormData
  isSubmitting: boolean
  isGoogleSignup: boolean
}>()

const emit = defineEmits<{
  'update:formData': [value: SignupFormData]
  prevStep: []
}>()

const usStates = US_STATES
const wickedChallenges = WICKED_CHALLENGES

const update = (key: keyof SignupFormData, value: any) => {
  emit('update:formData', { ...props.formData, [key]: value })
}

const toggleChallenge = (challenge: string) => {
  const current = [...props.formData.selectedChallenges]
  const idx = current.indexOf(challenge)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(challenge)
  emit('update:formData', { ...props.formData, selectedChallenges: current })
}
</script>

<style scoped>
.form-step { animation: fadeIn 0.4s ease; }
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

.google-account-summary {
  margin-bottom: 2.5rem;
  padding: 1rem 1.25rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.06);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.google-icon {
  flex-shrink: 0;
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

.checkbox-label:hover { background: var(--color-bg-secondary); }

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent-1);
}

.form-actions {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: start;
}

.button-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.submit-btn { width: 100%; }

.btn-secondary {
  background: transparent !important;
  border: 1px solid var(--color-text-tertiary) !important;
  color: var(--color-text-primary) !important;
}

.btn-lg.btn-secondary { padding: 1rem 2.5rem !important; }
.btn-secondary::before { display: none !important; }

.btn-secondary:hover {
  border-color: var(--color-text-primary) !important;
  box-shadow: none !important;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.privacy-note { line-height: 1.6; text-align: center; }

@media (max-width: 1024px) {
  .checkbox-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .button-group { grid-template-columns: 1fr; }
}
</style>
