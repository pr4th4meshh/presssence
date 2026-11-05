"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FaExternalLinkAlt } from "react-icons/fa"
import { Pencil, X } from "lucide-react"
import { toast } from "sonner"
import SocialMediaCard from "./portfolioSocials/SocialMediaCard"
import { socialIcons } from "./portfolioSocials/SocialMediaIcons"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { getUsernameFromUrl } from "@/utils/getUsernameFromUrl"
import { getSpotifyUserIdFromUrl } from "@/utils/getSpotifyUserIdFromUrl"
import { openAddDialog } from "./addDialogEvents"
import SocialForm from "./addDialogs/SocialForm"
import { readSocials, updateSocials, type SocialState } from "./addDialogs/api"
import { platformLabel } from "./addDialogs/platforms"

interface SocialProfile {
  displayName?: string
  followers?: number
  avatar?: string
  profileUrl?: string
  bio?: string
  following?: number
  name?: string
  username?: string
}

interface SocialMetadata {
  platform: string
  username?: string
  spotifyUserId?: string
  github?: SocialProfile
  spotifyData?: SocialProfile
  [key: string]: any
}

interface PortfolioSocialsProps {
  socialMediaLinksViaPortfolio: {
    userId: string
    socialMedia?: {
      [platform: string]: string | { order?: string[] }
    }
  }
}

const isLocalhost = (url: string) => /^https?:\/\/localhost(:\d+)?/i.test(url)

/** Saved links minus leftovers from local testing. */
function visibleSocials(raw: Record<string, unknown> | undefined): SocialState {
  const { links, order } = readSocials(raw)
  for (const [platform, url] of Object.entries(links)) if (isLocalhost(url)) delete links[platform]
  return { links, order: order.filter((p) => links[p]) }
}

const PortfolioSocials: React.FC<PortfolioSocialsProps> = ({ socialMediaLinksViaPortfolio }) => {
  const [socials, setSocials] = useState<SocialState>(() => visibleSocials(socialMediaLinksViaPortfolio?.socialMedia))
  const [editing, setEditing] = useState<{ platform: string; url: string } | null>(null)
  const [metadataList, setMetadataList] = useState<SocialMetadata[]>([])

  const { data: session } = useSession()
  const params = useParams<{ portfolioUsername: string }>()
  const username = params.portfolioUsername
  const isOwner = session?.user?.id === socialMediaLinksViaPortfolio?.userId

  // Re-sync when the page refetches (e.g. after adding from the toolbar).
  useEffect(() => {
    setSocials(visibleSocials(socialMediaLinksViaPortfolio?.socialMedia))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(socialMediaLinksViaPortfolio?.socialMedia)])

  // Profile details (handle, followers) for the cards.
  useEffect(() => {
    for (const [platform, url] of Object.entries(socials.links)) {
      const handle = getUsernameFromUrl(platform, url)
      const spotifyUserId = getSpotifyUserIdFromUrl(url)
      if (!handle && !spotifyUserId) continue
      if (metadataList.some((m) => m.platform === platform && m.username === handle)) continue
      fetch(
        `/api/socialMediaInfo?platform=${encodeURIComponent(platform)}&username=${encodeURIComponent(handle || "")}&spotifyUserId=${encodeURIComponent(spotifyUserId || "")}`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((metadata) => {
          if (!metadata) return
          setMetadataList((prev) => [
            ...prev.filter((m) => m.platform !== platform),
            { platform, username: handle || undefined, ...metadata },
          ])
        })
        .catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(socials.links)])

  /**
   * Shows the change straight away, applies it to the saved links (not this
   * tab's copy), then shows the result. Rolls back if the save fails.
   */
  const apply = async (local: SocialState, change: (current: SocialState) => SocialState, failure: string) => {
    const previous = socials
    setSocials(local)
    try {
      setSocials(await updateSocials(username, change))
      return true
    } catch {
      setSocials(previous)
      toast.error(failure)
      return false
    }
  }

  const without = (state: SocialState, platform: string): SocialState => {
    const links = { ...state.links }
    delete links[platform]
    return { links, order: state.order.filter((p) => p !== platform) }
  }

  const remove = async (platform: string) => {
    const url = socials.links[platform]
    const index = socials.order.indexOf(platform)
    const label = platformLabel(platform)
    const ok = await apply(without(socials, platform), (current) => without(current, platform), `Couldn't remove ${label}. Try again.`)
    if (!ok) return
    toast(`Removed ${label}`, {
      action: {
        label: "Undo",
        onClick: () => {
          const restore = (state: SocialState): SocialState => {
            if (state.links[platform]) return state
            const order = state.order.filter((p) => p !== platform)
            order.splice(Math.min(index, order.length), 0, platform)
            return { links: { ...state.links, [platform]: url }, order }
          }
          apply(restore(without(socials, platform)), restore, `Couldn't bring back ${label}.`)
        },
      },
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return
    const order = Array.from(socials.order)
    const [moved] = order.splice(result.source.index, 1)
    order.splice(result.destination.index, 0, moved)
    apply(
      { ...socials, order },
      (current) => ({
        links: current.links,
        order: [...order.filter((p) => current.links[p]), ...current.order.filter((p) => !order.includes(p))],
      }),
      "Couldn't save the new order. Try again."
    )
  }

  const items = socials.order.map((platform) => ({ platform, url: socials.links[platform] }))

  if (!isOwner && items.length === 0) return null

  const card = (platform: string, url: string) => {
    const Icon = socialIcons[platform as keyof typeof socialIcons] || FaExternalLinkAlt
    const metadata = metadataList.find((item) => item.platform === platform)
    return (
      <SocialMediaCard
        platform={platform}
        label={platformLabel(platform)}
        url={url}
        icon={Icon}
        metadata={{ platform, username: metadata?.username, ...metadata }}
      />
    )
  }

  return (
    <div className="section-border py-10 border-t border-border">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Connect
        </h2>
        {isOwner && items.length > 0 && (
          <div className="flex items-baseline gap-4">
            {items.length > 1 && <p className="hidden text-xs text-muted-foreground sm:block">Drag to reorder</p>}
            <button
              type="button"
              onClick={() => openAddDialog("social")}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              + Add link
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <p className="text-center text-sm text-muted-foreground">
            No links yet. Add your profiles so visitors can find you.
          </p>
          <button
            type="button"
            onClick={() => openAddDialog("social")}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            + Add a link
          </button>
        </div>
      ) : !isOwner ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ platform, url }) => (
            <div key={platform}>{card(platform, url)}</div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="socials" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {items.map(({ platform, url }, index) => {
                  const label = platformLabel(platform)
                  return (
                    <Draggable key={platform} draggableId={`social-${platform}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`group/card relative rounded-2xl transition-shadow ${snapshot.isDragging ? "shadow-xl" : ""}`}
                        >
                          {card(platform, url)}
                          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/card:opacity-100 [@media(hover:none)]:opacity-100">
                            <button
                              type="button"
                              onClick={() => setEditing({ platform, url })}
                              aria-label={`Edit ${label} link`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(platform)}
                              aria-label={`Remove ${label}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:border-red-300 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-[460px]">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Edit {platformLabel(editing.platform)} link</DialogTitle>
                <DialogDescription>Update where this card points.</DialogDescription>
              </DialogHeader>
              <SocialForm
                key={editing.platform}
                username={username}
                initialLinks={socialMediaLinksViaPortfolio?.socialMedia}
                editing={editing}
                onSaved={setSocials}
                onDone={() => setEditing(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PortfolioSocials
