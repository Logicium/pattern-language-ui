import { ref, reactive } from 'vue'
import { usersApi, uploadApi } from '@/services/api'

export interface ProfileData {
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

export function useProfileEdit(
  profile: ProfileData,
  onSaved: (updated: ProfileData) => void,
  onClose: () => void
) {
  const isSaving = ref(false)
  const isUploading = ref(false)
  const showToast = ref(false)
  const toastMessage = ref('')

  const formData = reactive<ProfileData>({
    name: profile.name,
    bio: profile.bio || '',
    profileImage: profile.profileImage || '',
    location: profile.location || '',
    state: profile.state || '',
    currentWork: profile.currentWork || '',
    goals: profile.goals || '',
    interests: profile.interests || [],
    isPublic: profile.isPublic ?? true
  })

  const toast = (msg: string) => {
    toastMessage.value = msg
    showToast.value = true
  }

  const uploadImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast('Image must be less than 5MB'); return }
    if (!file.type.startsWith('image/')) { toast('Please select an image file'); return }
    isUploading.value = true
    try {
      const result = await uploadApi.uploadImage(file)
      formData.profileImage = result.url
      toast('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast('Failed to upload image')
    } finally {
      isUploading.value = false
    }
  }

  const removeImage = () => {
    formData.profileImage = ''
  }

  const handleSave = async () => {
    isSaving.value = true
    try {
      const updated = await usersApi.updateMyProfile(formData)
      toast('Profile updated successfully')
      setTimeout(() => {
        onSaved(updated)
        onClose()
      }, 500)
    } catch (error) {
      console.error('Save error:', error)
      toast('Failed to save profile')
    } finally {
      isSaving.value = false
    }
  }

  return {
    isSaving, isUploading, showToast, toastMessage,
    formData, uploadImage, removeImage, handleSave
  }
}
