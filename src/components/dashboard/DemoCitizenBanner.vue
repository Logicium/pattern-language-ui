<template>
  <div v-if="isDemoUser" class="demo-banner">
    <p class="demo-banner__text">
      <span class="demo-banner__chip">Demo</span>
      You're <strong>{{ currentUser?.name }}</strong>, a citizen of Cottonwood Springs —
      a fictional sandbox town. Explore freely; nothing here is real except what you learn.
    </p>
    <button class="btn-text demo-banner__cta" @click="showClaim = true">
      Keep this profile
    </button>
  </div>

  <SlideInModal v-model="showClaim">
    <div class="claim-panel">
      <p class="text-xs claim-eyebrow">Keep your work</p>
      <h2 class="claim-title">Make this a real account</h2>
      <p class="text-sm text-secondary claim-intro">
        Your citizen profile — every playbook, chat, and team you've built in the sandbox —
        becomes a normal Pattern Language account. Free for early community members.
      </p>

      <form class="claim-form" @submit.prevent="submit">
        <label class="claim-field">
          <span class="claim-label">Your name</span>
          <input v-model="form.name" type="text" class="form-input" required maxlength="120" />
        </label>
        <label class="claim-field">
          <span class="claim-label">Email</span>
          <input v-model="form.email" type="email" class="form-input" required />
        </label>
        <label class="claim-field">
          <span class="claim-label">Password</span>
          <input v-model="form.password" type="password" class="form-input" required minlength="6" />
        </label>

        <p v-if="error" class="claim-error text-sm">{{ error }}</p>

        <div class="claim-actions">
          <button type="submit" class="btn" :disabled="saving">
            {{ saving ? 'Saving…' : 'Claim my profile' }}
          </button>
          <button type="button" class="btn-text" @click="showClaim = false">Not yet</button>
        </div>
      </form>
    </div>
  </SlideInModal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import SlideInModal from '@/components/SlideInModal.vue'

const authStore = useAuthStore()
const { currentUser, isDemoUser } = storeToRefs(authStore)

const showClaim = ref(false)
const saving = ref(false)
const error = ref('')
const form = reactive({ name: '', email: '', password: '' })

async function submit() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    await authStore.claimDemo({ ...form })
    showClaim.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not claim this profile.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.demo-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.65rem var(--container-padding);
  background: color-mix(in srgb, var(--color-accent-3) 14%, var(--color-bg-primary));
  border-bottom: 1px solid var(--hairline);
  position: relative;
  z-index: 20;
}

.demo-banner__text {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-text-secondary);
}

.demo-banner__text strong {
  font-weight: 400;
  color: var(--color-text-primary);
}

.demo-banner__chip {
  display: inline-block;
  margin-right: 0.75rem;
  padding: 0.1rem 0.5rem;
  border: 1px solid var(--color-accent-3);
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.demo-banner__cta {
  white-space: nowrap;
}

.claim-panel {
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 480px;
}

.claim-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
  margin: 0;
}

.claim-title {
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  font-size: 1.75rem;
  margin: 0;
}

.claim-intro {
  margin: 0 0 0.5rem;
}

.claim-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.claim-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.claim-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-tertiary);
}

.claim-error {
  color: var(--color-accent-warm);
  margin: 0;
}

.claim-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .demo-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    /* Every rem here is a rem stolen from the chat on a phone. */
    padding: 0.55rem 1rem;
  }

  .demo-banner__text {
    font-size: 0.75rem;
    line-height: 1.45;
  }
}
</style>
