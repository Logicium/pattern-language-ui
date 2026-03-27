<template>
  <div class="work-section">
    <!-- Work & Goals -->
    <div class="form-section">
      <h2 class="section-title">Work & Vision</h2>
      
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
    </div>

    <!-- Challenges -->
    <div class="form-section">
      <h2 class="section-title">Challenges You're Addressing</h2>
      
      <div class="checkbox-grid">
        <label
          v-for="challenge in wickedChallenges"
          :key="challenge"
          class="checkbox-label text-sm"
        >
          <input
            v-model="formData.interests"
            type="checkbox"
            :value="challenge"
            class="checkbox-input"
          />
          <span>{{ challenge }}</span>
        </label>
      </div>
    </div>

    <!-- Privacy -->
    <div class="form-section">
      <h2 class="section-title">Privacy</h2>
      
      <label class="checkbox-label text-sm privacy-toggle">
        <input
          v-model="formData.isPublic"
          type="checkbox"
          class="checkbox-input"
        />
        <span class="privacy-text">
          <strong>Make profile visible</strong>
          <span class="text-xs text-tertiary">Allow others in your community to find and view your profile</span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProfileData } from '@/composables/useProfileEdit'
import { WICKED_CHALLENGES } from '@/utils/constants'

defineProps<{ formData: ProfileData }>()

const wickedChallenges = WICKED_CHALLENGES
</script>

<style scoped>
.work-section {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.form-section {
  background: var(--color-bg-secondary);
  padding: 2.5rem;
}

.section-title {
  font-weight: var(--font-weight-normal);
  margin-bottom: 2rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
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

.form-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  transition: all var(--transition-base);
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent-1);
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
  background: var(--color-bg-primary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent-1);
  flex-shrink: 0;
}

.privacy-toggle {
  padding: 1.5rem;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
}

.privacy-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .form-section {
    padding: 1.5rem;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }
}
</style>
