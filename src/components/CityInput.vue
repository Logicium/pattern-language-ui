<template>
  <div class="city-input">
    <input
      :value="modelValue"
      type="text"
      class="form-input"
      :placeholder="placeholder"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
      @focus="onFocus"
      @blur="closeSoon"
      @keydown="onKeydown"
    />
    <Transition name="city-menu">
      <div v-if="isOpen && predictions.length > 0" class="city-menu">
        <button
          v-for="(prediction, i) in predictions"
          :key="prediction.place_id"
          type="button"
          class="city-option"
          :class="{ highlighted: i === highlighted }"
          @mousedown.prevent="select(prediction)"
          @mousemove="highlighted = i"
        >
          <span class="city-name">{{ prediction.terms[0]?.value }}</span>
          <span class="city-state text-tertiary">{{ prediction.terms[1]?.value }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { configApi } from '@/services/api'

/**
 * Town/city picker backed by Google Places autocomplete (US cities only).
 * Keeps the town field clean — selecting a prediction emits the bare city
 * name plus its 2-letter state code, so "Trinidad, Colorado" can never end
 * up crammed into the town column. Falls back to a plain text input if the
 * Maps API is unavailable.
 */
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: 'Start typing your town...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [value: { city: string; state: string }]
}>()

const isOpen = ref(false)
const highlighted = ref(0)
const predictions = ref<any[]>([])

let autocompleteService: google.maps.places.AutocompleteService | null = null
let placesFailed = false
let loadPromise: Promise<void> | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

// Load the Places library lazily on first focus so pages with the input
// don't pay for Google Maps until the field is actually used.
const ensurePlaces = () => {
  if (autocompleteService || placesFailed) return Promise.resolve()
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const { key } = await configApi.getMapsKey()
        if (!key) throw new Error('No Maps API key configured')
        setOptions({ key, v: 'weekly' })
        await importLibrary('places')
        autocompleteService = new google.maps.places.AutocompleteService()
      } catch (err) {
        placesFailed = true
        console.warn('[CityInput] Places unavailable — falling back to plain input.', err)
      }
    })()
  }
  return loadPromise
}

const fetchPredictions = async (query: string) => {
  await ensurePlaces()
  if (!autocompleteService || !query || query.length < 2) {
    predictions.value = []
    return
  }
  autocompleteService.getPlacePredictions(
    {
      input: query,
      types: ['(cities)'],
      componentRestrictions: { country: 'us' },
    },
    (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        predictions.value = results.slice(0, 6)
        highlighted.value = 0
        isOpen.value = true
      } else {
        predictions.value = []
      }
    },
  )
}

const onInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchPredictions(value), 250)
}

const onFocus = () => {
  ensurePlaces()
  if (predictions.value.length > 0) isOpen.value = true
}

const closeSoon = () => {
  // Give mousedown selection a beat before the menu disappears
  closeTimer = setTimeout(() => { isOpen.value = false }, 150)
}

const select = (prediction: any) => {
  const city = prediction.terms[0]?.value || ''
  const state = prediction.terms[1]?.value || ''
  emit('update:modelValue', city)
  emit('select', { city, state })
  predictions.value = []
  isOpen.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value || predictions.value.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlighted.value = (highlighted.value + 1) % predictions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlighted.value = (highlighted.value - 1 + predictions.value.length) % predictions.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    select(predictions.value[highlighted.value])
  } else if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<style scoped>
.city-input {
  position: relative;
}

.city-input .form-input {
  width: 100%;
}

.city-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #ffffff;
  border: 1px solid var(--hairline-strong);
  box-shadow: 0 12px 32px rgba(42, 42, 42, 0.1);
  max-height: 280px;
  overflow-y: auto;
}

.city-option {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--hairline);
  cursor: pointer;
  font-family: var(--font-family);
  text-align: left;
  transition: background-color var(--transition-fast);
}

.city-option:last-child { border-bottom: none; }

.city-option.highlighted {
  background: var(--color-bg-secondary);
}

.city-name {
  font-size: 0.9375rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
}

.city-state {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.city-menu-enter-active,
.city-menu-leave-active {
  transition: opacity 140ms ease;
}

.city-menu-enter-from,
.city-menu-leave-to {
  opacity: 0;
}
</style>
