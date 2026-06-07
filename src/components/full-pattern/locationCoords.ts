// Lightweight lookup from substring → approximate centroid (lat, lon).
// Keys are matched case-insensitive against story.location via `includes`.
// Order matters: more specific keys (city/region) before broader (state).

export const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  // Specific cities
  'trinidad, colorado': { lat: 37.17, lon: -104.5 },
  'beckley, west virginia': { lat: 37.78, lon: -81.19 },
  'thomasville, georgia': { lat: 30.83, lon: -83.98 },
  'santa fe, new mexico': { lat: 35.69, lon: -105.94 },
  'port townsend, washington': { lat: 48.12, lon: -122.76 },
  'portland, maine': { lat: 43.66, lon: -70.26 },

  // Regions
  'eastern oregon': { lat: 44.5, lon: -118.0 },
  'rural oregon': { lat: 44.0, lon: -120.5 },
  'rural oregon fire district': { lat: 44.0, lon: -120.5 },
  'rural nebraska': { lat: 41.5, lon: -100.0 },
  'northern maine': { lat: 46.5, lon: -68.5 },
  'new mexico pueblos': { lat: 35.5, lon: -106.0 },
  'new mexico tribal communities': { lat: 35.5, lon: -106.0 },
  'arizona border communities': { lat: 31.85, lon: -110.5 },
  'south dakota tribal lands': { lat: 43.7, lon: -101.0 },
  'alaska native communities': { lat: 64.0, lon: -150.0 },
  'appalachian region': { lat: 37.5, lon: -82.0 },
  'appalachian communities': { lat: 37.5, lon: -82.0 },
  'california school districts': { lat: 36.7, lon: -119.4 },

  // States (broad fallback — listed last)
  'idaho': { lat: 44.07, lon: -114.74 },
  'nebraska': { lat: 41.5, lon: -100.0 },
  'north carolina': { lat: 35.63, lon: -79.81 },
  'vermont': { lat: 44.07, lon: -72.71 },
  'montana': { lat: 46.88, lon: -110.36 },
  'colorado': { lat: 39.0, lon: -105.55 },
  'oregon': { lat: 44.0, lon: -120.5 },
  'washington': { lat: 47.4, lon: -121.49 },
  'maine': { lat: 45.37, lon: -69.24 },
  'new mexico': { lat: 34.84, lon: -106.25 },
  'georgia': { lat: 32.99, lon: -83.64 },
  'west virginia': { lat: 38.5, lon: -80.95 },
  'alaska': { lat: 64.0, lon: -150.0 },
  'south dakota': { lat: 44.44, lon: -100.23 },
  'arizona': { lat: 33.73, lon: -111.43 },
  'california': { lat: 36.7, lon: -119.4 },
}
