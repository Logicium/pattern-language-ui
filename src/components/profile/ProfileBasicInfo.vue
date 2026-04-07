<template>
  <div class="form-section">
    <h2 class="section-title">Basic Information</h2>
    
    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Name</label>
      <input
        v-model="formData.name"
        type="text"
        placeholder="Your name"
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label class="form-label text-xs text-tertiary">Bio</label>
      <textarea
        v-model="formData.bio"
        placeholder="Tell us about yourself..."
        class="form-textarea"
        rows="4"
      ></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label text-xs text-tertiary">Town/City</label>
        <input
          v-model="formData.location"
          type="text"
          placeholder="e.g., Trinidad"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label class="form-label text-xs text-tertiary">State</label>
        <AppDropdown
          v-model="formData.state"
          :options="usStates"
          placeholder="Select state"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProfileData } from '@/composables/useProfileEdit'
import { US_STATES } from '@/utils/constants'
import AppDropdown from '@/components/AppDropdown.vue'

defineProps<{ formData: ProfileData }>()

const usStates = US_STATES
</script>

<style scoped>
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
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
  transition: all var(--transition-base);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent-1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

@media (max-width: 768px) {
  .form-section {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
