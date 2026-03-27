<template>
  <div class="profile-edit-page">
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

    <div class="page-content">
      <div class="edit-container">
        <ProfilePhotoSection
          :form-data="formData"
          :is-uploading="isUploading"
          @upload="uploadImage"
          @remove="removeImage"
        />
        <ProfileBasicInfo :form-data="formData" />
        <ProfileWorkSection :form-data="formData" />
      </div>
    </div>

    <Toast
      :show="showToast"
      :message="toastMessage"
      @update:show="showToast = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { Toast } from '@/components'
import ProfilePhotoSection from '@/components/profile/ProfilePhotoSection.vue'
import ProfileBasicInfo from '@/components/profile/ProfileBasicInfo.vue'
import ProfileWorkSection from '@/components/profile/ProfileWorkSection.vue'
import { useProfileEdit, type ProfileData } from '@/composables/useProfileEdit'

const props = defineProps<{ profile: ProfileData }>()

const emit = defineEmits<{
  'close': []
  'saved': [profile: ProfileData]
}>()

const {
  isSaving, isUploading, showToast, toastMessage,
  formData, uploadImage, removeImage, handleSave
} = useProfileEdit(
  props.profile,
  (updated) => emit('saved', updated),
  () => emit('close')
)
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

.close-btn:hover { opacity: 0.6; }

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

@media (max-width: 768px) {
  .header-content { gap: 1rem; }
  .page-title { font-size: 1.25rem; }
}
</style>
