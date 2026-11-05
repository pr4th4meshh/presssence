/**
 * The toolbar's add forms read the current portfolio right before saving.
 * The page sections keep their own copies of skills, links and projects, so
 * saving from a copy taken at page load would bring back anything deleted
 * since then.
 */
export interface CurrentPortfolio {
  features: string[]
  socialMedia: Record<string, string | string[] | null> | null
  projects: Array<{ id: string; position: number }>
}

export async function fetchCurrent(username: string): Promise<CurrentPortfolio> {
  const res = await fetch(`/api/portfolio?portfolioUsername=${encodeURIComponent(username)}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Couldn't load your portfolio. Refresh the page and try again.")
  return res.json()
}

export async function savePortfolio(username: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/portfolio?portfolioUsername=${encodeURIComponent(username)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message === "Validation error" ? "Some details aren't valid." : data.message ?? "Couldn't save. Try again.")
  }
}

/** Accepts "github.com/you" as well as full URLs. Returns null if it isn't a usable web link. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (!url.hostname.includes(".") || url.hostname.endsWith(".")) return null
    return url.toString().replace(/\/$/, "")
  } catch {
    return null
  }
}
