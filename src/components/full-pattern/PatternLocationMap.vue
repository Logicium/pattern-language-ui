<template>
  <div class="pattern-map">
    <div ref="frameEl" class="map-frame">
      <div ref="mapEl" class="map-canvas" />

      <aside ref="readoutEl" class="map-readout">
        <div class="map-readout-glass" aria-hidden="true"></div>
        <div class="map-readout-content">
          <p class="readout-eyebrow text-xs text-tertiary">In the field</p>
          <h2 class="readout-heading">Where this pattern lives</h2>

          <template v-if="selectedStory">
            <p class="readout-subeyebrow text-xs text-tertiary">Selected community</p>
            <h3 class="readout-title">{{ selectedStory.location }}</h3>
            <p v-if="selectedStory.title" class="readout-subtitle text-sm">{{ selectedStory.title }}</p>
            <p v-if="selectedStory.problem" class="readout-body text-sm text-secondary">
              {{ selectedStory.problem }}
            </p>
            <router-link
              v-if="typeof selectedStory.id === 'number'"
              :to="`/stories/${selectedStory.id}`"
              class="readout-link text-xs"
            >
              Read the full story <span class="chevron"></span>
            </router-link>
            <button type="button" class="readout-reset text-xs" @click="selectedStory = null">
              <span class="chevron chevron--back"></span> Back to overview
            </button>
          </template>
          <template v-else>
            <p class="readout-body text-sm text-secondary">
              <template v-if="pinnedLocations.length === 0">
                No mapped communities yet. Add a story to put this pattern on the map.
              </template>
              <template v-else>
                {{ pinnedLocations.length }}
                {{ pinnedLocations.length === 1 ? 'community' : 'communities' }} documented —
                click a pin to read their story.
              </template>
            </p>
            <div v-if="pinnedLocations.length" class="readout-scroll">
              <div
                ref="readoutViewportEl"
                class="readout-scroll-viewport"
                @scroll="updateThumb"
              >
                <ul class="readout-list">
                  <li
                    v-for="p in pinnedLocations"
                    :key="p.id"
                    class="readout-list-item text-xs"
                    @click="focusStory(p.id)"
                  >
                    <span class="readout-dot" :style="{ background: p.color }"></span>
                    {{ p.location }}
                  </li>
                </ul>
              </div>
              <div
                v-show="thumbVisible"
                class="readout-scroll-track"
                @mousedown.prevent="onTrackClick"
              >
                <div
                  class="readout-scroll-thumb"
                  :class="{ dragging: isDragging }"
                  :style="thumbStyle"
                  @mousedown.stop.prevent="onThumbDragStart"
                />
              </div>
            </div>
          </template>

          <p v-if="unmappedLocations.length" class="map-footnote text-xs text-tertiary">
            Also documented in: {{ unmappedLocations.join(' · ') }}
          </p>
        </div>
      </aside>

      <div v-if="!mapReady && !loadError" class="map-status text-xs text-tertiary">
        Loading map…
      </div>
      <div v-else-if="loadError" class="map-status text-xs text-tertiary">
        Map unavailable.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { LOCATION_COORDS } from './locationCoords'
import { configApi } from '@/services/api'
interface StoryLike {
  id: number | string
  title?: string
  location?: string
  problem?: string
  color?: string
  image?: string
}

const props = defineProps<{ stories: StoryLike[] }>()

const palette = ['#e8b4a0', '#b8d4c8', '#c9b8e8', '#d47b5f']
const apiKey = ref<string>('')
const loadError = ref(false)
const mapReady = ref(false)
const selectedStory = ref<StoryLike | null>(null)

interface Pinned {
  id: number | string
  story: StoryLike
  location: string
  lat: number
  lng: number
  color: string
}

const matchCoord = (location: string): { lat: number; lon: number } | null => {
  const lower = location.toLowerCase()
  for (const key of Object.keys(LOCATION_COORDS)) {
    if (lower.includes(key)) return LOCATION_COORDS[key] ?? null
  }
  return null
}

const pinnedLocations = computed<Pinned[]>(() => {
  const out: Pinned[] = []
  let i = 0
  for (const s of props.stories) {
    if (!s.location) continue
    const coord = matchCoord(s.location)
    if (!coord) continue
    out.push({
      id: s.id,
      story: s,
      location: s.location,
      lat: coord.lat,
      lng: coord.lon,
      color: s.color || palette[i % palette.length]!,
    })
    i += 1
  }
  return out
})

const unmappedLocations = computed<string[]>(() => {
  const out: string[] = []
  for (const s of props.stories) {
    if (!s.location) continue
    if (!matchCoord(s.location)) out.push(s.location)
  }
  return out
})

const focusStory = (id: number | string) => {
  const pin = pinnedLocations.value.find((p) => p.id === id)
  if (!pin) return
  selectedStory.value = pin.story
  if (mapInstance) {
    mapInstance.panTo({ lat: pin.lat, lng: pin.lng })
    mapInstance.setZoom(7)
    const overlayPad = (readoutEl.value?.offsetWidth ?? 0)
    if (overlayPad > 0) mapInstance.panBy(-overlayPad / 2, 0)
  }
}

// --- Wheel gate -----------------------------------------------------------
// Only ctrl/cmd + wheel reaches the map. Plain wheel falls through to the
// page so the article continues to scroll naturally.
const onFrameWheel = (e: WheelEvent) => {
  if (!e.ctrlKey && !e.metaKey) {
    e.stopPropagation()
  }
}

// --- Custom scrollbar -----------------------------------------------------
const readoutViewportEl = ref<HTMLDivElement | null>(null)
const thumbHeight = ref(0)
const thumbTop = ref(0)
const thumbVisible = ref(false)
const isDragging = ref(false)
let dragStartClientY = 0
let dragStartScrollTop = 0

const thumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  transform: `translateY(${thumbTop.value}px)`,
}))

const updateThumb = () => {
  const el = readoutViewportEl.value
  if (!el) return
  const visibleH = el.clientHeight
  const totalH = el.scrollHeight
  if (totalH <= visibleH + 1) {
    thumbVisible.value = false
    return
  }
  thumbVisible.value = true
  const ratio = visibleH / totalH
  thumbHeight.value = Math.max(18, visibleH * ratio)
  const maxScroll = totalH - visibleH
  const scrollRatio = maxScroll > 0 ? el.scrollTop / maxScroll : 0
  thumbTop.value = scrollRatio * (visibleH - thumbHeight.value)
}

const onThumbDrag = (e: MouseEvent) => {
  const el = readoutViewportEl.value
  if (!el) return
  const visibleH = el.clientHeight
  const trackRange = visibleH - thumbHeight.value
  if (trackRange <= 0) return
  const maxScroll = el.scrollHeight - visibleH
  const deltaY = e.clientY - dragStartClientY
  el.scrollTop = dragStartScrollTop + (deltaY / trackRange) * maxScroll
}

const onThumbDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onThumbDrag)
  document.removeEventListener('mouseup', onThumbDragEnd)
  document.body.style.userSelect = ''
}

const onThumbDragStart = (e: MouseEvent) => {
  const el = readoutViewportEl.value
  if (!el) return
  isDragging.value = true
  dragStartClientY = e.clientY
  dragStartScrollTop = el.scrollTop
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onThumbDrag)
  document.addEventListener('mouseup', onThumbDragEnd)
}

const onTrackClick = (e: MouseEvent) => {
  const el = readoutViewportEl.value
  const track = e.currentTarget as HTMLElement
  if (!el || !track) return
  const rect = track.getBoundingClientRect()
  const clickY = e.clientY - rect.top
  // Center the thumb on the click point.
  const targetTop = clickY - thumbHeight.value / 2
  const trackRange = rect.height - thumbHeight.value
  const ratio = Math.max(0, Math.min(1, targetTop / Math.max(trackRange, 1)))
  el.scrollTop = ratio * (el.scrollHeight - el.clientHeight)
}

watch(pinnedLocations, () => {
  nextTick(() => updateThumb())
})

// --- Google Maps wiring ---------------------------------------------------

const frameEl = ref<HTMLDivElement | null>(null)
const readoutEl = ref<HTMLElement | null>(null)
const mapEl = ref<HTMLDivElement | null>(null)
let mapInstance: google.maps.Map | null = null
let markers: google.maps.Marker[] = []
let resizeObserver: ResizeObserver | null = null

// Editorial map style — desaturated to harmonize with the cream / sage / peach palette.
const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f1e8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6a6a6a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fdfbf7' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#cdc6b3' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e6e2d6' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbe6e2' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9a9a9a' }] },
]

const pinIcon = (color: string): google.maps.Symbol => ({
  path: 'M 0 -16 C -7 -16 -12 -10 -12 -4 C -12 4 0 12 0 12 C 0 12 12 4 12 -4 C 12 -10 7 -16 0 -16 Z',
  fillColor: color,
  fillOpacity: 0.9,
  strokeColor: '#2a2a2a',
  strokeWeight: 0.8,
  scale: 1.1,
  anchor: new google.maps.Point(0, 12),
})

const clearMarkers = () => {
  for (const m of markers) m.setMap(null)
  markers = []
}

const fitToMarkers = () => {
  if (!mapInstance) return
  const overlayPad = (readoutEl.value?.offsetWidth ?? 0) + 32
  const padding = { top: 48, right: 48, bottom: 48, left: overlayPad }
  if (pinnedLocations.value.length === 0) {
    mapInstance.setCenter({ lat: 39, lng: -96 })
    mapInstance.setZoom(4)
    // Shift the rendered content right so the US sits in the visible (unblurred) half.
    if (overlayPad > 0) mapInstance.panBy(-overlayPad / 2, 0)
    return
  }
  if (pinnedLocations.value.length === 1) {
    const only = pinnedLocations.value[0]!
    mapInstance.setCenter({ lat: only.lat, lng: only.lng })
    mapInstance.setZoom(6)
    if (overlayPad > 0) mapInstance.panBy(-overlayPad / 2, 0)
    return
  }
  const bounds = new google.maps.LatLngBounds()
  for (const p of pinnedLocations.value) bounds.extend({ lat: p.lat, lng: p.lng })
  mapInstance.fitBounds(bounds, padding)
}

const renderMarkers = () => {
  if (!mapInstance) return
  clearMarkers()
  for (const p of pinnedLocations.value) {
    const marker = new google.maps.Marker({
      position: { lat: p.lat, lng: p.lng },
      map: mapInstance,
      title: p.location,
      icon: pinIcon(p.color),
    })
    marker.addListener('click', () => {
      selectedStory.value = p.story
    })
    markers.push(marker)
  }
  fitToMarkers()
}

onMounted(async () => {
  try {
    const { key } = await configApi.getMapsKey()
    if (!key) {
      loadError.value = true
      return
    }
    apiKey.value = key
  } catch (err) {
    console.warn('[PatternLocationMap] could not fetch maps key from API.', err)
    loadError.value = true
    return
  }
  await nextTick()
  if (!mapEl.value) return
  try {
    setOptions({ key: apiKey.value, v: 'weekly' })
    await importLibrary('maps')
    mapInstance = new google.maps.Map(mapEl.value, {
      center: { lat: 39, lng: -96 },
      zoom: 4,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      backgroundColor: '#f5f1e8',
      styles: mapStyles,
    })
    mapReady.value = true
    renderMarkers()
    // Re-frame whenever the map size changes (responsive overlay).
    if (frameEl.value && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => fitToMarkers())
      resizeObserver.observe(frameEl.value)
    }
    // Custom wheel gate: only ctrl/cmd-scroll reaches the map; plain wheel scrolls the page.
    // (We use 'greedy' on the map itself — which renders no overlay nag — and intercept
    // wheel events in the capture phase before Google's listener runs.)
    if (frameEl.value) {
      frameEl.value.addEventListener('wheel', onFrameWheel, { capture: true })
    }
    nextTick(() => updateThumb())
  } catch (err) {
    console.warn('[PatternLocationMap] failed to load Google Maps.', err)
    loadError.value = true
  }
})

watch(pinnedLocations, () => {
  if (mapInstance) renderMarkers()
})

onBeforeUnmount(() => {
  clearMarkers()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (frameEl.value) {
    frameEl.value.removeEventListener('wheel', onFrameWheel, { capture: true } as AddEventListenerOptions)
  }
  document.removeEventListener('mousemove', onThumbDrag)
  document.removeEventListener('mouseup', onThumbDragEnd)
  mapInstance = null
})
</script>

<style scoped>
.pattern-map {
  width: 100%;
  position: relative;
}

.map-frame {
  position: relative;
  width: 100%;
  height: clamp(420px, 60vh, 640px);
  background: var(--color-bg-primary);
  overflow: hidden;
}

.map-canvas {
  position: absolute;
  inset: 0;
}

.map-status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}

/* Overlay: floats over the left half of the map. */
.map-readout {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(50%, 560px);
  display: flex;
  z-index: 2;
  isolation: isolate;
}

.map-readout-glass {
  position: absolute;
  inset: 0;
  background: rgba(253, 251, 247, 0.55);
  backdrop-filter: blur(28px) saturate(140%);
  -webkit-backdrop-filter: blur(28px) saturate(140%);
  /* Soft fade on the inner edge so the blur dissolves into the map. */
  mask-image: linear-gradient(to right, black 0%, black 78%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 0%, black 78%, transparent 100%);
  pointer-events: none;
}

.map-readout-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 4rem 5rem 4rem var(--container-padding);
  width: 100%;
  overflow: hidden;
}

.readout-eyebrow,
.readout-subeyebrow {
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0;
}

.readout-subeyebrow {
  margin-top: 1.25rem;
}

.readout-heading {
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 0.5rem;
}

.readout-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
}

.readout-subtitle {
  font-style: italic;
  color: var(--color-text-secondary);
  margin: 0;
}

.readout-body {
  line-height: 1.7;
  margin: 0;
  max-width: 42ch;
}

.readout-link {
  align-self: flex-start;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--color-accent-1);
  padding-bottom: 2px;
  transition: color var(--transition-fast);
}

.readout-link:hover { color: var(--color-accent-warm); }

.readout-reset {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  margin-top: 0.25rem;
  color: var(--color-text-tertiary);
  cursor: pointer;
  letter-spacing: 0.06em;
}

.readout-reset:hover { color: var(--color-text-primary); }

.readout-scroll {
  position: relative;
  margin: 0.25rem 0 0;
}

.readout-scroll-viewport {
  max-height: 220px;
  overflow-y: auto;
  /* Hide native scrollbar entirely — we render our own. */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.readout-scroll-viewport::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.readout-scroll-track {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 10px;
  cursor: pointer;
}

.readout-scroll-thumb {
  position: absolute;
  right: 4px;
  width: 2px;
  background: rgba(42, 42, 42, 0.22);
  border-radius: 1px;
  transition: background var(--transition-fast), width var(--transition-fast);
  pointer-events: auto;
  cursor: grab;
}
.readout-scroll-track:hover .readout-scroll-thumb,
.readout-scroll-thumb.dragging {
  background: rgba(42, 42, 42, 0.55);
  width: 3px;
  right: 3.5px;
}
.readout-scroll-thumb.dragging {
  cursor: grabbing;
}

.readout-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.readout-list-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.readout-list-item:hover { color: var(--color-text-primary); }

.readout-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.map-footnote {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(42, 42, 42, 0.06);
  letter-spacing: 0.05em;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .map-frame { height: 520px; }
  .map-readout {
    width: 100%;
    max-width: none;
  }
  .map-readout-content {
    padding: 2.5rem var(--container-padding);
  }
}
</style>
