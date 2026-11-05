/**
 * A username picked on the landing page, carried through sign-up into
 * onboarding. Kept in localStorage rather than the URL because Google
 * sign-in redirects drop query strings.
 */
const KEY = "presssence:claimed-username"

export function saveClaimedUsername(username: string) {
  try {
    localStorage.setItem(KEY, username)
  } catch {}
}

/** Returns the claimed name once, then forgets it. */
export function takeClaimedUsername(): string | null {
  try {
    const value = localStorage.getItem(KEY)
    localStorage.removeItem(KEY)
    return value
  } catch {
    return null
  }
}

export function peekClaimedUsername(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
