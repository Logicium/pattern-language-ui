<template>
  <div class="profile-page-wrapper">
    <div v-if="loading" class="loading-state">
      <p class="text-sm text-secondary">Loading profile...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <h2 class="error-title">Profile Not Found</h2>
      <p class="text-sm text-secondary">{{ error }}</p>
      <button @click="$router.push('/dashboard')" class="btn">
        Back to Dashboard
      </button>
    </div>
    
    <ProfilePageComponent 
      v-else-if="profile"
      :profile="profile"
      :is-own-profile="isOwnProfile"
      @edit="showEdit = true"
    />

    <!-- Edit Profile Modal -->
    <SlideInModal v-model="showEdit">
      <ProfileEditPage 
        v-if="profile"
        :profile="profile"
        @close="showEdit = false"
        @saved="handleProfileSaved"
      />
    </SlideInModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/services/api'
import { SlideInModal } from '@/components'
import ProfilePageComponent from './ProfilePage.vue'
import ProfileEditPage from './ProfileEditPage.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const profile = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showEdit = ref(false)

const userId = computed(() => parseInt(route.params.id as string))
const isOwnProfile = computed(() => authStore.currentUser?.id === userId.value)

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    profile.value = await usersApi.getProfile(userId.value)
    
    // Check if profile is public or is own profile
    if (!profile.value.isPublic && !isOwnProfile.value) {
      error.value = 'This profile is private'
      profile.value = null
    }
  } catch (err: any) {
    console.error('Failed to load profile:', err)
    error.value = 'Unable to load profile'
  } finally {
    loading.value = false
  }
}

const handleProfileSaved = (updatedProfile: any) => {
  profile.value = updatedProfile
  authStore.updateUser(updatedProfile)
}
</script>

<style scoped>
.profile-page-wrapper {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.loading-state,
.error-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: var(--container-padding);
}

.error-title {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
}
</style>
