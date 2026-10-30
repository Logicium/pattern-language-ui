<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import {
  adminApi,
  type AdminEvent,
  type AdminOrganizer,
  type AdminOverview,
  type AdminSignup,
  type AdminUser,
  type EventEmailKind
} from '@/services/api'

/**
 * Pattern Language admin: the numbers and lists organizers need in one
 * place (accounts, event registrations, the ideas board) and the event email
 * controls (preview, test, reminder), and the organizers themselves, invited
 * by email. Organizers only; the backend decides.
 */
useHead({ title: 'Admin' })

type Tab = 'overview' | 'events' | 'people' | 'organizers'
// [tab, label, shorter label for phones]
const TABS: Array<[Tab, string, string]> = [
  ['overview', 'Overview', 'Overview'],
  ['events', 'Events & email', 'Events'],
  ['people', 'People', 'People'],
  ['organizers', 'Organizers', 'Organizers']
]
const route = useRoute()
const router = useRouter()
const tab = ref<Tab>(TABS.some(([t]) => t === route.query.tab) ? (route.query.tab as Tab) : 'overview')
watch(tab, (t) => router.replace({ query: { ...route.query, tab: t } }))

const access = ref<'checking' | 'ok' | 'denied'>('checking')
const me = ref<{ id: number; name: string; email: string } | null>(null)
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
    ...(sprint
      ? [
          { label: 'Sprint registrations', value: sprint.signups, note: `${sprint.approved} approved · ${sprint.declined} declined` },
          { label: 'Awaiting review', value: sprint.pending, note: sprint.dateLabel ?? '' }
        ]
      : [])
  ]
})

/* ---------------------------------------------------------------- events */

const selectedSlug = ref<string | null>(null)
const selectedEvent = computed<AdminEvent | null>(() => overview.value?.events.find((e) => e.slug === selectedSlug.value) ?? null)
const signups = ref<AdminSignup[]>([])
const signupsLoading = ref(false)
const busyRow = ref<number | null>(null)
const rowNote = ref<Record<number, string>>({})
type Show = 'pending' | 'approved' | 'declined' | 'all'
const show = ref<Show>('pending')
const counts = computed(() => ({
  pending: signups.value.filter((s) => s.status === 'pending').length,
  approved: signups.value.filter((s) => s.status === 'approved').length,
  declined: signups.value.filter((s) => s.status === 'declined').length,
  all: signups.value.length
}))
const shown = computed(() => (show.value === 'all' ? signups.value : signups.value.filter((s) => s.status === show.value)))

async function loadSignups() {
  if (!selectedSlug.value) return
  signupsLoading.value = true
  try {
    signups.value = await adminApi.signups(selectedSlug.value)
    if (show.value === 'pending' && !counts.value.pending) show.value = 'all'
  } finally {
    signupsLoading.value = false
  }
}
watch([selectedSlug, tab], ([slug, t]) => {
  if (slug && t === 'events') void loadSignups()
})

/** Approve (sends the invite), decline, reopen, or re-send, then refresh. */
async function review(sg: AdminSignup, action: 'approve' | 'decline' | 'reopen' | 'resend') {
  busyRow.value = sg.id
  delete rowNote.value[sg.id]
  try {
    const r = await adminApi[action](sg.id)
    if (!r.ok) rowNote.value[sg.id] = r.error ?? 'Failed'
    else if (action === 'approve') rowNote.value[sg.id] = 'Approved; invite sent'
    else if (action === 'resend') rowNote.value[sg.id] = 'Sent again'
    await loadSignups()
    await loadOverview()
  } catch (e) {
    rowNote.value[sg.id] = e instanceof Error ? e.message : 'Failed'
  } finally {
    busyRow.value = null
  }
}

function exportCsv() {
  const ev = selectedEvent.value
  if (!ev) return
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [
    ['Name', 'Email', 'Organization', 'Why interested', 'Registered', 'Status', 'Reviewed', 'Invite sent', 'Reminder sent'],
    ...signups.value.map((s) => [s.name, s.email, s.organization, s.note, s.createdAt, s.status, s.reviewedAt, s.inviteSentAt, s.reminderSentAt])
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

// reminders go to approved people only
const recipientCount = computed(() => {
  const approved = signups.value.filter((s) => s.status === 'approved')
  return onlyUnreminded.value ? approved.filter((s) => !s.reminderSentAt).length : approved.length
})
// approved without an invite: registrations that were approved outside the panel
// (the workshop's RSVPs, now under the sprint)
const uninvitedCount = computed(() => signups.value.filter((s) => s.status === 'approved' && !s.inviteSentAt).length)
const confirmInvites = ref(false)
const invitingAll = ref(false)

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
  confirmInvites.value = false
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

async function sendInvites() {
  if (!selectedSlug.value) return
  if (!confirmInvites.value) {
    confirmInvites.value = true
    return
  }
  invitingAll.value = true
  emailMsg.value = ''
  try {
    const r = await adminApi.sendInvites(selectedSlug.value)
    const failed = r.failed.length ? ` ${r.failed.length} failed: ${r.failed.map((f) => f.email).join(', ')}.` : ''
    emailMsg.value = `Invite sent to ${r.sent} ${r.sent === 1 ? 'person' : 'people'}.${r.skipped ? ` ${r.skipped} already had one.` : ''}${failed}`
    await loadSignups()
    await loadOverview()
  } catch (e) {
    emailMsg.value = e instanceof Error ? e.message : 'Sending failed'
  } finally {
    invitingAll.value = false
    confirmInvites.value = false
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
/* ---------------------------------------------------------------- organizers */

const organizers = ref<AdminOrganizer[]>([])
const orgLoading = ref(false)
const orgError = ref('')
const orgBusy = ref<number | null>(null)
const orgRowNote = ref<Record<number, string>>({})
const confirmRevoke = ref<number | null>(null)
const organizerCount = computed(() => organizers.value.filter((o) => o.status === 'owner' || o.status === 'active').length)

const inviteForm = ref({ email: '', name: '', note: '' })
const inviting = ref(false)
const inviteMsg = ref('')
const invitePreview = ref<{ subject: string; html: string } | null>(null)
const invitePreviewDoc = computed(() =>
  invitePreview.value?.html.split('https://www.ruralpatternlanguage.com/brand/').join(`${window.location.origin}/brand/`) ?? ''
)
const inviteEmailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.value.email.trim()))

const ORG_STATUS: Record<AdminOrganizer['status'], string> = {
  owner: 'Owner',
  active: 'Organizer',
  pending: 'Invited',
  expired: 'Link expired'
}

async function loadOrganizers() {
  orgLoading.value = true
  orgError.value = ''
  try {
    organizers.value = await adminApi.organizers()
  } catch (e) {
    orgError.value = e instanceof Error ? e.message : 'Could not load the organizers.'
  } finally {
    orgLoading.value = false
  }
}

async function loadInvitePreview() {
  try {
    invitePreview.value = await adminApi.previewOrganizerInvite({
      name: inviteForm.value.name.trim() || undefined,
      note: inviteForm.value.note.trim() || undefined
    })
  } catch {
    // the preview is a convenience; the form works without it
  }
}
let inviteTimer = 0
watch(
  () => [inviteForm.value.name, inviteForm.value.note],
  () => {
    window.clearTimeout(inviteTimer)
    inviteTimer = window.setTimeout(() => void loadInvitePreview(), 600)
  }
)

async function sendInvite() {
  if (!inviteEmailOk.value || inviting.value) return
  inviting.value = true
  inviteMsg.value = ''
  const email = inviteForm.value.email.trim()
  try {
    const r = await adminApi.inviteOrganizer({
      email,
      name: inviteForm.value.name.trim() || undefined,
      note: inviteForm.value.note.trim() || undefined
    })
    inviteMsg.value = r.emailed
      ? `Invite sent to ${email}. The link works once, for 14 days.`
      : `The invite is saved, but the email didn’t go out (${r.error ?? 'unknown error'}). Use “Send again” above.`
    if (r.emailed) inviteForm.value = { email: '', name: '', note: '' }
    await loadOrganizers()
  } catch (e) {
    inviteMsg.value = e instanceof Error ? e.message : 'The invite failed.'
  } finally {
    inviting.value = false
  }
}

async function resendOrganizer(o: AdminOrganizer) {
  if (o.id === null) return
  const id = o.id
  orgBusy.value = id
  orgRowNote.value[id] = ''
  try {
    const r = await adminApi.resendOrganizerInvite(id)
    orgRowNote.value[id] = r.emailed ? 'A fresh link is on its way; the old one no longer works.' : `Email failed: ${r.error ?? 'unknown error'}`
    await loadOrganizers()
  } catch (e) {
    orgRowNote.value[id] = e instanceof Error ? e.message : 'Failed'
  } finally {
    orgBusy.value = null
  }
}

async function revokeOrganizer(o: AdminOrganizer) {
  if (o.id === null) return
  const id = o.id
  if (confirmRevoke.value !== id) {
    confirmRevoke.value = id
    return
  }
  orgBusy.value = id
  try {
    await adminApi.revokeOrganizer(id)
    confirmRevoke.value = null
    await loadOrganizers()
  } catch (e) {
    orgRowNote.value[id] = e instanceof Error ? e.message : 'Failed'
  } finally {
    orgBusy.value = null
  }
}

watch(tab, (t) => {
  if (t !== 'organizers') return
  if (!organizers.value.length) void loadOrganizers()
  if (!invitePreview.value) void loadInvitePreview()
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
        <p class="muted">If you should have access, ask an organizer to invite you from the Organizers tab.</p>
      </div>

      <template v-else>
        <nav class="tabs" role="tablist">
          <button
            v-for="[t, label, short] in TABS"
            :key="t"
            class="tabs__tab"
            :class="{ 'is-on': tab === t }"
            role="tab"
            :aria-selected="tab === t"
            type="button"
            @click="tab = t"
          >
            <span class="tabs__long">{{ label }}</span><span class="tabs__short">{{ short }}</span>
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
              <tr><th>Event</th><th>Date</th><th class="num">Registered</th><th class="num">To review</th><th class="num">Approved</th><th class="num">Reminded</th><th /></tr>
            </thead>
            <tbody>
              <tr v-for="e in overview?.events ?? []" :key="e.slug">
                <td class="strong">{{ e.name }}</td>
                <td class="muted">{{ e.dateLabel ?? '—' }}</td>
                <td class="num">{{ e.signups }}</td>
                <td class="num">{{ e.pending }}</td>
                <td class="num">{{ e.approved }}</td>
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
              <div class="bar__right">
                <div class="seg" role="tablist">
                  <button
                    v-for="k in (['pending', 'approved', 'declined', 'all'] as const)"
                    :key="k"
                    class="seg__b"
                    :class="{ 'is-on': show === k }"
                    type="button"
                    @click="show = k"
                  >
                    {{ k === 'pending' ? 'To review' : k === 'approved' ? 'Approved' : k === 'declined' ? 'Declined' : 'All' }}
                    <span class="seg__n">{{ counts[k] }}</span>
                  </button>
                </div>
                <button class="btn-secondary btn-sm" type="button" :disabled="!signups.length" @click="exportCsv">Export CSV</button>
              </div>
            </div>
            <p v-if="signupsLoading && !signups.length" class="muted">Loading…</p>
            <p v-else-if="!signups.length" class="empty">No one has registered yet.</p>
            <p v-else-if="!shown.length" class="empty">Nothing here.</p>
            <ol v-else class="queue">
              <li v-for="sg in shown" :key="sg.id" class="req" :class="`req--${sg.status}`">
                <div class="req__who">
                  <span class="req__name">{{ sg.name }}</span>
                  <a class="mail" :href="`mailto:${sg.email}`">{{ sg.email }}</a>
                  <span v-if="sg.organization" class="muted small">{{ sg.organization }}</span>
                  <span class="muted small">Registered {{ fmtStamp(sg.createdAt) }}</span>
                </div>
                <p class="req__why">
                  <span class="req__label">Why they’re interested</span>
                  {{ sg.note || '—' }}
                </p>
                <div class="req__state">
                  <span class="status" :class="`status--${sg.status}`">{{ sg.status === 'pending' ? 'To review' : sg.status === 'approved' ? 'Approved' : 'Declined' }}</span>
                  <template v-if="selectedEvent.hasEmail">
                    <span v-if="sg.status === 'approved'" class="muted small">{{ sg.inviteSentAt ? `Invite sent ${fmtStamp(sg.inviteSentAt)}` : 'Invite not sent' }}</span>
                    <span v-else-if="sg.status === 'pending'" class="muted small">{{ sg.receivedSentAt ? 'Got the “received” email' : 'No email yet' }}</span>
                    <span v-if="sg.reminderSentAt" class="muted small">Reminded {{ fmtStamp(sg.reminderSentAt) }}</span>
                  </template>
                  <div class="req__actions">
                    <template v-if="sg.status === 'pending'">
                      <button class="btn btn-sm" type="button" :disabled="busyRow === sg.id" @click="review(sg, 'approve')">
                        {{ busyRow === sg.id ? 'Sending…' : selectedEvent.hasEmail ? 'Approve and invite' : 'Approve' }}
                      </button>
                      <button class="btn-text" type="button" :disabled="busyRow === sg.id" @click="review(sg, 'decline')">Decline</button>
                    </template>
                    <template v-else-if="sg.status === 'approved'">
                      <button v-if="selectedEvent.hasEmail" class="btn-text" type="button" :disabled="busyRow === sg.id" @click="review(sg, 'resend')">
                        {{ busyRow === sg.id ? 'Sending…' : 'Resend invite' }}
                      </button>
                      <button class="btn-text" type="button" :disabled="busyRow === sg.id" @click="review(sg, 'reopen')">Undo</button>
                    </template>
                    <button v-else class="btn-text" type="button" :disabled="busyRow === sg.id" @click="review(sg, 'reopen')">Reopen</button>
                  </div>
                  <span v-if="rowNote[sg.id]" class="small req__note">{{ rowNote[sg.id] }}</span>
                </div>
              </li>
            </ol>

            <!-- email -->
            <div v-if="selectedEvent.hasEmail" class="email">
              <div class="email__controls">
                <h2 class="h2">Email</h2>
                <p class="muted small">
                  Everyone who registers gets the “received” note automatically. Approving someone sends their invite. Send the reminder yourself, a few days before; it goes to approved people only.
                </p>
                <p v-if="uninvitedCount" class="muted small">
                  {{ uninvitedCount }} approved {{ uninvitedCount === 1 ? 'person has' : 'people have' }} not had the invite, such as the workshop RSVPs that moved here. The Invite tab can send it to all of them.
                </p>
                <div class="seg" role="tablist">
                  <button class="seg__b" :class="{ 'is-on': emailKind === 'received' }" type="button" @click="emailKind = 'received'">Received</button>
                  <button class="seg__b" :class="{ 'is-on': emailKind === 'invite' }" type="button" @click="emailKind = 'invite'">Invite</button>
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
                  <button
                    v-if="emailKind === 'invite'"
                    class="btn btn-sm"
                    :class="{ 'btn-confirm': confirmInvites }"
                    type="button"
                    :disabled="invitingAll || uninvitedCount === 0"
                    @click="sendInvites"
                  >
                    {{
                      invitingAll
                        ? 'Sending…'
                        : confirmInvites
                          ? `Confirm: send to ${uninvitedCount}`
                          : `Send invite to ${uninvitedCount} ${uninvitedCount === 1 ? 'person' : 'people'} without one`
                    }}
                  </button>
                  <button v-if="confirmInvites" class="btn-text" type="button" @click="confirmInvites = false">Cancel</button>
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

        <!-- organizers -->
        <div v-else-if="tab === 'organizers'" class="admin-section">
          <h2 class="h2">Organizers <span class="muted">{{ organizerCount }}</span></h2>
          <p v-if="orgError" class="err">{{ orgError }}</p>
          <p v-if="orgLoading && !organizers.length" class="muted">Loading…</p>
          <ol v-else class="queue">
            <li v-for="o in organizers" :key="o.id ?? `owner-${o.account?.id}`" class="req" :class="`org--${o.status}`">
              <div class="req__who">
                <span v-if="o.account?.name || o.name" class="req__name">{{ o.account?.name || o.name }}</span>
                <a class="mail" :href="`mailto:${o.account?.email ?? o.email}`">{{ o.account?.email ?? o.email }}</a>
                <span v-if="o.account && o.account.email.toLowerCase() !== o.email.toLowerCase()" class="muted small">Invited at {{ o.email }}</span>
              </div>
              <p class="org__when muted small">
                <template v-if="o.status === 'owner'">Owner. Set in the service’s code, so it can’t be removed here.</template>
                <template v-else-if="o.status === 'active'">
                  Joined {{ fmtStamp(o.acceptedAt) }}<template v-if="o.invitedBy">, invited by {{ o.invitedBy }}</template>.
                </template>
                <template v-else>
                  {{ o.inviteSentAt ? `Invite sent ${fmtStamp(o.inviteSentAt)}` : 'Invite not sent yet' }}<template v-if="o.invitedBy"> by {{ o.invitedBy }}</template>.
                  {{ o.status === 'expired' ? 'The link has expired.' : `The link works until ${fmtDate(o.expiresAt)}.` }}
                </template>
              </p>
              <div class="req__state">
                <span class="status" :class="`status--${o.status}`">{{ ORG_STATUS[o.status] }}</span>
                <span v-if="o.account && o.account.id === me?.id" class="muted small">You</span>
                <div v-else-if="o.id !== null" class="req__actions">
                  <button
                    v-if="o.status === 'pending' || o.status === 'expired'"
                    class="btn-text"
                    type="button"
                    :disabled="orgBusy === o.id"
                    @click="resendOrganizer(o)"
                  >
                    {{ orgBusy === o.id ? 'Sending…' : 'Send again' }}
                  </button>
                  <button
                    class="btn-text"
                    :class="{ 'btn-text--warn': confirmRevoke === o.id }"
                    type="button"
                    :disabled="orgBusy === o.id"
                    @click="revokeOrganizer(o)"
                  >
                    {{
                      confirmRevoke === o.id
                        ? o.status === 'active' ? 'Confirm: remove' : 'Confirm: cancel invite'
                        : o.status === 'active' ? 'Remove' : 'Cancel invite'
                    }}
                  </button>
                  <button v-if="confirmRevoke === o.id" class="btn-text" type="button" @click="confirmRevoke = null">Keep</button>
                </div>
                <span v-if="o.id !== null && orgRowNote[o.id]" class="small req__note">{{ orgRowNote[o.id] }}</span>
              </div>
            </li>
          </ol>

          <div class="email">
            <form class="email__controls" @submit.prevent="sendInvite">
              <h2 class="h2">Invite an organizer</h2>
              <p class="muted small">
                They get an email with a link that works once, for 14 days. When they open it they sign in or create an account, and that account joins the organizers with the same access you have.
              </p>
              <label class="lbl" for="org-email">Email</label>
              <input id="org-email" v-model="inviteForm.email" class="form-input" type="email" autocomplete="off" required maxlength="255" placeholder="name@example.com" />
              <label class="lbl" for="org-name">Name <span class="muted">(optional)</span></label>
              <input id="org-name" v-model="inviteForm.name" class="form-input" type="text" autocomplete="off" maxlength="120" placeholder="For the greeting" />
              <label class="lbl" for="org-note">A note <span class="muted">(optional)</span></label>
              <textarea id="org-note" v-model="inviteForm.note" class="form-textarea" rows="4" maxlength="2000" placeholder="Why you’d like their help…" />
              <div class="email__actions">
                <button class="btn btn-sm" type="submit" :disabled="!inviteEmailOk || inviting">
                  {{ inviting ? 'Sending…' : 'Send invite' }}
                </button>
              </div>
              <p v-if="inviteMsg" class="email__msg" role="status">{{ inviteMsg }}</p>
            </form>

            <div class="email__preview">
              <p class="email__subject"><span class="muted">Subject</span> {{ invitePreview?.subject ?? '…' }}</p>
              <iframe v-if="invitePreview" class="email__frame" title="Invite preview" :srcdoc="invitePreviewDoc" sandbox="allow-same-origin" />
              <div v-else class="email__frame email__frame--empty" />
            </div>
          </div>
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

/* the review queue */
.bar__right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.seg__b {
  white-space: nowrap;
}
.bar__right .seg {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.seg__n {
  margin-left: 0.35rem;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
.queue {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hairline-strong);
}
.req {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) minmax(0, 2fr) minmax(13rem, 1fr);
  gap: 1rem 2rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--hairline);
}
.req__who {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  overflow-wrap: anywhere;
}
.req__name {
  font-weight: var(--font-weight-medium);
}
.req__why {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--color-text-primary);
  white-space: pre-line;
}
.req__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-text-tertiary);
}
.req__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}
.req__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  margin-top: 0.35rem;
}
.req__note {
  color: var(--color-accent-warm);
}
.req--declined .req__who,
.req--declined .req__why {
  opacity: 0.55;
}
.status {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding: 0.15rem 0.45rem;
  border: 1px solid currentColor;
}
.status--pending {
  color: var(--color-accent-warm);
}
.status--approved {
  color: var(--color-text-primary);
}
.status--declined {
  color: var(--color-text-tertiary);
}
@media (max-width: 900px) {
  .req {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }
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
/* organizers */
.org__when {
  margin: 0;
  line-height: 1.55;
}
.org--expired .req__who {
  opacity: 0.6;
}
.status--owner,
.status--active {
  color: var(--color-text-primary);
}
.status--expired {
  color: var(--color-text-tertiary);
}
.btn-text--warn {
  color: var(--color-accent-warm);
}
.email__controls .form-input {
  width: 100%;
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
.tabs__short {
  display: none;
}
@media (max-width: 640px) {
  .admin {
    padding-top: 6.5rem;
  }
  .tabs {
    gap: 1.1rem;
  }
  .tabs__tab {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
  }
  .tabs__long {
    display: none;
  }
  .tabs__short {
    display: inline;
  }
  .tile__value {
    font-size: 2.1rem;
  }
}
</style>
