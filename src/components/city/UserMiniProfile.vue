<template>
  <div class="user-mini">
    <div class="avatar">
      <img v-if="user.profileImage" :src="user.profileImage" :alt="user.name" class="avatar-img" />
      <span v-else class="avatar-initials text-xs">{{ initials }}</span>
    </div>
    <div class="user-info">
      <p class="user-name text-sm">{{ user.name }}</p>
      <p v-if="user.currentWork" class="user-work text-xs text-tertiary">{{ user.currentWork }}</p>
      <p v-else-if="user.bio" class="user-bio text-xs text-secondary">{{ truncated }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  user: {
    id: number
    name: string
    bio?: string
    profileImage?: string
    currentWork?: string
  }
}>()

const initials = computed(() =>
  props.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
)
const truncated = computed(() =>
  props.user.bio && props.user.bio.length > 80 ? props.user.bio.slice(0, 80) + '…' : props.user.bio
)
</script>

<style scoped>
.user-mini {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(42, 42, 42, 0.08);
  background: var(--color-bg-primary);
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { color: var(--color-text-secondary); letter-spacing: 0.05em; }
.user-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.user-name { font-weight: var(--font-weight-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-work, .user-bio { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
