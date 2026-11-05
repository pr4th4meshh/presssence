"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UsernameSchema } from "@/lib/validations"

interface SettingsViewProps {
  name: string
  email: string
  signInMethods: string[]
  username: string | null
}

function Section({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string
  description: string
  children: React.ReactNode
  tone?: "default" | "danger"
}) {
  return (
    <section
      className={`rounded-2xl border bg-card p-6 sm:p-8 ${
        tone === "danger" ? "border-red-500/30" : "border-border"
      }`}
    >
      <h2 className={`text-base font-semibold ${tone === "danger" ? "text-red-600" : ""}`}>{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function SettingsView({ name, email, signInMethods, username }: SettingsViewProps) {
  const router = useRouter()
  const [newUsername, setNewUsername] = useState(username ?? "")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [savingUsername, setSavingUsername] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [deleting, setDeleting] = useState(false)

  const usernameChanged = username !== null && newUsername !== username

  const saveUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = UsernameSchema.safeParse(newUsername)
    if (!result.success) {
      setUsernameError(result.error.issues[0]?.message ?? "Invalid username")
      return
    }
    setSavingUsername(true)
    setUsernameError(null)
    try {
      const res = await fetch("/api/portfolio/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: result.data }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUsernameError(data.message ?? "Couldn't change your username")
        return
      }
      toast.success(`Your portfolio now lives at presssence.me/${data.username}`)
      router.refresh()
    } catch {
      setUsernameError("Couldn't reach the server. Please try again.")
    } finally {
      setSavingUsername(false)
    }
  }

  const deleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmEmail }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message ?? "Couldn't delete your account")
        return
      }
      toast.success("Your account has been deleted")
      await signOut({ callbackUrl: "/" })
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href={username ? `/${username}` : "/"}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            {username ? "Back to portfolio" : "Home"}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:py-14">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account and portfolio.</p>
        </div>

        <Section title="Account" description="How you sign in to Presssence.">
          <dl className="grid gap-4 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{name || "—"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium break-all">{email}</dd>
            <dt className="text-muted-foreground">Sign-in method</dt>
            <dd className="font-medium">{signInMethods.join(", ") || "—"}</dd>
          </dl>
        </Section>

        <Section
          title="Portfolio URL"
          description="Changing this breaks links you've already shared to the old address."
        >
          {username ? (
            <form onSubmit={saveUsername} className="space-y-3" noValidate>
              <Label htmlFor="username">Username</Label>
              <div className="flex items-stretch overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
                <span className="flex items-center border-r border-input bg-muted px-3 text-sm text-muted-foreground">
                  presssence.me/
                </span>
                <input
                  id="username"
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    setUsernameError(null)
                  }}
                  autoComplete="off"
                  maxLength={20}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>
              {usernameError && (
                <p role="alert" className="text-xs text-red-500">
                  {usernameError}
                </p>
              )}
              <div className="flex items-center justify-between gap-3 pt-1">
                <Link
                  href={`/${username}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View portfolio <ExternalLink size={12} />
                </Link>
                <Button type="submit" size="sm" disabled={!usernameChanged || savingUsername}>
                  {savingUsername && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                  Save URL
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">You haven&apos;t created a portfolio yet.</p>
              <Button asChild size="sm">
                <Link href="/onboarding">Create portfolio</Link>
              </Button>
            </div>
          )}
        </Section>

        <Section
          title="Delete account"
          description="Permanently deletes your account, portfolio, projects, posts and photos. This can't be undone."
          tone="danger"
        >
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete my account
          </Button>
        </Section>
      </main>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setConfirmEmail("")
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Everything goes: your portfolio{username ? ` at presssence.me/${username}` : ""}, projects,
              posts and photos. Type <span className="font-medium text-foreground">{email}</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={email}
            autoComplete="off"
            aria-label="Type your email to confirm"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={deleting || confirmEmail.trim().toLowerCase() !== email.toLowerCase()}
            >
              {deleting && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
