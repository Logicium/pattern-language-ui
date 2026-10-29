/**
 * Where to go after signing in or up, from `?redirect=`. Only paths on this
 * site pass; anything else (another origin, `//host`, `/\host`) falls back.
 */
export function safeRedirect(value: unknown, fallback = '/dashboard'): string {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : fallback
}
