import { ref, computed, watch, onMounted } from 'vue'
import { playbooksApi } from '@/services/api'
import type { CalendarEvent } from '@/types/collaboration'

export function usePlaybookCalendar(playbook: any) {
  const events = ref<CalendarEvent[]>([])
  const loadingEvents = ref(false)
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const editingEvent = ref<CalendarEvent | null>(null)

  const newEvent = ref({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurrenceRule: '',
  })

  const recurrenceOptions = [
    { label: 'Does not repeat', value: '' },
    { label: 'Daily', value: 'RRULE:FREQ=DAILY' },
    { label: 'Weekly', value: 'RRULE:FREQ=WEEKLY' },
    { label: 'Every weekday (Mon–Fri)', value: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { label: 'Biweekly', value: 'RRULE:FREQ=WEEKLY;INTERVAL=2' },
    { label: 'Monthly', value: 'RRULE:FREQ=MONTHLY' },
  ]

  const upcomingEvent = computed(() => {
    const now = new Date()
    return events.value.find((e) => new Date(e.startTime) >= now) || null
  })

  const isEventLive = computed(() => {
    if (!upcomingEvent.value) return false
    const now = new Date()
    const start = new Date(upcomingEvent.value.startTime)
    const end = new Date(upcomingEvent.value.endTime)
    return now >= start && now <= end
  })

  const calendarEvents = computed(() =>
    events.value.map((e) => ({
      id: String(e.id),
      title: e.title,
      start: e.startTime,
      end: e.endTime,
      extendedProps: {
        description: e.description,
        meetLink: e.meetLink,
        createdBy: e.createdBy,
        isRecurring: e.isRecurring,
        recurrenceRule: e.recurrenceRule,
        calendarEvent: e,
      },
    })),
  )

  const loadEvents = async () => {
    if (!playbook.value || typeof playbook.value.id !== 'number') return
    try {
      loadingEvents.value = true
      events.value = await playbooksApi.getCalendarEvents(playbook.value.id)
    } catch (error) {
      console.error('Failed to load calendar events:', error)
      events.value = []
    } finally {
      loadingEvents.value = false
    }
  }

  const openCreateModal = (startDate?: string) => {
    const now = new Date()
    const defaultStart = startDate || toLocalDateTimeString(now)
    const defaultEnd = toLocalDateTimeString(new Date(now.getTime() + 60 * 60 * 1000))

    newEvent.value = {
      title: '',
      description: '',
      startTime: defaultStart,
      endTime: defaultEnd,
      isRecurring: false,
      recurrenceRule: '',
    }
    showCreateModal.value = true
  }

  const createEvent = async () => {
    if (!playbook.value || !newEvent.value.title || !newEvent.value.startTime || !newEvent.value.endTime) return
    try {
      loadingEvents.value = true
      await playbooksApi.createCalendarEvent(playbook.value.id, {
        title: newEvent.value.title,
        description: newEvent.value.description || undefined,
        startTime: new Date(newEvent.value.startTime).toISOString(),
        endTime: new Date(newEvent.value.endTime).toISOString(),
        isRecurring: newEvent.value.isRecurring,
        recurrenceRule: newEvent.value.isRecurring ? newEvent.value.recurrenceRule : undefined,
      })
      showCreateModal.value = false
      await loadEvents()
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      loadingEvents.value = false
    }
  }

  const openEditModal = (event: CalendarEvent) => {
    editingEvent.value = { ...event }
    showEditModal.value = true
  }

  const updateEvent = async () => {
    if (!playbook.value || !editingEvent.value) return
    try {
      loadingEvents.value = true
      await playbooksApi.updateCalendarEvent(playbook.value.id, editingEvent.value.id, {
        title: editingEvent.value.title,
        description: editingEvent.value.description,
        startTime: new Date(editingEvent.value.startTime).toISOString(),
        endTime: new Date(editingEvent.value.endTime).toISOString(),
        isRecurring: editingEvent.value.isRecurring,
        recurrenceRule: editingEvent.value.isRecurring ? editingEvent.value.recurrenceRule : undefined,
      })
      showEditModal.value = false
      editingEvent.value = null
      await loadEvents()
    } catch (error) {
      console.error('Failed to update event:', error)
    } finally {
      loadingEvents.value = false
    }
  }

  const deleteEvent = async (eventId: number) => {
    if (!playbook.value) return
    try {
      loadingEvents.value = true
      await playbooksApi.deleteCalendarEvent(playbook.value.id, eventId)
      showEditModal.value = false
      editingEvent.value = null
      await loadEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
    } finally {
      loadingEvents.value = false
    }
  }

  function toLocalDateTimeString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  function formatEventTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Denver',
    })
  }

  function formatTimeOnly(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Denver',
    })
  }

  watch(() => playbook.value?.id, () => {
    loadEvents()
  })

  onMounted(() => {
    loadEvents()
  })

  return {
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
    loadEvents,
    openCreateModal,
    createEvent,
    openEditModal,
    updateEvent,
    deleteEvent,
    formatEventTime,
    formatTimeOnly,
  }
}
