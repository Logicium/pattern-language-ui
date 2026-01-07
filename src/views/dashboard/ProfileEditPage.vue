<template>
  <div class="profile-edit-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$emit('close')" class="close-btn" aria-label="Close">
          <span class="close-icon">×</span>
        </button>
        <h1 class="page-title">Edit Profile</h1>
        <button 
          @click="handleSave" 
          class="btn save-btn"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="page-content">
      <div class="edit-container">
        <!-- Profile Image -->
        <div class="form-section">
          <h2 class="section-title">Profile Photo</h2>
          <div class="profile-image-upload">
            <div class="image-preview">
              <img 
                v-if="formData.profileImage" 
                :src="formData.profileImage" 
                alt="Profile"
                class="preview-image"
              />
              <div v-else class="preview-placeholder">
                {{ formData.name?.charAt(0) || 'U' }}
              </div>
            </div>
            <div class="upload-controls">
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*"
                @change="handleImageUpload"
                class="file-input"
              />
              <button 
                @click="triggerFileInput" 
                class="btn btn-secondary"
                :disabled="isUploading"
              >
                {{ isUploading ? 'Uploading...' : 'Change Photo' }}
              </button>
              <button 
                v-if="formData.profileImage"
                @click="removeImage" 
                class="btn-text"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Basic Info -->
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
              <select v-model="formData.state" class="form-input">
                <option value="">Select state</option>
                <option v-for="state in usStates" :key="state.value" :value="state.value">
                  {{ state.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

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

        <!-- Privacy Settings -->
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
    </div>

    <!-- Toast -->
    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Toast } from '@/components'
import { US_STATES, WICKED_CHALLENGES } from '@/utils/constants'
import { usersApi, uploadApi } from '@/services/api'

interface Profile {
  name: string
  bio?: string
  profileImage?: string
  location?: string
  state?: string
  currentWork?: string
  goals?: string
  interests?: string[]
  isPublic: boolean
}

interface Props {
  profile: Profile
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'saved': [profile: Profile]
}>()

const usStates = US_STATES
const wickedChallenges = WICKED_CHALLENGES

const fileInput = ref<HTMLInputElement>()
const isSaving = ref(false)
const isUploading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const formData = reactive<Profile>({
  name: props.profile.name,
  bio: props.profile.bio || '',
  profileImage: props.profile.profileImage || '',
  location: props.profile.location || '',
  state: props.profile.state || '',
  currentWork: props.profile.currentWork || '',
  goals: props.profile.goals || '',
  interests: props.profile.interests || [],
  isPublic: props.profile.isPublic ?? true
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toastMessage.value = 'Image must be less than 5MB'
    showToast.value = true
    return
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    toastMessage.value = 'Please select an image file'
    showToast.value = true
    return
  }
  
  isUploading.value = true
  
  try {
    const result = await uploadApi.uploadImage(file)
    formData.profileImage = result.url
    toastMessage.value = 'Image uploaded successfully'
    showToast.value = true
  } catch (error) {
    console.error('Upload error:', error)
    toastMessage.value = 'Failed to upload image'
    showToast.value = true
  } finally {
    isUploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeImage = () => {
  formData.profileImage = ''
}

const handleSave = async () => {
  isSaving.value = true
  
  try {
    const updated = await usersApi.updateMyProfile(formData)
    toastMessage.value = 'Profile updated successfully'
    showToast.value = true
    
    setTimeout(() => {
      emit('saved', updated)
      emit('close')
    }, 500)
  } catch (error) {
    console.error('Save error:', error)
    toastMessage.value = 'Failed to save profile'
    showToast.value = true
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  padding: 2rem var(--container-padding);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--color-text-primary);
  transition: opacity var(--transition-fast);
}

.close-btn:hover {
  opacity: 0.6;
}

.close-icon {
  font-size: 2.5rem;
  line-height: 1;
  font-weight: var(--font-weight-light);
}

.page-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-content {
  flex: 1;
  padding: 3rem var(--container-padding);
}

.edit-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.form-section {
  background: var(--color-bg-secondary);
  padding: 2.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
}

/* Profile Image Upload */
.profile-image-upload {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.image-preview {
  flex-shrink: 0;
}

.preview-image,
.preview-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
}

.upload-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-input {
  display: none;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.875rem;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: all var(--transition-fast);
}

.btn-text:hover {
  color: var(--color-text-primary);
  text-decoration-color: currentColor;
}

/* Form Elements */
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
  .header-content {
    gap: 1rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-row,
  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .profile-image-upload {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
