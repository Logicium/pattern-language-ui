import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userStoriesApi, uploadApi } from '@/services/api'

export function useGeneratedStory() {
  const route = useRoute()
  const router = useRouter()

  const storyId = computed(() => Number(route.params.id))
  const story = ref<any>(null)
  const isEditing = ref(false)
  const editableStory = ref<any>({})
  const showDeleteModal = ref(false)
  const showToast = ref(false)
  const toastMessage = ref('')

  const toast = (msg: string) => {
    toastMessage.value = msg
    showToast.value = true
  }

  onMounted(async () => {
    try {
      story.value = await userStoriesApi.getById(storyId.value)
    } catch (error) {
      console.error('Failed to fetch story:', error)
    }
  })

  const startEditing = () => {
    editableStory.value = { ...story.value }
    isEditing.value = true
  }

  const cancelEditing = () => {
    editableStory.value = {}
    isEditing.value = false
  }

  const saveStory = async () => {
    try {
      const updated = await userStoriesApi.update(story.value.id, editableStory.value)
      story.value = updated
      isEditing.value = false
      toast('Story updated successfully')
    } catch (error) {
      console.error('Failed to update story:', error)
      toast('Failed to update story')
    }
  }

  const publishStory = async () => {
    try {
      const updated = await userStoriesApi.update(story.value.id, {
        published: true,
        publishedDate: new Date().toISOString().split('T')[0]
      })
      story.value = updated
      toast('Story published successfully')
    } catch (error) {
      console.error('Failed to publish story:', error)
      toast('Failed to publish story')
    }
  }

  const unpublishStory = async () => {
    try {
      const updated = await userStoriesApi.update(story.value.id, {
        published: false,
        publishedDate: null as any
      })
      story.value = updated
      toast('Story unpublished')
    } catch (error) {
      console.error('Failed to unpublish story:', error)
      toast('Failed to unpublish story')
    }
  }

  const handleDelete = async () => {
    try {
      await userStoriesApi.delete(story.value.id)
      router.push('/dashboard/success-stories')
    } catch (error) {
      console.error('Failed to delete story:', error)
      toast('Failed to delete story')
    }
  }

  const uploadStoryImage = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast('Image size must be less than 5MB'); return }
    try {
      toast('Uploading image...')
      const result = await uploadApi.uploadImage(file)
      editableStory.value.image = result.url
      toast('Image uploaded successfully')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return {
    story, isEditing, editableStory, showDeleteModal, showToast, toastMessage,
    startEditing, cancelEditing, saveStory, publishStory, unpublishStory,
    handleDelete, uploadStoryImage, formatDate
  }
}
