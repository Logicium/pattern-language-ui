<template>
  <div class="pattern-map">
    <!-- Google Maps render target. Falls back to the inline SVG when no API key is configured or loading fails. -->
    <div v-if="useGoogle" ref="mapEl" class="map-frame map-frame--google" />

    <div v-else class="map-frame map-frame--svg">
      <svg viewBox="0 0 960 600" preserveAspectRatio="xMidYMid meet" class="map-svg">
        <defs>
          <linearGradient id="map-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8f6f2" />
            <stop offset="100%" stop-color="#efece4" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="960" height="600" fill="url(#map-bg-grad)" />

        <!-- Simplified contiguous US outline. -->
        <path :d="usOutline" fill="#e6e2d6" stroke="#cdc6b3" stroke-width="1" stroke-linejoin="round" />

        <!-- Subtle decorative lat/lon lines for a "field guide" feel. -->
        <g class="grid" stroke="#c9c4b3" stroke-width="0.5" stroke-dasharray="2 3" opacity="0.5">
          <line v-for="(_, i) in 6" :key="`h-${i}`" :x1="0" :y1="i * 100" :x2="960" :y2="i * 100" />
          <line v-for="(_, i) in 10" :key="`v-${i}`" :x1="i * 96" y1="0" :x2="i * 96" :y2="600" />
        </g>

        <!-- Location pins. -->
        <g class="markers">
          <g
            v-for="loc in projectedLocations"
            :key="loc.id"
            class="marker"
            :transform="`translate(${loc.x}, ${loc.y})`"
            @mouseenter="hovered = loc.id"
            @mouseleave="hovered = null"
          >
            <circle r="14" :fill="loc.color" opacity="0.18" />
            <circle r="7" :fill="loc.color" opacity="0.45" />
            <circle r="3.5" :fill="loc.color" stroke="#2a2a2a" stroke-width="0.6" />
          </g>
        </g>

        <!-- Tooltip rendered last so it sits on top. -->
        <g v-if="hoveredLocation" class="tooltip" :transform="`translate(${hoveredLocation.x}, ${hoveredLocation.y - 24})`">
          <rect
            :x="-tooltipWidth(hoveredLocation.location) / 2"
            y="-22"
            :width="tooltipWidth(hoveredLocation.location)"
            height="22"
            fill="#2a2a2a"
          />
          <text
            x="0"
            y="-7"
            text-anchor="middle"
            fill="#fdfbf7"
            font-family="Inter, sans-serif"
            font-size="11"
            font-weight="400"
          >
            {{ hoveredLocation.location }}
          </text>
        </g>
      </svg>
    </div>

    <div v-if="unmappedLocations.length > 0" class="map-footnote text-xs text-tertiary">
      Also documented in: {{ unmappedLocations.join(' · ') }}
    </div>
    <div v-if="projectedLocations.length === 0 && unmappedLocations.length === 0" class="map-empty text-xs text-tertiary">
      No mapped communities yet. Add a story to put this pattern on the map.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { US_OUTLINE_PATH } from './usMapPath'
import { LOCATION_COORDS } from './locationCoords'
import { configApi } from '@/services/api'

interface StoryLike {
  id: number | string
  location?: string
  color?: string
}

const props = defineProps<{ stories: StoryLike[] }>()

const usOutline = US_OUTLINE_PATH
const hovered = ref<number | string | null>(null)
const palette = ['#e8b4a0', '#b8d4c8', '#c9b8e8', '#d47b5f']
// API key is fetched from the backend at runtime so it isn't shipped in the JS bundle.
const apiKey = ref<string>('')
const loadError = ref(false)
const useGoogle = computed(() => !!apiKey.value && !loadError.value)

interface Projected {
  id: number | string
  location: string
  x: number
  y: number
  color: string
}

interface Pinned {
  id: number | string
  location: string
  lat: number
  lng: number
  color: string
}

// Equirectangular projection tuned for contiguous US.
// Maps lon ∈ [-125, -67] → x ∈ [40, 920], lat ∈ [25, 50] → y ∈ [560, 60] (inverted).
const project = (lat: number, lon: number) => {
  const minLon = -125
  const maxLon = -67
  const minLat = 25
  const maxLat = 50
  const x = ((lon - minLon) / (maxLon - minLon)) * (920 - 40) + 40
  const y = ((maxLat - lat) / (maxLat - minLat)) * (560 - 60) + 60
  return { x, y }
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
      location: s.location,
      lat: coord.lat,
      lng: coord.lon,
      color: s.color || palette[i % palette.length]!,
    })
    i += 1
  }
  return out
})

const projectedLocations = computed<Projected[]>(() =>
  pinnedLocations.value.map((p) => {
    const { x, y } = project(p.lat, p.lng)
    return { id: p.id, location: p.location, x, y, color: p.color }
  }),
)

const unmappedLocations = computed<string[]>(() => {
  const out: string[] = []
  for (const s of props.stories) {
    if (!s.location) continue
    if (!matchCoord(s.location)) out.push(s.location)
  }
  return out
})

const hoveredLocation = computed(() =>
  hovered.value !== null ? projectedLocations.value.find((l) => l.id === hovered.value) || null : null,
)

const tooltipWidth = (text: string) => Math.max(60, text.length * 6.5 + 20)

// --- Google Maps wiring ---------------------------------------------------

const mapEl = ref<HTMLDivElement | null>(null)
let mapInstance: google.maps.Map | null = null
let markers: google.maps.Marker[] = []
let infoWindow: google.maps.InfoWindow | null = null

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
  scale: 1.2,
  anchor: new google.maps.Point(0, 12),
})

const clearMarkers = () => {
  for (const m of markers) m.setMap(null)
  markers = []
}

const fitToMarkers = () => {
  if (!mapInstance || pinnedLocations.value.length === 0) return
  if (pinnedLocations.value.length === 1) {
    const only = pinnedLocations.value[0]!
    mapInstance.setCenter({ lat: only.lat, lng: only.lng })
    mapInstance.setZoom(6)
    return
  }
  const bounds = new google.maps.LatLngBounds()
  for (const p of pinnedLocations.value) bounds.extend({ lat: p.lat, lng: p.lng })
  mapInstance.fitBounds(bounds, 80)
}

const renderMarkers = () => {
  if (!mapInstance) return
  clearMarkers()
  if (!infoWindow) infoWindow = new google.maps.InfoWindow()
  for (const p of pinnedLocations.value) {
    const marker = new google.maps.Marker({
      position: { lat: p.lat, lng: p.lng },
      map: mapInstance,
      title: p.location,
      icon: pinIcon(p.color),
    })
    marker.addListener('click', () => {
      infoWindow!.setContent(
        `<div style="font-family:Inter,sans-serif;font-size:0.8125rem;letter-spacing:0.04em;color:#2a2a2a;padding:2px 4px;">${p.location}</div>`,
      )
      infoWindow!.open({ map: mapInstance!, anchor: marker })
    })
    markers.push(marker)
  }
  fitToMarkers()
}

onMounted(async () => {
  // Pull the Google Maps key from the backend so it never lives in the static bundle.
  try {
    const { key } = await configApi.getMapsKey()
    if (!key) {
      loadError.value = true
      return
    }
    apiKey.value = key
  } catch (err) {
    console.warn('[PatternLocationMap] could not fetch maps key from API, falling back to SVG.', err)
    loadError.value = true
    return
  }
  // Wait for the v-if="useGoogle" branch to render so mapEl is bound.
  await nextTick()
  if (!mapEl.value) return
  try {
    setOptions({ key: apiKey.value, v: 'weekly' })
    await importLibrary('maps')
    mapInstance = new google.maps.Map(mapEl.value, {
      center: { lat: 39, lng: -96 },
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: 'cooperative',
      backgroundColor: '#f5f1e8',
      styles: mapStyles,
    })
    renderMarkers()
  } catch (err) {
    console.warn('[PatternLocationMap] failed to load Google Maps, falling back to SVG.', err)
    loadError.value = true
  }
})

watch(pinnedLocations, () => {
  if (mapInstance) renderMarkers()
})

onBeforeUnmount(() => {
  clearMarkers()
  if (infoWindow) infoWindow.close()
  infoWindow = null
  mapInstance = null
})
</script>

<style scoped>
.pattern-map { width: 100%; }

.map-frame {
  width: 100%;
  background: var(--color-bg-primary);
  border: 1px solid rgba(42, 42, 42, 0.08);
}

.map-frame--google {
  height: 540px;
}

.map-frame--svg {
  padding: 1rem;
}

.map-svg {
  width: 100%;
  height: auto;
  display: block;
}

.marker {
  cursor: default;
  transition: transform var(--transition-fast);
  transform-origin: center;
  transform-box: fill-box;
}

.marker:hover { transform: scale(1.15) translate(var(--tx, 0), var(--ty, 0)); }

.tooltip { pointer-events: none; }

.map-footnote,
.map-empty {
  margin-top: 1rem;
  letter-spacing: 0.05em;
  line-height: 1.6;
}
</style>
