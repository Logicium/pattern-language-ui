<template>
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
          @change="handleFileChange"
          class="file-input"
        />
        <button 
          @click="fileInput?.click()" 
          class="btn btn-secondary"
          :disabled="isUploading"
        >
          {{ isUploading ? 'Uploading...' : 'Change Photo' }}
        </button>
        <button 
          v-if="formData.profileImage"
          @click="$emit('remove')" 
          class="btn-text"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProfileData } from '@/composables/useProfileEdit'

defineProps<{
  formData: ProfileData
  isUploading: boolean
}>()

const emit = defineEmits<{
  'upload': [file: File]
  'remove': []
}>()

const fileInput = ref<HTMLInputElement>()

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) emit('upload', file)
  if (fileInput.value) fileInput.value.value = ''
}
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

@media (max-width: 768px) {
  .form-section {
    padding: 1.5rem;
  }

  .profile-image-upload {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
