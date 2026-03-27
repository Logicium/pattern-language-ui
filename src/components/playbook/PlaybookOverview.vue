<template>
  <div class="content-block">
    <h2 class="section-subtitle">Overview</h2>
    <div class="overview-content">
      <!-- Pattern & Challenge Grid -->
      <div class="overview-grid">
        <div class="overview-item">
          <span class="section-label text-xs text-tertiary">Original Pattern</span>
          <button 
            @click="$emit('openPattern', playbook.patternId)" 
            class="badge badge-pattern text-xs clickable-badge"
          >
            {{ playbook.patternTitle }}
          </button>
        </div>
        <div class="overview-item">
          <span class="section-label text-xs text-tertiary">{{ playbook.challenges && playbook.challenges.length > 0 ? 'Related Wicked Problems' : 'Challenge' }}</span>
          <div class="challenges-list">
            <button
              v-if="playbook.challenges && playbook.challenges.length > 0"
              v-for="challenge in playbook.challenges"
              :key="challenge.id"
              @click="$emit('openChallenge', challenge.id)"
              class="badge badge-challenge text-xs clickable-badge"
            >
              {{ challenge.title }}
            </button>
            <div v-else class="badge badge-challenge text-xs">
              {{ playbook.challenge }}
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="overview-section">
        <div class="timeline">
          <div class="timeline-item">
            <span class="timeline-label text-xs text-tertiary">STARTED</span>
            <div class="timeline-value">
              <div class="timeline-marker" data-accent="1"></div>
              <p class="timeline-date text-sm">{{ formatDate(playbook.startDate) }}</p>
            </div>
          </div>
          <div class="timeline-item">
            <span class="timeline-label text-xs text-tertiary">TARGET COMPLETION</span>
            <div class="timeline-value">
              <div class="timeline-marker" data-accent="2"></div>
              <p class="timeline-date text-sm">{{ formatDate(playbook.targetCompletionDate) }}</p>
            </div>
          </div>
          <div v-if="playbook.completedDate" class="timeline-item">
            <span class="timeline-label text-xs text-tertiary">COMPLETED</span>
            <div class="timeline-value">
              <div class="timeline-marker" data-accent="3"></div>
              <p class="timeline-date text-sm">{{ formatDate(playbook.completedDate) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaboration (moved to Team tab) -->
      <div class="overview-section" v-if="members.length > 0">
        <span class="section-label text-xs text-tertiary">Team</span>
        <div class="members-grid">
          <router-link 
            v-for="member in members.slice(0, 5)" 
            :key="member.id"
            :to="`/dashboard/profile/${member.user.id}`"
            class="member-card"
            :class="{ 'member-creator': member.role === 'creator' }"
          >
            <div class="member-circle">
              {{ getInitials(member.user.name) }}
            </div>
            <div class="member-name text-xs">{{ member.user.name }}</div>
          </router-link>
          <span v-if="members.length > 5" class="text-xs text-tertiary" style="align-self: center;">
            +{{ members.length - 5 }} more
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate, getInitials } from '@/utils/formatters'
import type { PlaybookMember } from '@/types/collaboration'

defineProps<{
  playbook: any
  members: PlaybookMember[]
  userRole: string | null
  isUserMember: boolean
  isGenerating: boolean
  loading: boolean
}>()

defineEmits<{
  openPattern: [patternId: number]
  openChallenge: [challengeId: number]
}>()
</script>

<style scoped>
.overview-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-top: 2.5rem;
}

.overview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.overview-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.overview-item .badge {
  align-self: flex-start;
}

.overview-item p {
  line-height: 1.7;
}

.overview-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.clickable-badge {
  cursor: pointer;
}

.badge.clickable-badge:hover {
  border-color: var(--color-accent-2);
}

.challenges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

.public-indicator {
  padding: 0.75rem;
  background: #f0f8f0;
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-actions {
    flex-direction: column;
  }
  .btn-sm,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
