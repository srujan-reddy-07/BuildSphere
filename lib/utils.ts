/**
 * lib/utils.ts
 * General-purpose utility functions for BuildSphere.
 */

// ---------------------------------------------------------------------------
// cn – classname merger (clsx-style, no external dependency)
// ---------------------------------------------------------------------------

/**
 * Merge Tailwind / CSS class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ---------------------------------------------------------------------------
// Date utilities
// ---------------------------------------------------------------------------

/**
 * Format a date as a human-readable string, e.g. "15 Jan 2025".
 * @param date  ISO string or Date object
 * @param locale  BCP-47 locale (defaults to "en-IN")
 */
export function formatDate(date: string | Date, locale: string = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/**
 * Format a date as a relative time string, e.g. "2 hours ago", "3 days ago".
 * Falls back to an absolute date for dates older than 30 days.
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid date'

  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return pluralize(diffMins, 'minute') + ' ago'
  if (diffHours < 24) return pluralize(diffHours, 'hour') + ' ago'
  if (diffDays < 7) return pluralize(diffDays, 'day') + ' ago'
  if (diffWeeks < 5) return pluralize(diffWeeks, 'week') + ' ago'
  if (diffMonths < 12) return pluralize(diffMonths, 'month') + ' ago'

  // Older than a year – show absolute date
  return formatDate(d)
}

// ---------------------------------------------------------------------------
// String utilities
// ---------------------------------------------------------------------------

/**
 * Truncate a string to `maxLength` characters, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

/**
 * Capitalise the first character of a string.
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Return a pluralised label for a count, e.g. "1 day", "3 days".
 * @param count     The numeric count
 * @param singular  Singular form of the word
 * @param plural    Optional plural form; defaults to `singular + "s"`
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const label = count === 1 ? singular : (plural ?? singular + 's')
  return `${count} ${label}`
}

// ---------------------------------------------------------------------------
// Profile completeness
// ---------------------------------------------------------------------------

const PROFILE_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'full_name',        label: 'Full name' },
  { key: 'city',             label: 'City' },
  { key: 'bio',              label: 'Bio' },
  { key: 'avatar_url',       label: 'Profile photo' },
  { key: 'experience_years', label: 'Years of experience' },
  { key: 'availability',     label: 'Availability' },
  { key: 'resume_url',       label: 'Resume' },
]

/**
 * Compute how complete a user's profile is.
 *
 * Fields checked:
 *  - full_name, city, bio, avatar_url, experience_years, availability, resume_url (from `profile`)
 *  - skills (need ≥ 1)
 *  - education (need ≥ 1 item; read from profile.education if present)
 *
 * @returns `{ score: number (0-100), missing: string[] }` where missing contains
 *          human-readable labels of incomplete fields.
 */
export function getProfileCompleteness(
  profile: Partial<Record<string, unknown>>,
  skills: string[]
): { score: number; missing: string[] } {
  const missing: string[] = []
  let filled = 0
  const total = PROFILE_FIELDS.length + 2 // +2 for skills & education

  // Check standard text/primitive fields
  for (const field of PROFILE_FIELDS) {
    const value = profile[field.key]
    const isDefined =
      value !== null &&
      value !== undefined &&
      String(value).trim() !== '' &&
      !(field.key === 'experience_years' && Number(value) === 0 && profile['experience_years'] === undefined)

    if (isDefined) {
      filled++
    } else {
      missing.push(field.label)
    }
  }

  // Check skills (need at least 1)
  if (skills.length >= 1) {
    filled++
  } else {
    missing.push('At least one skill')
  }

  // Check education (need at least 1 item)
  const education = profile['education']
  const hasEducation =
    Array.isArray(education) && education.length >= 1
  if (hasEducation) {
    filled++
  } else {
    missing.push('Education')
  }

  const score = Math.round((filled / total) * 100)
  return { score, missing }
}
