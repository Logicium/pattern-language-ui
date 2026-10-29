<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import { organizersApi, type OrganizerInvitePeek } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

/**
 * Where an organizer invite email lands (/admin/join?token=…). The link is the
 * proof: whoever opens it signed in, with a real account, becomes an
 * organizer. Signed out, it sends them to sign in or sign up and back here.
 */
useHead({ title: 'Join the organizers' })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const here = computed(() => route.fullPath)

const peek = ref<OrganizerInvitePeek | null>(null)
const loadError = ref('')
const accepting = ref(false)
const acceptError = ref('')

const signedIn = computed(() => auth.isAuthenticated)
const isDemo = computed(() => auth.isDemoUser)
const userName = computed(() => auth.user?.name ?? '')
const userEmail = computed(() => auth.user?.email ?? '')

const expires = computed(() =>
  peek.value?.status === 'pending' && peek.value.expiresAt
    ? new Date(peek.value.expiresAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    : ''
)

onMounted(async () => {
  if (!token.value) {
    peek.value = { status: 'invalid' }
    return
  }
  try {
    peek.value = await organizersApi.peek(token.value)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Could not check the invite.'
  }
})

async function accept() {
  accepting.value = true
  acceptError.value = ''
  try {
    await organizersApi.accept(token.value)
    await router.replace('/admin?tab=organizers')
  } catch (e) {
    acceptError.value = e instanceof Error ? e.message : 'Could not accept the invite.'
  } finally {
    accepting.value = false
  }
}

function switchAccount() {
  auth.logout()
  void router.push({ path: '/login', query: { redirect: here.value } })
}
</script>

<template>
  <div class="join">
    <div class="join__in">
      <p v-if="!peek && !loadError" class="muted">Checking your invite…</p>
      <p v-else-if="loadError" class="err">{{ loadError }}</p>

      <template v-else-if="peek && peek.status !== 'pending'">
        <h1 class="join__title">{{ peek.status === 'expired' ? 'This invite has expired.' : 'This invite no longer works.' }}</h1>
        <p class="join__lede">
          {{
            peek.status === 'expired'
              ? 'Invite links work for 14 days. Ask the organizer who invited you to send a fresh one.'
              : 'It has already been used, was cancelled, or the link is incomplete. If you accepted it before, the admin panel is already yours.'
          }}
        </p>
        <div class="join__actions">
          <router-link class="btn" to="/admin">Open the admin panel</router-link>
        </div>
      </template>

      <template v-else-if="peek">
        <h1 class="join__title">Join the organizers.</h1>
        <p class="join__lede">
          {{ peek.invitedBy ?? 'A Pattern Language organizer' }} has invited you to the Pattern Language admin panel, where the
          organizers review Community Solution Sprint registrations, send the invites and reminders, and keep an eye on accounts.
        </p>
        <dl class="join__ledger">
          <div><dt>Invite sent to</dt><dd>{{ peek.email }}</dd></div>
          <div v-if="expires"><dt>Link works until</dt><dd>{{ expires }}</dd></div>
        </dl>

        <template v-if="!signedIn">
          <p class="join__step">Sign in to Pattern Language, or create an account. That account becomes your organizer account.</p>
          <div class="join__actions">
            <router-link class="btn" :to="{ path: '/login', query: { redirect: here } }">Sign in</router-link>
            <router-link class="btn-secondary" :to="{ path: '/signup', query: { redirect: here } }">Create an account</router-link>
          </div>
        </template>

        <template v-else-if="isDemo">
          <p class="join__step">You’re in a demo profile. Sign in with your own account to accept.</p>
          <div class="join__actions">
            <button class="btn" type="button" @click="switchAccount">Sign in with my account</button>
          </div>
        </template>

        <template v-else>
          <p class="join__step">
            You’re signed in as <strong>{{ userName }}</strong><span v-if="userEmail" class="muted"> ({{ userEmail }})</span>. Accepting makes this
            account an organizer.
          </p>
          <div class="join__actions">
            <button class="btn" type="button" :disabled="accepting" @click="accept">{{ accepting ? 'Accepting…' : 'Accept and open the panel' }}</button>
            <button class="btn-text" type="button" @click="switchAccount">Use a different account</button>
          </div>
          <p v-if="acceptError" class="err">{{ acceptError }}</p>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.join {
  min-height: 100vh;
  padding: 10rem var(--container-padding) 6rem;
}
.join__in {
  max-width: 40rem;
  margin: 0 auto;
}
.join__title {
  font-size: clamp(2.4rem, 1.6rem + 2.6vw, 3.8rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  line-height: 1.02;
  margin-bottom: 1.5rem;
}
.join__lede {
  font-size: 1.1rem;
  font-weight: var(--font-weight-light);
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.join__ledger {
  margin: 2.25rem 0 0;
  border-top: 1px solid var(--color-text-primary);
}
.join__ledger div {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--hairline);
}
.join__ledger dt {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-tertiary);
  padding-top: 0.2rem;
}
.join__ledger dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.join__step {
  margin-top: 2rem;
  line-height: 1.6;
}
.join__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin-top: 1.5rem;
}
.join__actions a {
  text-decoration: none;
}
.muted {
  color: var(--color-text-tertiary);
}
.err {
  margin-top: 1rem;
  color: var(--color-accent-warm);
}
@media (max-width: 640px) {
  .join {
    padding-top: 7rem;
  }
  .join__ledger div {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.2rem;
  }
}
</style>
