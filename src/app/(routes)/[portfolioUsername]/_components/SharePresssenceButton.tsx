"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FiX } from "react-icons/fi"
import { Label } from "@/components/ui/label"

function safeCopy(text: string) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
  // Fallback
  const ta = document.createElement("textarea")
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand("copy")
  document.body.removeChild(ta)
  return Promise.resolve()
}

export default function SharePresssenceButton() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const firstBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    // Only on client
    setUrl(window.location.href)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    if (open) {
      // Focus the first interactive element
      setTimeout(() => firstBtnRef.current?.focus(), 50)
    }
  }, [open])

  const shareText = "Check out my Presssence ✨"
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(shareText)

  function openWindow(href: string) {
    window.open(href, "_blank", "noopener,noreferrer")
  }

  function shareLinkedIn() {
    const href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    openWindow(href)
  }

  function shareX() {
    const href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    openWindow(href)
  }

  function shareWhatsApp() {
    const href = `https://wa.me/?text=${encodeURIComponent(
      `${shareText} ${url}`
    )}`
    openWindow(href)
  }

  async function shareInstagram() {
    await safeCopy(`${shareText} ${url}`)
    toast("Copied URL for Instagram. Paste it into your caption or story.")
    openWindow("https://www.instagram.com/")
  }

  async function copyToClipboard() {
    await safeCopy(url)
    toast("Copied URL!")
  }

  return (
    <>
      {/* Rotated share trigger */}
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute sm:fixed transform -rotate-90 bg-green-600 text-white origin-top-left top-[350px] z-50 left-0 py-1 px-2 sm:px-4 rounded-b-lg rounded-t-none sm:py-1 text-sm sm:text-lg tracking-wide border-t-0 cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-green-400"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="share-presence-modal"
      >
        Share your Presssence
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.button
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ willChange: "opacity" }}
              className="fixed inset-0 z-[70] bg-black/50"
              onClick={() => setOpen(false)}
            />

            {/* Dialog panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 16 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{ willChange: "transform, opacity" }}
              className="fixed inset-0 z-[80] grid place-items-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 460, damping: 22 },
                }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                className="w-full max-w-lg rounded-2xl border border-neutral-200/70 dark:border-neutral-800/60 bg-white dark:bg-dark backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Share your Presssence
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Share the current page with friends and followers.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      className="rounded-full px-3 py-1.5 text-sm font-medium"
                    >
                      <FiX />
                    </Button>
                  </div>

                  {/* URL copy row */}
                  <div className="mt-5 grid gap-2">
                    <Label htmlFor="share-url" className="text-sm font-medium">
                      Page URL
                    </Label>
                    <div className="flex items-stretch gap-2">
                      <Input
                        id="share-url"
                        value={url}
                        readOnly
                        className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={copyToClipboard}
                        className="whitespace-nowrap rounded-lg bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>

                  {/* Social buttons */}
                  <div className="mt-6">
                    <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
                      Share via
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <motion.button
                        ref={firstBtnRef}
                        type="button"
                        onClick={shareLinkedIn}
                        whileTap={{ scale: 0.96 }}
                        className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0A66C2] text-white text-sm font-bold">
                          in
                        </span>
                        <span className="text-xs font-medium">LinkedIn</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={shareX}
                        whileTap={{ scale: 0.96 }}
                        className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-white text-base font-bold">
                          X
                        </span>
                        <span className="text-xs font-medium">X</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={shareWhatsApp}
                        whileTap={{ scale: 0.96 }}
                        className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white text-base font-bold">
                          WA
                        </span>
                        <span className="text-xs font-medium">WhatsApp</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={shareInstagram}
                        whileTap={{ scale: 0.96 }}
                        className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
                        title="Instagram doesn't support direct web sharing. We'll copy the URL and open Instagram."
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white text-sm font-bold">
                          IG
                        </span>
                        <span className="text-xs font-medium">Instagram</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Footer helper note */}
                  <p className="mt-4 text-xs text-neutral-500">
                    Tip: Add your own message. Default text: “{shareText}”
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
