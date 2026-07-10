<template>
  <router-link :to="`/dashboard/playbooks/${playbook.id}`" class="playbook-card" :data-accent="accent">
    <div class="label-row">
      <span class="label-id">
        <span class="accent-mark" aria-hidden="true"></span>
        Pattern {{ String(playbook.patternId).padStart(2, '0') }}
      </span>
      <span v-if="index !== undefined" class="label-index">№ {{ String(index).padStart(2, '0') }}</span>
    </div>

    <h3 class="card-title">{{ playbookTitle(playbook) }}</h3>

    <span class="pattern-chip">{{ playbook.patternTitle }}</span>

    <div class="provenance-row">
      <p class="card-provenance">
        {{ playbook.location }}<template v-if="showCreator && playbook.user">&ensp;·&ensp;{{ playbook.user.name }}</template>
      </p>
      <div v-if="memberList.length > 0" class="member-stack" :title="memberNames">
        <span
          v-for="member in memberList.slice(0, 4)"
          :key="member.id"
          class="member-avatar"
          :style="member.user?.profileImage ? { backgroundImage: `url(${member.user.profileImage})` } : undefined"
        >{{ member.user?.profileImage ? '' : getInitials(member.user?.name || '?') }}</span>
        <span v-if="memberList.length > 4" class="member-more">+{{ memberList.length - 4 }}</span>
      </div>
    </div>

    <dl class="caption">
      <div class="caption-row">
        <dt>Challenge</dt>
        <dd>{{ playbook.challenge }}</dd>
      </div>
      <div class="caption-row">
        <dt>Due</dt>
        <dd>{{ formatDate(playbook.targetCompletionDate) }}</dd>
      </div>
    </dl>

    <div class="card-foot">
      <div class="progress-line">
        <span class="progress-fill" :style="{ width: `${playbook.progress}%` }"></span>
      </div>
      <div class="foot-row">
        <span class="foot-note">{{ tasksCompleted }} of {{ playbook.tasks.length }} tasks — {{ playbook.progress }}%</span>
        <span class="view-note">View</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { playbookTitle, getInitials } from '@/utils/formatters'

const props = defineProps<{
  playbook: any
  accent: number
  index?: number
  showCreator?: boolean
  formatDate: (dateString: string) => string
}>()

const tasksCompleted = computed(() =>
  props.playbook.tasks.filter((t: any) => t.completed).length
)

// Creator first, then collaborators; tolerates older cached data without members
const memberList = computed(() => {
  const members = props.playbook.members
  if (!Array.isArray(members)) return []
  return [...members].sort((a, b) => (a.role === 'creator' ? -1 : 0) - (b.role === 'creator' ? -1 : 0))
})

const memberNames = computed(() =>
  memberList.value.map((m: any) => m.user?.name).filter(Boolean).join(', ')
)
</script>

<style scoped>
.playbook-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  padding: 2.75rem 2.5rem 2.25rem;
  text-decoration: none;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.playbook-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 2.25rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.playbook-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.playbook-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.playbook-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.card-title {
  font-size: 1.75rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.18;
  margin: 0 0 1.25rem;
}

.pattern-chip {
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  margin-bottom: 1.25rem;
}

.playbook-card[data-accent="1"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.playbook-card[data-accent="2"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.playbook-card[data-accent="3"] .pattern-chip { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

.provenance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.25rem;
}

.card-provenance {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin: 0;
}

.member-stack {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.member-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid var(--color-bg-primary);
  background-color: var(--color-bg-secondary);
  background-size: cover;
  background-position: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.member-avatar + .member-avatar,
.member-avatar + .member-more {
  margin-left: -8px;
}

.playbook-card[data-accent="1"] .member-avatar:not([style]) { background-color: color-mix(in srgb, var(--color-accent-1) 30%, var(--color-bg-primary)); }
.playbook-card[data-accent="2"] .member-avatar:not([style]) { background-color: color-mix(in srgb, var(--color-accent-2) 36%, var(--color-bg-primary)); }
.playbook-card[data-accent="3"] .member-avatar:not([style]) { background-color: color-mix(in srgb, var(--color-accent-3) 30%, var(--color-bg-primary)); }

.member-more {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid var(--color-bg-primary);
  background: var(--color-bg-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5625rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
}

.caption {
  margin: 0 0 2.5rem;
  border-top: 1px solid var(--hairline);
}

.caption-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2.5rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--hairline);
}

.caption-row dt {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.caption-row dd {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  text-align: right;
}

.card-foot { margin-top: auto; }

.progress-line {
  height: 2px;
  background: var(--hairline);
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3));
  transition: width var(--transition-base);
}

.foot-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.foot-note { color: var(--color-text-tertiary); }

.view-note {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--hairline-strong);
  padding-bottom: 2px;
  transition: border-color var(--transition-fast);
}

.playbook-card:hover .view-note {
  border-bottom-color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .playbook-card { padding: 2.25rem 1.75rem 2rem; }
  .card-title { font-size: 1.5rem; }
}
</style>
