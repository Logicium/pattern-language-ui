<template>
  <div class="profile-page">
    <ProfileHeader
      :profile="profile"
      :is-own-profile="isOwnProfile"
      @edit="$emit('edit')"
      @invite="showInviteModal = true"
    />

    <section class="profile-content section-compact">
      <div class="container">
        <div class="content-grid">
          <div class="main-column">
            <div v-if="profile?.bio" class="profile-section">
              <h2 class="section-title">About</h2>
              <p class="bio-text text-secondary">{{ profile.bio }}</p>
            </div>

            <div v-if="profile?.currentWork" class="profile-section">
              <h2 class="section-title">Currently Working On</h2>
              <p class="text-secondary">{{ profile.currentWork }}</p>
            </div>

            <div v-if="profile?.goals" class="profile-section">
              <h2 class="section-title">Vision for 12 Months</h2>
              <p class="text-secondary">{{ profile.goals }}</p>
            </div>

            <ProfilePlaybooks :playbooks="profile?.playbooks" />
          </div>

          <ProfileSidebar
            :interests="profile?.interests"
            :created-at="profile?.createdAt"
          />
        </div>
      </div>
    </section>

    <InviteToPlaybookModal
      :show="showInviteModal"
      :user="profile"
      @close="showInviteModal = false"
      @invited="showInviteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InviteToPlaybookModal from '@/components/InviteToPlaybookModal.vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfilePlaybooks from '@/components/profile/ProfilePlaybooks.vue'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'

const showInviteModal = ref(false)

interface Profile {
  id: number
  name: string
  email: string
  bio?: string
  profileImage?: string
  location?: string
  state?: string
  currentWork?: string
  goals?: string
  interests?: string[]
  isPublic: boolean
  playbooks?: any[]
  createdAt: string
}

interface Props {
  profile: Profile | null
  isOwnProfile?: boolean
}

withDefaults(defineProps<Props>(), {
  isOwnProfile: false
})

defineEmits<{
  'edit': []
}>()
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.profile-content {
  background: var(--color-bg-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 4rem;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.profile-section {
  background: var(--color-bg-primary);
  padding: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 1.5rem;
}

.bio-text {
  line-height: 1.8;
  white-space: pre-wrap;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .profile-section { padding: 1.5rem; }
}
</style>
