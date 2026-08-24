/** Pull map coordinates off a city record, when it has a usable pair. */
export function coordsOf(
  city: { latitude?: number | null; longitude?: number | null } | null | undefined,
): { lat: number; lng: number } | null {
  if (!city) return null
  const { latitude, longitude } = city
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null
  return { lat: latitude, lng: longitude }
}

/**
 * Muted, label-free Google Static Maps render matching the site palette —
 * used as the backdrop for city cards and the city page hero.
 */
export function cityStaticMapUrl(
  name: string,
  state: string | undefined,
  key: string,
  opts: {
    width?: number
    height?: number
    zoom?: number
    /**
     * Explicit map center. Cities that carry coordinates use them instead of
     * a name lookup — required for the fictional workshop town, whose name
     * would geocode to nowhere (or worse, to a real namesake).
     */
    coords?: { lat: number; lng: number } | null
  } = {},
): string {
  const { width = 640, height = 400, zoom = 13, coords = null } = opts
  const center = coords
    ? `${coords.lat},${coords.lng}`
    : encodeURIComponent(state ? `${name}, ${state}` : name)
  const styles = [
    'feature:all|element:labels|visibility:off',
    'feature:all|element:geometry|color:0xf4f1ea',
    'feature:road|element:geometry|color:0xffffff',
    'feature:water|element:geometry|color:0xc7d9cf',
    'feature:poi|visibility:off',
    'feature:transit|visibility:off',
    'feature:administrative|visibility:off',
  ].map(s => `&style=${encodeURIComponent(s)}`).join('')

  return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${width}x${height}&scale=1${styles}&key=${key}`
}
