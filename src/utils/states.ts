/**
 * US state code/name normalization — used to match resources to the
 * signed-in user's state regardless of how either side stored it.
 */

export const STATE_NAME_BY_CODE: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
}

const CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_BY_CODE).map(([code, name]) => [name.toLowerCase(), code])
)

/** Normalize 'CO', 'co', 'Colorado', ' colorado ' → 'CO'; unknown → null. */
export function normalizeStateCode(input?: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    const code = trimmed.toUpperCase()
    return STATE_NAME_BY_CODE[code] ? code : null
  }
  return CODE_BY_NAME[trimmed.toLowerCase()] ?? null
}

/** Pull a state out of a "Town, ST" / "Town, Colorado" location string. */
export function stateFromLocation(location?: string | null): string | null {
  if (!location) return null
  const parts = location.split(',')
  for (let i = parts.length - 1; i > 0; i--) {
    const code = normalizeStateCode((parts[i] ?? '').replace(/\b(usa|united states)\b/i, ''))
    if (code) return code
  }
  if (parts.length > 1) return null

  // No comma: the whole string may be a state, or a freeform
  // "Trinidad Colorado"-style value with the state as trailing word(s).
  const whole = normalizeStateCode(location)
  if (whole) return whole
  const words = location.trim().split(/\s+/)
  return (
    normalizeStateCode(words.slice(-2).join(' ')) ??
    normalizeStateCode(words[words.length - 1] ?? '')
  )
}
