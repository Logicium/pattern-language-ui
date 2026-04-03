<template>
  <div class="calendar-tab">
    <!-- Upcoming Event Banner -->
    <div v-if="upcomingEvent" class="upcoming-event-banner">
      <div class="upcoming-header">
        <span class="text-xs text-tertiary label-uppercase">Next Meetup</span>
        <span v-if="isEventLive" class="live-badge text-xs">Live Now</span>
      </div>
      <h3 class="upcoming-title">{{ upcomingEvent.title }}</h3>
      <div class="upcoming-meta">
        <span class="text-sm text-secondary">
          {{ formatEventTime(upcomingEvent.startTime) }} – {{ formatTimeOnly(upcomingEvent.endTime) }}
        </span>
        <span v-if="upcomingEvent.isRecurring" class="text-xs text-tertiary recurring-badge">
          ↻ Recurring
        </span>
      </div>
      <p v-if="upcomingEvent.description" class="text-sm text-secondary upcoming-desc">
        {{ upcomingEvent.description }}
      </p>
      <div class="upcoming-actions">
        <a
          v-if="upcomingEvent.meetLink"
          :href="upcomingEvent.meetLink"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-join"
        >
          Join Call
        </a>
        <button
          class="btn-text text-xs"
          @click="openEditModal(upcomingEvent)"
        >
          Edit Event
        </button>
      </div>
    </div>

    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-header-left">
        <span class="text-xs text-tertiary label-uppercase">Calendar</span>
        <span v-if="events.length" class="text-xs text-tertiary">{{ events.length }} event{{ events.length !== 1 ? 's' : '' }}</span>
      </div>
      <button
        v-if="isUserMember"
        class="btn text-xs"
        @click="openCreateModal()"
      >
        + New Meetup
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loadingEvents" class="calendar-loading">
      <span class="text-xs text-tertiary">Loading calendar...</span>
    </div>

    <!-- Calendar View -->
    <div v-else class="calendar-wrapper">
      <FullCalendar
        ref="calendarRef"
        :options="calendarOptions"
      />
    </div>

    <!-- Create Event Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3 class="modal-title">New Meetup</h3>
          <button class="modal-close" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label text-xs">Title</label>
            <input
              v-model="newEvent.title"
              type="text"
              class="form-input"
              placeholder="e.g., Weekly Check-in"
            />
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Description</label>
            <textarea
              v-model="newEvent.description"
              class="form-input form-textarea"
              placeholder="What's the meetup about?"
              rows="3"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label text-xs">Start</label>
              <input
                v-model="newEvent.startTime"
                type="datetime-local"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label text-xs">End</label>
              <input
                v-model="newEvent.endTime"
                type="datetime-local"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Repeat</label>
            <select
              v-model="selectedRecurrence"
              class="form-input"
              @change="onRecurrenceChange"
            >
              <option v-for="opt in recurrenceOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-text text-xs" @click="showCreateModal = false">Cancel</button>
          <button
            class="btn text-xs"
            :disabled="!newEvent.title || !newEvent.startTime || !newEvent.endTime"
            @click="createEvent"
          >
            Create Meetup
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Event Modal -->
    <div v-if="showEditModal && editingEvent" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3 class="modal-title">Edit Meetup</h3>
          <button class="modal-close" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label text-xs">Title</label>
            <input
              v-model="editingEvent.title"
              type="text"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Description</label>
            <textarea
              v-model="editingEvent.description"
              class="form-input form-textarea"
              rows="3"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label text-xs">Start</label>
              <input
                v-model="editStartTime"
                type="datetime-local"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label text-xs">End</label>
              <input
                v-model="editEndTime"
                type="datetime-local"
                class="form-input"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label text-xs">Repeat</label>
            <select
              v-model="editRecurrence"
              class="form-input"
              @change="onEditRecurrenceChange"
            >
              <option v-for="opt in recurrenceOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div v-if="editingEvent.meetLink" class="form-group">
            <label class="form-label text-xs">Video Call</label>
            <a :href="editingEvent.meetLink" target="_blank" rel="noopener noreferrer" class="meet-link text-sm">
              {{ editingEvent.meetLink }}
            </a>
          </div>
        </div>
        <div class="modal-footer modal-footer-between">
          <button class="btn-text btn-danger text-xs" @click="onDeleteEvent">Delete</button>
          <div class="modal-footer-right">
            <button class="btn-text text-xs" @click="showEditModal = false">Cancel</button>
            <button
              class="btn text-xs"
              :disabled="!editingEvent.title"
              @click="onSaveEdit"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { usePlaybookCalendar } from '@/composables/usePlaybookCalendar'
import type { CalendarEvent } from '@/types/collaboration'

const props = defineProps<{
  playbook: any
  isUserMember: boolean
}>()

const calendarRef = ref()

const {
  events,
  loadingEvents,
  showCreateModal,
  showEditModal,
  editingEvent,
  newEvent,
  recurrenceOptions,
  upcomingEvent,
  isEventLive,
  calendarEvents,
  openCreateModal,
  createEvent,
  openEditModal,
  updateEvent,
  deleteEvent,
  formatEventTime,
  formatTimeOnly,
} = usePlaybookCalendar(computed(() => props.playbook))

const selectedRecurrence = ref('')
const editRecurrence = ref('')

function onRecurrenceChange() {
  newEvent.value.isRecurring = selectedRecurrence.value !== ''
  newEvent.value.recurrenceRule = selectedRecurrence.value
}

function onEditRecurrenceChange() {
  if (editingEvent.value) {
    editingEvent.value.isRecurring = editRecurrence.value !== ''
    editingEvent.value.recurrenceRule = editRecurrence.value
  }
}

const editStartTime = computed({
  get: () => {
    if (!editingEvent.value) return ''
    return toLocalInput(editingEvent.value.startTime)
  },
  set: (val: string) => {
    if (editingEvent.value) editingEvent.value.startTime = val
  },
})

const editEndTime = computed({
  get: () => {
    if (!editingEvent.value) return ''
    return toLocalInput(editingEvent.value.endTime)
  },
  set: (val: string) => {
    if (editingEvent.value) editingEvent.value.endTime = val
  },
})

function toLocalInput(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function onSaveEdit() {
  updateEvent()
}

function onDeleteEvent() {
  if (editingEvent.value) {
    deleteEvent(editingEvent.value.id)
  }
}

function handleEventClick(info: any) {
  const calEvent = info.event.extendedProps?.calendarEvent as CalendarEvent
  if (calEvent) {
    editRecurrence.value = calEvent.recurrenceRule || ''
    openEditModal(calEvent)
  }
}

function handleDateClick(info: any) {
  if (!props.isUserMember) return
  const clickedDate = info.dateStr
  openCreateModal(clickedDate.includes('T') ? clickedDate.slice(0, 16) : `${clickedDate}T09:00`)
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek',
  },
  events: calendarEvents.value,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  editable: false,
  selectable: false,
  dayMaxEvents: 3,
  height: 'auto',
  eventDisplay: 'block',
  eventColor: '#2a2a2a',
  eventTextColor: '#fdfbf7',
  eventBorderColor: 'transparent',
  nowIndicator: true,
  firstDay: 0,
}))
</script>

<style scoped>
.calendar-tab {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ===== Upcoming Event Banner ===== */
.upcoming-event-banner {
  background: var(--color-bg-primary);
  padding: 2.5rem 3rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
}

.upcoming-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.label-uppercase {
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  background: #2a2a2a;
  color: #fdfbf7;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
}

.live-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #b8d4c8;
  border-radius: 50%;
  animation: pulse-live 1.5s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.upcoming-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  margin: 0 0 0.5rem;
  letter-spacing: 0.01em;
}

.upcoming-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.recurring-badge {
  letter-spacing: 0.05em;
}

.upcoming-desc {
  margin: 0.75rem 0 0;
  max-width: 600px;
  line-height: 1.6;
}

.upcoming-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 2rem;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);
  font-family: var(--font-family);
}

.btn-join:hover {
  opacity: 0.85;
}

/* ===== Calendar Header ===== */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
}

.calendar-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ===== Calendar Loading ===== */
.calendar-loading {
  text-align: center;
  padding: 4rem 0;
}

/* ===== Calendar Wrapper ===== */
.calendar-wrapper {
  background: var(--color-bg-primary);
  padding: 2rem 3rem 3rem;
}

/* FullCalendar Theme Override */
.calendar-wrapper :deep(.fc) {
  font-family: var(--font-family);
}

.calendar-wrapper :deep(.fc-toolbar-title) {
  font-size: 1.1rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.02em;
  color: var(--color-text-primary);
}

.calendar-wrapper :deep(.fc-button) {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  border-radius: 0;
  font-family: var(--font-family);
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.4rem 0.8rem;
  box-shadow: none;
  transition: all var(--transition-fast);
}

.calendar-wrapper :deep(.fc-button:hover) {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-color: rgba(42, 42, 42, 0.2);
}

.calendar-wrapper :deep(.fc-button-active),
.calendar-wrapper :deep(.fc-button:active) {
  background: var(--color-bg-dark) !important;
  color: var(--color-bg-primary) !important;
  border-color: var(--color-bg-dark) !important;
  box-shadow: none !important;
}

.calendar-wrapper :deep(.fc-button:focus) {
  box-shadow: none !important;
}

.calendar-wrapper :deep(.fc-daygrid-day) {
  border-color: rgba(42, 42, 42, 0.06);
}

.calendar-wrapper :deep(.fc-col-header-cell) {
  background: var(--color-bg-secondary);
  border-color: rgba(42, 42, 42, 0.06);
  padding: 0.75rem 0;
}

.calendar-wrapper :deep(.fc-col-header-cell-cushion) {
  font-size: 0.7rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  text-decoration: none;
}

.calendar-wrapper :deep(.fc-daygrid-day-number) {
  font-size: 0.8rem;
  font-weight: var(--font-weight-light);
  color: var(--color-text-secondary);
  padding: 0.5rem 0.65rem;
  text-decoration: none;
}

.calendar-wrapper :deep(.fc-day-today) {
  background: rgba(232, 180, 160, 0.06) !important;
}

.calendar-wrapper :deep(.fc-day-today .fc-daygrid-day-number) {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.calendar-wrapper :deep(.fc-event) {
  border-radius: 0;
  border: none;
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.calendar-wrapper :deep(.fc-event:hover) {
  opacity: 0.8;
}

.calendar-wrapper :deep(.fc-timegrid-slot) {
  border-color: rgba(42, 42, 42, 0.04);
  height: 3rem;
}

.calendar-wrapper :deep(.fc-timegrid-slot-label-cushion) {
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-light);
}

.calendar-wrapper :deep(.fc-scrollgrid) {
  border-color: rgba(42, 42, 42, 0.08);
}

.calendar-wrapper :deep(.fc-more-link) {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.calendar-wrapper :deep(.fc-now-indicator-line) {
  border-color: var(--color-accent-warm);
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 42, 42, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.modal-panel {
  background: var(--color-bg-primary);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1rem;
}

.modal-title {
  font-size: 1rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.02em;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: 1rem 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  color: var(--color-text-tertiary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(42, 42, 42, 0.12);
  border-radius: 0;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-text-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.meet-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  border-bottom: 1px solid rgba(42, 42, 42, 0.12);
  word-break: break-all;
  transition: color var(--transition-fast);
}

.meet-link:hover {
  color: var(--color-text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2.5rem 2rem;
}

.modal-footer-between {
  justify-content: space-between;
}

.modal-footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.5rem;
  background: var(--color-bg-dark);
  color: var(--color-bg-primary);
  font-family: var(--font-family);
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.btn:hover {
  opacity: 0.85;
}

.btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0.4rem 0;
  transition: color var(--transition-fast);
}

.btn-text:hover {
  color: var(--color-text-primary);
}

.btn-danger {
  color: #c45;
}

.btn-danger:hover {
  color: #a33;
}

@media (max-width: 768px) {
  .upcoming-event-banner {
    padding: 1.5rem 1.5rem;
  }

  .calendar-header {
    padding: 0 1.5rem;
  }

  .calendar-wrapper {
    padding: 1rem 1rem 2rem;
  }

  .modal-panel {
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
