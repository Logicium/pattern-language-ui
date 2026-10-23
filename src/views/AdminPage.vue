<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import {
  adminApi,
  type AdminEvent,
  type AdminOverview,
  type AdminSignup,
  type AdminUser,
  type EventEmailKind
} from '@/services/api'

/**
 * Pattern Language admin: the numbers and lists organizers need in one
 * place (accounts, event registrations, the ideas board) and the event email
 * controls (preview, test, reminder). Organizers only; the backend decides.
 */
useHead({ title: 'Admin' })

type Tab = 'overview' | 'events' | 'people'
const route = useRoute()
const router = useRouter()
const tab = ref<Tab>((['overview', 'events', 'people'] as Tab[]).includes(route.query.tab as Tab) ? (route.query.tab as Tab) : 'overview')
watch(tab, (t) => router.replace({ query: { ...route.query, tab: t } }))

const access = ref<'checking' | 'ok' | 'denied'>('checking')
const me = ref<{ name: string; email: string } | null>(null)
const overview = ref<AdminOverview | null>(null)
const loadError = ref('')

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmtStamp = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

async function loadOverview() {
  overview.value = await adminApi.overview()
  if (!selectedSlug.value) {
    const withEmail = overview.value.events.find((e) => e.hasEmail)
    selectedSlug.value = (withEmail ?? overview.value.events[0])?.slug ?? null
  }
}

onMounted(async () => {
  try {
    me.value = await adminApi.me()
    access.value = 'ok'
  } catch {
    access.value = 'denied'
    return
  }
  try {
    await loadOverview()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Could not load the overview.'
  }
})

/* ---------------------------------------------------------------- tiles */

const tiles = computed(() => {
  const o = overview.value
  if (!o) return []
  const sprint = o.events.find((e) => e.hasEmail)
  return [
    { label: 'Members', value: o.users.real, note: `${o.users.real30d} new in 30 days` },
    { label: 'Demo profiles', value: o.users.demo, note: `${o.users.demo7d} this week` },
    { label: 'Playbooks', value: o.playbooks, note: 'by members' },
    { label: 'PAL conversations', value: o.chats, note: 'by members' },
    { label: 'Ideas on the board', value: o.ideas, note: 'from the sprint game' },
    ...(sprint ? [{ label: 'Sprint registrations', value: sprint.signups, note: sprint.dateLabel ?? '' }] : [])
  ]
})

/* ---------------------------------------------------------------- events */

const selectedSlug = ref<string | null>(null)
const selectedEvent = computed<AdminEvent | null>(() => overview.value?.events.find((e) => e.slug === selectedSlug.value) ?? null)
const signups = ref<AdminSignup[]>([])
const signupsLoading = ref(false)
const resending = ref<number | null>(null)
const rowNote = ref<Record<number, string>>({})

async function loadSignups() {
  if (!selectedSlug.value) return
  signupsLoading.value = true
  try {
    signups.value = await adminApi.signups(selectedSlug.value)
  } finally {
    signupsLoading.value = false
  }
}
watch([selectedSlug, tab], ([slug, t]) => {
  if (slug && t === 'events') void loadSignups()
})

async function resend(s: AdminSignup) {
  resending.value = s.id
  try {
    const r = await adminApi.resendConfirmation(s.id)
    rowNote.value[s.id] = r.ok ? 'Sent' : r.error ?? 'Failed'
    if (r.ok) {
      await loadSignups()
      await loadOverview()
    }
  } catch (e) {
    rowNote.value[s.id] = e instanceof Error ? e.message : 'Failed'
  } finally {
    resending.value = null
  }
}

function exportCsv() {
  const ev = selectedEvent.value
  if (!ev) return
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [
    ['Name', 'Email', 'Organization', 'Note', 'Registered', 'Confirmation sent', 'Reminder sent'],
    ...signups.value.map((s) => [s.name, s.email, s.organization, s.note, s.createdAt, s.confirmationSentAt, s.reminderSentAt])
  ]
  const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${ev.slug}-registrations.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ---------------------------------------------------------------- email */

const emailKind = ref<EventEmailKind>('reminder')
const note = ref('')
const onlyUnreminded = ref(true)
const preview = ref<{ subject: string; html: string } | null>(null)
const previewing = ref(false)
const testing = ref(false)
const sending = ref(false)
const confirmSend = ref(false)
const emailMsg = ref('')

const recipientCount = computed(() =>
  onlyUnreminded.value ? signups.value.filter((s) => !s.reminderSentAt).length : signups.value.length
)

/** Images in the email point at the live site; show this build's copies in the preview. */
const previewDoc = computed(() =>
  preview.value?.html.split('https://www.ruralpatternlanguage.com/brand/').join(`${window.location.origin}/brand/`) ?? ''
)

async function loadPreview() {
  if (!selectedSlug.value) return
  previewing.value = true
  emailMsg.value = ''
  try {
    const p = await adminApi.preview(selectedSlug.value, emailKind.value, note.value || undefined)
    preview.value = { subject: p.subject, html: p.html }
  } catch (e) {
    emailMsg.value = e instanceof Error ? e.message : 'Preview failed'
  } finally {
    previewing.value = false
  }
}
watch([emailKind, selectedSlug], () => {
  preview.value = null
  confirmSend.value = false
  if (tab.value === 'events' && selectedEvent.value?.hasEmail) void loadPreview()
})
watch(tab, (t) => {
  if (t === 'events' && selectedEvent.value?.hasEmail && !preview.value) void loadPreview()
})

let noteTimer = 0
watch(note, () => {
  confirmSend.value = false
  window.clearTimeout(noteTimer)
  noteTimer = window.setTimeout(() => void loadPreview(), 600)
})

async function sendTest() {
  if (!selectedSlug.value) return
  testing.value = true
  emailMsg.value = ''
  try {
    const r = await adminApi.sendTest(selectedSlug.value, emailKind.value, note.value || undefined)
    emailMsg.value = r.ok ? `Test sent to ${r.to}.` : `Test failed: ${r.error}`
  } catch (e) {
    emailMsg.value = e instanceof Error ? e.message : 'Test failed'
  } finally {
    testing.value = false
  }
}

async function sendReminders() {
  if (!selectedSlug.value) return
  if (!confirmSend.value) {
    confirmSend.value = true
    return
  }
  sending.value = true
  emailMsg.value = ''
  try {
    const r = await adminApi.sendReminders(selectedSlug.value, note.value || undefined, onlyUnreminded.value)
    const failed = r.failed.length ? ` ${r.failed.length} failed: ${r.failed.map((f) => f.email).join(', ')}.` : ''
    emailMsg.value = `Reminder sent to ${r.sent} ${r.sent === 1 ? 'person' : 'people'}.${r.skipped ? ` ${r.skipped} already had one.` : ''}${failed}`
    await loadSignups()
    await loadOverview()
  } catch (e) {
    emailMsg.value = e instanceof Error ? e.message : 'Sending failed'
  } finally {
    sending.value = false
    confirmSend.value = false
  }
}

/* ---------------------------------------------------------------- people */

const peopleKind = ref<'real' | 'demo' | 'all'>('real')
const peopleQuery = ref('')
const people = ref<AdminUser[]>([])
const peopleTotal = ref(0)
const peoplePage = ref(0)
const PAGE = 50
const peopleLoading = ref(false)

async function loadPeople() {
  peopleLoading.value = true
  try {
    const r = await adminApi.users({ q: peopleQuery.value.trim(), kind: peopleKind.value, limit: PAGE, offset: peoplePage.value * PAGE })
    people.value = r.users
    peopleTotal.value = r.total
  } finally {
    peopleLoading.value = false
  }
}
let peopleTimer = 0
watch([peopleKind, peopleQuery], () => {
  peoplePage.value = 0
  window.clearTimeout(peopleTimer)
  peopleTimer = window.setTimeout(() => void loadPeople(), 250)
})
watch(peoplePage, () => void loadPeople())
watch(tab, (t) => {
  if (t === 'people' && !people.value.length) void loadPeople()
}, { immediate: true })
</script>

<template>
  <div class="admin">
    <div class="admin__in">
      <header class="admin__head">
        <p class="chip">Organizers</p>
        <h1 class="admin__title">Admin</h1>
        <p v-if="me" class="admin__who">Signed in as {{ me.name }}</p>
      </header>

      <p v-if="access === 'checking'" class="muted">Checking access…</p>

      <div v-else-if="access === 'denied'" class="denied">
        <p class="denied__line">This page is for Pattern Language organizers.</p>
        <p class="muted">If you should have access, ask for your account to be added to the organizer list.</p>
      </div>

      <template v-else>
        <nav class="tabs" role="tablist">
          <button
            v-for="t in (['overview', 'events', 'people'] as const)"
            :key="t"
            class="tabs__tab"
            :class="{ 'is-on': tab === t }"
            role="tab"
            :aria-selected="tab === t"
            type="button"
            @click="tab = t"
          >
            {{ t === 'overview' ? 'Overview' : t === 'events' ? 'Events & email' : 'People' }}
          </button>
        </nav>

        <p v-if="loadError" class="err">{{ loadError }}</p>

        <!-- overview -->
        <div v-if="tab === 'overview'" class="admin-section">
          <div class="tiles">
            <div v-for="t in tiles" :key="t.label" class="tile">
              <span class="tile__label">{{ t.label }}</span>
              <span class="tile__value">{{ t.value.toLocaleString() }}</span>
              <span class="tile__note">{{ t.note }}</span>
            </div>
          </div>

          <h2 class="h2">Events</h2>
          <table class="grid">
            <thead>
              <tr><th>Event</th><th>Date</th><th class="num">Registered</th><th class="num">Confirmed</th><th class="num">Reminded</th><th /></tr>
            </thead>
            <tbody>
              <tr v-for="e in overview?.events ?? []" :key="e.slug">
                <td class="strong">{{ e.name }}</td>
                <td class="muted">{{ e.dateLabel ?? '—' }}</td>
                <td class="num">{{ e.signups }}</td>
                <td class="num">{{ e.hasEmail ? e.confirmed : '—' }}</td>
                <td class="num">{{ e.hasEmail ? e.reminded : '—' }}</td>
                <td class="act"><button class="btn-text" type="button" @click="selectedSlug = e.slug; tab = 'events'">Open</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- events & email -->
        <div v-else-if="tab === 'events'" class="admin-section">
          <div class="picker">
            <button
              v-for="e in overview?.events ?? []"
              :key="e.slug"
              class="picker__item"
              :class="{ 'is-on': e.slug === selectedSlug }"
              type="button"
              @click="selectedSlug = e.slug"
            >
              <span class="picker__name">{{ e.name }}</span>
              <span class="picker__meta">{{ e.dateLabel ?? 'No date' }} · {{ e.signups }} registered</span>
            </button>
          </div>

          <template v-if="selectedEvent">
            <div class="bar">
              <h2 class="h2">Registrations <span class="muted">{{ signups.length }}</span></h2>
              <button class="btn-secondary btn-sm" type="button" :disabled="!signups.length" @click="exportCsv">Export CSV</button>
            </div>
            <p v-if="signupsLoading" class="muted">Loading…</p>
            <p v-else-if="!signups.length" class="empty">No one has registered yet.</p>
            <div v-else class="scroll">
              <table class="grid">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Organization</th><th>Note</th><th>Registered</th>
                    <th v-if="selectedEvent.hasEmail">Confirmation</th><th v-if="selectedEvent.hasEmail">Reminder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in signups" :key="s.id">
                    <td class="strong">{{ s.name }}</td>
                    <td><a class="mail" :href="`mailto:${s.email}`">{{ s.email }}</a></td>
                    <td class="muted">{{ s.organization || '—' }}</td>
                    <td class="muted note-cell" :title="s.note ?? ''">{{ s.note || '—' }}</td>
                    <td class="muted nowrap">{{ fmtDate(s.createdAt) }}</td>
                    <td v-if="selectedEvent.hasEmail" class="nowrap">
                      <span v-if="s.confirmationSentAt" class="ok">Sent {{ fmtStamp(s.confirmationSentAt) }}</span>
                      <span v-else class="warn">Not sent</span>
                      <button class="btn-text btn-inline" type="button" :disabled="resending === s.id" @click="resend(s)">
                        {{ resending === s.id ? 'Sending…' : s.confirmationSentAt ? 'Resend' : 'Send' }}
                      </button>
                      <span v-if="rowNote[s.id]" class="muted small">{{ rowNote[s.id] }}</span>
                    </td>
                    <td v-if="selectedEvent.hasEmail" class="nowrap">
                      <span v-if="s.reminderSentAt" class="ok">Sent {{ fmtStamp(s.reminderSentAt) }}</span>
                      <span v-else class="muted">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- email -->
            <div v-if="selectedEvent.hasEmail" class="email">
              <div class="email__controls">
                <h2 class="h2">Email</h2>
                <p class="muted small">
                  Everyone who registers gets the confirmation automatically. Send the reminder yourself, a few days before.
                </p>
                <div class="seg" role="tablist">
                  <button class="seg__b" :class="{ 'is-on': emailKind === 'confirmation' }" type="button" @click="emailKind = 'confirmation'">Confirmation</button>
                  <button class="seg__b" :class="{ 'is-on': emailKind === 'reminder' }" type="button" @click="emailKind = 'reminder'">Reminder</button>
                </div>

                <template v-if="emailKind === 'reminder'">
                  <label class="lbl" for="admin-note">A note from the organizers <span class="muted">(optional)</span></label>
                  <textarea
                    id="admin-note"
                    v-model="note"
                    class="form-textarea"
                    rows="4"
                    maxlength="2000"
                    placeholder="Parking, what to bring, anything that changed…"
                  />
                  <label class="check">
                    <input v-model="onlyUnreminded" type="checkbox" />
                    Skip people who already had a reminder
                  </label>
                </template>

                <div class="email__actions">
                  <button class="btn-secondary btn-sm" type="button" :disabled="testing" @click="sendTest">
                    {{ testing ? 'Sending…' : 'Send me a test' }}
                  </button>
                  <button
                    v-if="emailKind === 'reminder'"
                    class="btn btn-sm"
                    :class="{ 'btn-confirm': confirmSend }"
                    type="button"
                    :disabled="sending || recipientCount === 0"
                    @click="sendReminders"
                  >
                    {{
                      sending
                        ? 'Sending…'
                        : confirmSend
                          ? `Confirm: send to ${recipientCount}`
                          : `Send reminder to ${recipientCount} ${recipientCount === 1 ? 'person' : 'people'}`
                    }}
                  </button>
                  <button v-if="confirmSend" class="btn-text" type="button" @click="confirmSend = false">Cancel</button>
                </div>
                <p v-if="emailMsg" class="email__msg" role="status">{{ emailMsg }}</p>
              </div>

              <div class="email__preview">
                <p class="email__subject"><span class="muted">Subject</span> {{ preview?.subject ?? '…' }}</p>
                <iframe v-if="preview" class="email__frame" title="Email preview" :srcdoc="previewDoc" sandbox="allow-same-origin" />
                <div v-else class="email__frame email__frame--empty">{{ previewing ? 'Rendering…' : '' }}</div>
              </div>
            </div>
            <p v-else class="muted small">No email is set up for this event.</p>
          </template>
        </div>

        <!-- people -->
        <div v-else class="admin-section">
          <div class="bar">
            <input v-model="peopleQuery" class="form-input search" type="search" placeholder="Search name, email or town…" />
            <div class="seg">
              <button class="seg__b" :class="{ 'is-on': peopleKind === 'real' }" type="button" @click="peopleKind = 'real'">Members</button>
              <button class="seg__b" :class="{ 'is-on': peopleKind === 'demo' }" type="button" @click="peopleKind = 'demo'">Demo</button>
              <button class="seg__b" :class="{ 'is-on': peopleKind === 'all' }" type="button" @click="peopleKind = 'all'">All</button>
            </div>
          </div>
          <p class="muted small">{{ peopleTotal.toLocaleString() }} {{ peopleTotal === 1 ? 'account' : 'accounts' }}</p>
          <div class="scroll">
            <table class="grid">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Town</th><th>Joined</th><th class="num">Playbooks</th><th class="num">Chats</th></tr>
              </thead>
              <tbody>
                <tr v-for="u in people" :key="u.id">
                  <td class="strong">{{ u.name }}<span v-if="u.isDemo" class="flag">demo</span></td>
                  <td><a class="mail" :href="`mailto:${u.email}`">{{ u.email }}</a></td>
                  <td class="muted">{{ u.location || '—' }}</td>
                  <td class="muted nowrap">{{ fmtDate(u.createdAt) }}</td>
                  <td class="num">{{ u.playbooks }}</td>
                  <td class="num">{{ u.chats }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="peopleLoading" class="muted small">Loading…</p>
          <div v-if="peopleTotal > PAGE" class="pager">
            <button class="btn-text" type="button" :disabled="peoplePage === 0" @click="peoplePage--">Previous</button>
            <span class="muted small">{{ peoplePage * PAGE + 1 }}–{{ Math.min(peopleTotal, (peoplePage + 1) * PAGE) }} of {{ peopleTotal }}</span>
            <button class="btn-text" type="button" :disabled="(peoplePage + 1) * PAGE >= peopleTotal" @click="peoplePage++">Next</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  padding: 8rem var(--container-padding) 5rem;
}
.admin__in {
  max-width: 1200px;
  margin: 0 auto;
}
.admin__head {
  margin-bottom: 2.5rem;
}
.chip {
  display: inline-block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-accent-warm);
  border: 1px solid rgba(212, 123, 95, 0.4);
  padding: 0.25rem 0.6rem;
  margin-bottom: 1.25rem;
}
.admin__title {
  font-size: clamp(2.4rem, 1.6rem + 2.4vw, 3.6rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  line-height: 1;
}
.admin__who {
  margin-top: 0.75rem;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}
.muted {
  color: var(--color-text-tertiary);
}
.small {
  font-size: 0.82rem;
}
.err {
  color: var(--color-accent-warm);
  margin-bottom: 1rem;
}
.denied {
  padding: 2rem 0;
  border-top: 1px solid var(--hairline-strong);
}
.denied__line {
  font-size: 1.4rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0.5rem;
}

/* tabs */
.tabs {
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid var(--hairline-strong);
  margin-bottom: 2.5rem;
  overflow-x: auto;
}
.tabs__tab {
  padding: 0 0 0.85rem;
  border: 0;
  border-bottom: 1.5px solid transparent;
  margin-bottom: -1px;
  background: none;
  font: inherit;
  font-size: 0.78rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.tabs__tab:hover {
  color: var(--color-text-primary);
}
.tabs__tab.is-on {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

.admin-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.h2 {
  font-size: 1.35rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.02em;
}

/* tiles: a plain number per measure, no chart */
.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  border-top: 1px solid var(--hairline-strong);
  border-left: 1px solid var(--hairline);
  margin-bottom: 2.5rem;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem 1.25rem 1.4rem;
  border-right: 1px solid var(--hairline);
  border-bottom: 1px solid var(--hairline);
}
.tile__label {
  font-size: 0.66rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}
.tile__value {
  font-size: 2.6rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.04em;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
}
.tile__note {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

/* tables */
.scroll {
  overflow-x: auto;
}
.grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.grid th {
  text-align: left;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  padding: 0 1rem 0.6rem 0;
  border-bottom: 1px solid var(--hairline-strong);
  white-space: nowrap;
}
.grid td {
  padding: 0.75rem 1rem 0.75rem 0;
  border-bottom: 1px solid var(--hairline);
  vertical-align: baseline;
}
.grid .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.grid .act {
  text-align: right;
}
.strong {
  font-weight: var(--font-weight-medium);
}
.nowrap {
  white-space: nowrap;
}
.note-cell {
  max-width: 18rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mail {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--hairline-strong);
}
.flag {
  margin-left: 0.5rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-tertiary);
  border: 1px solid currentColor;
  padding: 0.05rem 0.3rem;
}
.ok {
  color: var(--color-text-secondary);
}
.warn {
  color: var(--color-accent-warm);
}
.btn-inline {
  margin-left: 0.6rem;
  font-size: 0.8rem;
}
.empty {
  padding: 1.5rem 0;
  border-top: 1px solid var(--hairline);
  color: var(--color-text-secondary);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.search {
  max-width: 320px;
}

/* event picker */
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.picker__item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--hairline-strong);
  background: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.picker__item.is-on {
  border-color: var(--color-text-primary);
}
.picker__name {
  font-weight: var(--font-weight-medium);
}
.picker__meta {
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
}

/* segmented switch */
.seg {
  display: inline-flex;
  border: 1px solid var(--hairline-strong);
}
.seg__b {
  padding: 0.45rem 0.9rem;
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.seg__b + .seg__b {
  border-left: 1px solid var(--hairline-strong);
}
.seg__b.is-on {
  background: var(--color-text-primary);
  color: var(--color-bg-primary);
}

/* email */
.email {
  display: grid;
  grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
  gap: 2.5rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--hairline-strong);
}
.email__controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
}
.lbl {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
.email__controls .form-textarea {
  width: 100%;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
.email__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.btn-confirm {
  background: var(--color-accent-warm);
  border-color: var(--color-accent-warm);
}
.email__msg {
  font-size: 0.88rem;
  color: var(--color-text-primary);
}
.email__subject {
  font-size: 0.88rem;
  margin-bottom: 0.6rem;
}
.email__subject .muted {
  margin-right: 0.5rem;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.email__frame {
  width: 100%;
  height: 78vh;
  border: 1px solid var(--hairline-strong);
  background: #efe9df;
}
.email__frame--empty {
  display: grid;
  place-items: center;
  color: var(--color-text-tertiary);
  font-size: 0.85rem;
}
.pager {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

@media (max-width: 900px) {
  .email {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 640px) {
  .admin {
    padding-top: 6.5rem;
  }
  .tile__value {
    font-size: 2.1rem;
  }
}
</style>
