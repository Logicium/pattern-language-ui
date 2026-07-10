<template>
  <div class="content-block">
    <h2 class="section-subtitle">Overview</h2>
    <div class="overview-content">
      <!-- Pattern & Challenge Grid -->
      <div class="overview-grid">
        <div class="overview-item">
          <span class="overview-label">
            <span class="accent-mark" data-accent="1" aria-hidden="true"></span>
            Original Pattern
          </span>
          <button
            @click="$emit('openPattern', playbook.patternId)"
            class="overview-chip"
            data-accent="1"
          >
            {{ playbook.patternTitle }}
          </button>
        </div>
        <div class="overview-item">
          <span class="overview-label">
            <span class="accent-mark" data-accent="3" aria-hidden="true"></span>
            {{ playbook.challenges && playbook.challenges.length > 0 ? 'Related Wicked Problems' : 'Challenge' }}
          </span>
          <div class="challenges-list">
            <button
              v-if="playbook.challenges && playbook.challenges.length > 0"
              v-for="(challenge, i) in playbook.challenges"
              :key="challenge.id"
              @click="$emit('openChallenge', challenge.id)"
              class="overview-chip"
              :data-accent="((i + 2) % 3) + 1"
            >
              {{ challenge.title }}
            </button>
            <div v-else class="overview-chip" data-accent="3">
              {{ playbook.challenge }}
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="overview-section">
        <span class="overview-label">
          <span class="accent-mark" data-accent="2" aria-hidden="true"></span>
          Timeline
        </span>
        <PlaybookTimeline :playbook="playbook" />
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
import { getInitials } from '@/utils/formatters'
import PlaybookTimeline from '@/components/playbook/PlaybookTimeline.vue'
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

.overview-item p {
  line-height: 1.7;
}

.overview-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Micro-caps label with the 8px accent square from the card language */
.overview-label {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.accent-mark[data-accent="1"] { background: var(--color-accent-1); }
.accent-mark[data-accent="2"] { background: var(--color-accent-2); }
.accent-mark[data-accent="3"] { background: var(--color-accent-3); }

/* Tinted chips, identical to the playbook-card pattern chip */
.overview-chip {
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  border: none;
  font-family: var(--font-family);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  transition: background-color var(--transition-fast);
}

button.overview-chip { cursor: pointer; }

.overview-chip[data-accent="1"] { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.overview-chip[data-accent="2"] { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.overview-chip[data-accent="3"] { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

button.overview-chip[data-accent="1"]:hover { background: color-mix(in srgb, var(--color-accent-1) 42%, transparent); }
button.overview-chip[data-accent="2"]:hover { background: color-mix(in srgb, var(--color-accent-2) 50%, transparent); }
button.overview-chip[data-accent="3"]:hover { background: color-mix(in srgb, var(--color-accent-3) 42%, transparent); }

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
