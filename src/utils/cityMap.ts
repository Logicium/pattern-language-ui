/**
 * Muted, label-free Google Static Maps render matching the site palette —
 * used as the backdrop for city cards and the city page hero.
 */
export function cityStaticMapUrl(
  name: string,
  state: string | undefined,
  key: string,
  opts: { width?: number; height?: number; zoom?: number } = {},
): string {
  const { width = 640, height = 400, zoom = 13 } = opts
  const center = encodeURIComponent(state ? `${name}, ${state}` : name)
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
