import { socialIcons } from "../portfolioSocials/SocialMediaIcons"

export type Platform = keyof typeof socialIcons

export const PLATFORMS: Array<{ id: Platform; label: string; prefix: string; hosts: string[] }> = [
  { id: "github", label: "GitHub", prefix: "github.com/", hosts: ["github.com"] },
  { id: "linkedin", label: "LinkedIn", prefix: "linkedin.com/in/", hosts: ["linkedin.com"] },
  { id: "twitter", label: "X / Twitter", prefix: "x.com/", hosts: ["x.com", "twitter.com"] },
  { id: "instagram", label: "Instagram", prefix: "instagram.com/", hosts: ["instagram.com"] },
  { id: "youtube", label: "YouTube", prefix: "youtube.com/@", hosts: ["youtube.com", "youtu.be"] },
  { id: "medium", label: "Medium", prefix: "medium.com/@", hosts: ["medium.com"] },
  { id: "dribbble", label: "Dribbble", prefix: "dribbble.com/", hosts: ["dribbble.com"] },
  { id: "behance", label: "Behance", prefix: "behance.net/", hosts: ["behance.net"] },
  { id: "figma", label: "Figma", prefix: "figma.com/@", hosts: ["figma.com"] },
  { id: "awwwards", label: "Awwwards", prefix: "awwwards.com/", hosts: ["awwwards.com"] },
  { id: "spotify", label: "Spotify", prefix: "open.spotify.com/user/", hosts: ["open.spotify.com", "spotify.com"] },
  { id: "website", label: "Website", prefix: "", hosts: [] },
]

export const platformLabel = (id: string) => PLATFORMS.find((p) => p.id === id)?.label ?? id

/** Any link from a site we don't recognise is saved as the personal website. */
export function detectPlatform(url: string): Platform {
  const host = new URL(url).hostname.replace(/^www\./, "")
  const match = PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)))
  return match?.id ?? "website"
}
