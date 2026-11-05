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

/**
 * Applies a change to the skills as they are saved right now, not as this tab
 * last saw them, so edits made elsewhere since the page loaded survive.
 */
export async function updateFeatures(username: string, change: (current: string[]) => string[]) {
  const current = await fetchCurrent(username)
  const next = change(current.features ?? [])
  await savePortfolio(username, { features: next })
  return next
}

export interface SocialState {
  links: Record<string, string>
  order: string[]
}

/** Saved links as a clean map plus an order that covers every link exactly once. */
export function readSocials(raw: Record<string, unknown> | null | undefined): SocialState {
  const links: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (key !== "order" && typeof value === "string" && value.trim()) links[key] = value.trim()
  }
  const savedOrder = Array.isArray(raw?.order) ? (raw!.order as string[]) : []
  const order = [...savedOrder.filter((p) => links[p]), ...Object.keys(links).filter((p) => !savedOrder.includes(p))]
  return { links, order: Array.from(new Set(order)) }
}

/** Same idea as updateFeatures, for links and their order. */
export async function updateSocials(username: string, change: (current: SocialState) => SocialState) {
  const current = await fetchCurrent(username)
  const next = change(readSocials(current.socialMedia))
  const order = next.order.filter((p) => next.links[p])
  await savePortfolio(username, { socialLinks: next.links, socialLinksOrder: order })
  return { links: next.links, order }
}
