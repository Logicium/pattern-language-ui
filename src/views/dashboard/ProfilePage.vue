<template>
  <div class="profile-page">
    <!-- Header -->
    <section class="profile-header gradient-bg">
      <div class="container">
        <div class="profile-hero">
          <div class="profile-avatar">
            <img 
              v-if="profile?.profileImage" 
              :src="profile.profileImage" 
              :alt="profile.name"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ profile?.name?.charAt(0) || 'U' }}
            </div>
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ profile?.name }}</h1>
            <p v-if="profile?.location || profile?.state" class="profile-location text-sm text-secondary">
              {{ profile?.location }}{{ profile?.state ? `, ${profile.state}` : '' }}
            </p>
          </div>
          <button 
            v-if="isOwnProfile" 
            @click="$emit('edit')"
            class="btn edit-profile-btn"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="profile-content section-compact">
      <div class="container">
        <div class="content-grid">
          <!-- Main Column -->
          <div class="main-column">
            <!-- Bio -->
            <div v-if="profile?.bio" class="profile-section">
              <h2 class="section-title">About</h2>
              <p class="bio-text text-secondary">{{ profile.bio }}</p>
            </div>

            <!-- Current Work -->
            <div v-if="profile?.currentWork" class="profile-section">
              <h2 class="section-title">Currently Working On</h2>
              <p class="text-secondary">{{ profile.currentWork }}</p>
            </div>

            <!-- Goals -->
            <div v-if="profile?.goals" class="profile-section">
              <h2 class="section-title">Vision for 12 Months</h2>
              <p class="text-secondary">{{ profile.goals }}</p>
            </div>

            <!-- Playbooks -->
            <div v-if="profile?.playbooks?.length" class="profile-section">
              <h2 class="section-title">Playbooks</h2>
              <div class="playbooks-grid">
                <div 
                  v-for="playbook in profile.playbooks" 
                  :key="playbook.id"
                  class="playbook-card"
                >
                  <div class="playbook-header">
                    <h3 class="playbook-title">{{ playbook.patternTitle }}</h3>
                    <span class="playbook-status text-xs" :class="playbook.status">
                      {{ playbook.status }}
                    </span>
                  </div>
                  <p class="playbook-challenge text-sm text-secondary">{{ playbook.challenge }}</p>
                  <div class="playbook-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: `${playbook.progress}%` }"></div>
                    </div>
                    <span class="progress-label text-xs text-tertiary">{{ playbook.progress }}% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="sidebar-column">
            <!-- Challenges -->
            <div v-if="profile?.interests?.length" class="profile-section sidebar-card">
              <h3 class="sidebar-title">Challenges Focused On</h3>
              <ul class="challenges-list">
                <li 
                  v-for="challenge in profile.interests" 
                  :key="challenge"
                  class="challenge-item text-sm"
                >
                  {{ challenge }}
                </li>
              </ul>
            </div>

            <!-- Member Since -->
            <div class="profile-section sidebar-card">
              <h3 class="sidebar-title">Member Since</h3>
              <p class="text-sm text-secondary">{{ formatDate(profile?.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Playbook {
  id: number
  patternTitle: string
  challenge: string
  status: string
  progress: number
  createdAt: string
}

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
  playbooks?: Playbook[]
  createdAt: string
}

interface Props {
  profile: Profile | null
  isOwnProfile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOwnProfile: false
})

defineEmits<{
  'edit': []
}>()

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.profile-header {
  padding: 6rem var(--container-padding) 4rem;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-image,
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  font-size: 3rem;
  font-weight: var(--font-weight-light);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.profile-location {
  font-size: 1rem;
}

.edit-profile-btn {
  margin-left: auto;
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

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: var(--color-bg-primary);
  padding: 2.5rem;
}

.sidebar-card {
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 1.5rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-text-tertiary);
}

.bio-text {
  line-height: 1.8;
  white-space: pre-wrap;
}

.challenges-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.challenge-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  color: var(--color-text-secondary);
}

.challenge-item:last-child {
  border-bottom: none;
}

.playbooks-grid {
  display: grid;
  gap: 1.5rem;
}

.playbook-card {
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  transition: transform var(--transition-base);
}

.playbook-card:hover {
  transform: translateX(4px);
}

.playbook-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.playbook-title {
  font-size: 1.125rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
}

.playbook-status {
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.playbook-status.active {
  color: var(--color-accent-1);
}

.playbook-status.completed {
  color: var(--color-accent-2);
}

.playbook-status.paused {
  color: var(--color-text-tertiary);
}

.playbook-challenge {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.playbook-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(42, 42, 42, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-accent-1);
  transition: width var(--transition-base);
}

.progress-label {
  text-align: right;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .profile-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .edit-profile-btn {
    margin-left: 0;
    width: 100%;
  }

  .profile-name {
    font-size: 2rem;
  }

  .profile-section,
  .sidebar-card {
    padding: 1.5rem;
  }
}
</style>
