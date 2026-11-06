"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AtSign, Check, FolderPlus, Palette, Sparkles, type LucideIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SharePresssenceButton from "./SharePresssenceButton"
import { onOpenAddDialog } from "./addDialogEvents"
import SocialForm from "./addDialogs/SocialForm"
import SkillsForm from "./addDialogs/SkillsForm"
import ProjectForm from "./addDialogs/ProjectForm"

type AddItemType = "social" | "feature" | "project"

// Preview colours mirror the [data-theme] values in globals.css.
const THEMES = [
  { id: "modern", label: "Modern", preview: "bg-[#f5f5f5] border-[#e0e0e0]", dot: "bg-[#444]", desc: "Clean & minimal" },
  { id: "creative", label: "Creative", preview: "bg-[#f2ebff] border-[#7c3aed]/30", dot: "bg-[#7c3aed]", desc: "Lilac with violet" },
  { id: "professional", label: "Pro", preview: "bg-[#e8f0fa] border-[#b45309]/25", dot: "bg-[#b45309]", desc: "Steel blue with amber" },
  { id: "bold", label: "Bold", preview: "bg-[#e8f9f4] border-[#0d9488]/25", dot: "bg-[#0d9488]", desc: "Mint with teal" },
]

const ADD_ITEMS: Array<{ type: AddItemType; icon: LucideIcon; label: string; title: string; description: string }> = [
  {
    type: "social",
    icon: AtSign,
    label: "Add a link",
    title: "Add a link",
    description: "Link your profiles so visitors can find you elsewhere.",
  },
  {
    type: "feature",
    icon: Sparkles,
    label: "Add skills",
    title: "Add skills",
    description: "Add as many as you like. They show up in the Skills section.",
  },
  {
    type: "project",
    icon: FolderPlus,
    label: "Add a project",
    title: "Add a project",
    description: "Only the title is required. You can edit everything later from the page.",
  },
]

interface FloatingDockProps {
  userId: string
  socialMediaLinks: Record<string, unknown> | undefined
  features: string[] | undefined
  projects: unknown[] | undefined
  onUpdate: (type: AddItemType, newData: unknown) => void
  refetchData: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

/** A dock button with a label that shows on hover and keyboard focus. */
function DockButton({
  label,
  icon: Icon,
  onClick,
  pressed,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  pressed?: boolean
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={pressed}
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
          pressed ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-foreground/10"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}

const FloatingAddButton = ({
  socialMediaLinks,
  features,
  onUpdate,
  refetchData,
  currentTheme = "modern",
  onThemeChange,
}: FloatingDockProps) => {
  const [addType, setAddType] = useState<AddItemType | null>(null)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const params = useParams<{ portfolioUsername: string }>()
  const username = params.portfolioUsername

  useEffect(() => onOpenAddDialog((type) => setAddType(type)), [])

  const active = ADD_ITEMS.find((i) => i.type === addType)
  const close = () => setAddType(null)
  const saved = (type: AddItemType) => (data: unknown) => {
    onUpdate(type, data)
    refetchData()
  }

  return (
    <>
      <Dialog open={isThemeOpen} onOpenChange={setIsThemeOpen}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Choose a theme</DialogTitle>
            <DialogDescription>Visitors see the change straight away.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {THEMES.map((t) => {
              const isActive = currentTheme === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    onThemeChange?.(t.id)
                    setIsThemeOpen(false)
                  }}
                  className={`relative rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
                    isActive ? "border-foreground" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className={`mb-2 flex h-14 w-full flex-col justify-center gap-1.5 rounded-lg border px-3 ${t.preview}`} aria-hidden>
                    <div className="h-1.5 w-12 rounded-full bg-black/70" />
                    <div className="flex gap-1">
                      <div className={`h-2.5 w-7 rounded-full opacity-40 ${t.dot}`} />
                      <div className={`h-2.5 w-5 rounded-full opacity-40 ${t.dot}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${t.dot}`} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                  {isActive && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                      <Check size={11} className="text-background" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[520px] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
                <DialogDescription>{active.description}</DialogDescription>
              </DialogHeader>
              {/* Each form mounts fresh when the dialog opens, so nothing carries over from last time. */}
              {active.type === "social" && (
                <SocialForm
                  username={username}
                  initialLinks={socialMediaLinks}
                  onSaved={(s) => saved("social")({ ...s.links, order: s.order })}
                  onDone={close}
                />
              )}
              {active.type === "feature" && (
                <SkillsForm username={username} existing={features ?? []} onSaved={saved("feature")} onDone={close} />
              )}
              {active.type === "project" && (
                <ProjectForm username={username} onSaved={saved("project")} onDone={close} />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div
          role="toolbar"
          aria-label="Edit your portfolio"
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-xl"
        >
          <SharePresssenceButton />
          <DockButton label="Change theme" icon={Palette} onClick={() => setIsThemeOpen(true)} pressed={isThemeOpen} />
          <div className="mx-0.5 h-8 w-px bg-border" aria-hidden />
          {ADD_ITEMS.map((item) => (
            <DockButton
              key={item.type}
              label={item.label}
              icon={item.icon}
              onClick={() => setAddType(item.type)}
              pressed={addType === item.type}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default FloatingAddButton
