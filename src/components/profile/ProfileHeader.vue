<template>
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
        <div class="profile-actions">
          <button
            v-if="isOwnProfile"
            @click="$emit('edit')"
            class="btn edit-profile-btn"
          >
            Edit Profile
          </button>
          <button
            v-else
            @click="$emit('invite')"
            class="btn edit-profile-btn"
          >
            Invite to Playbook
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  profile: any
  isOwnProfile: boolean
}>()

defineEmits<{
  edit: []
  invite: []
}>()
</script>

<style scoped>
.profile-header {
  padding: 6rem var(--container-padding) 4rem;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
}

.profile-avatar { flex-shrink: 0; }

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

.profile-info { flex: 1; }

.profile-name {
  font-size: 2.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.profile-location { font-size: 1rem; }
.profile-actions { margin-left: auto; }
.edit-profile-btn { white-space: nowrap; }

@media (max-width: 768px) {
  .profile-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .edit-profile-btn {
    margin-left: 0;
    width: 100%;
  }

  .profile-name { font-size: 2rem; }
}
</style>
