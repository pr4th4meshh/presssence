"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function safeCopy(text: string) {
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }
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
    setUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (open) {
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
    openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)
  }

  function shareX() {
    openWindow(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`)
  }

  function shareWhatsApp() {
    openWindow(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`)
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
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-green-700 text-white w-12 h-12 rounded-xl tracking-wide border-t-0 cursor-pointer hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-green-400"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="share-presence-modal"
      >
        <Share2 />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" id="share-presence-modal">
          <DialogHeader>
            <DialogTitle>Share your Presssence</DialogTitle>
            <DialogDescription>
              Share the current page with friends and followers.
            </DialogDescription>
          </DialogHeader>

          {/* URL copy row */}
          <div className="grid gap-2">
            <Label htmlFor="share-url" className="text-sm font-medium">
              Page URL
            </Label>
            <div className="flex items-stretch gap-2">
              <Input
                id="share-url"
                value={url}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={copyToClipboard}
                className="whitespace-nowrap"
              >
                Copy URL
              </Button>
            </div>
          </div>

          {/* Social buttons */}
          <div>
            <p className="mb-3 text-sm text-muted-foreground">Share via</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <motion.button
                ref={firstBtnRef}
                type="button"
                onClick={shareLinkedIn}
                whileTap={{ scale: 0.96 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
              >
                <span className="grid h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                    <path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
                    <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
                  </svg>
                </span>
                <span className="text-xs font-medium">LinkedIn</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={shareX}
                whileTap={{ scale: 0.96 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
              >
                <span className="grid h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                    <path fill="#212121" fillRule="evenodd" d="M38,42H10c-2.209,0-4-1.791-4-4V10c0-2.209,1.791-4,4-4h28c2.209,0,4,1.791,4,4v28C42,40.209,40.209,42,38,42z" clipRule="evenodd"></path>
                    <path fill="#fff" d="M34.257,34h-6.437L13.829,14h6.437L34.257,34z M28.587,32.304h2.563L19.499,15.696h-2.563 L28.587,32.304z"></path>
                    <polygon fill="#fff" points="15.866,34 23.069,25.656 22.127,24.407 13.823,34"></polygon>
                    <polygon fill="#fff" points="24.45,21.721 25.355,23.01 33.136,14 31.136,14"></polygon>
                  </svg>
                </span>
                <span className="text-xs font-medium">X.com</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={shareWhatsApp}
                whileTap={{ scale: 0.96 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:shadow-sm"
              >
                <span className="grid h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                    <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path>
                    <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path>
                    <path fill="#fff" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd"></path>
                  </svg>
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
                <span className="grid h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <radialGradient id="ig-grad" cx="19.38" cy="42.035" r="44.899" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#fd5"></stop>
                      <stop offset=".328" stopColor="#ff543f"></stop>
                      <stop offset=".348" stopColor="#fc5245"></stop>
                      <stop offset=".504" stopColor="#e64771"></stop>
                      <stop offset=".643" stopColor="#d53e91"></stop>
                      <stop offset=".761" stopColor="#cc39a4"></stop>
                      <stop offset=".841" stopColor="#c837ab"></stop>
                    </radialGradient>
                    <path fill="url(#ig-grad)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20C42.014,38.383,38.417,41.986,34.017,41.99z"></path>
                    <path fill="#fff" d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5s2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"></path>
                    <circle cx="31.5" cy="16.5" r="1.5" fill="#fff"></circle>
                    <path fill="#fff" d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12C37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"></path>
                  </svg>
                </span>
                <span className="text-xs font-medium">Instagram</span>
              </motion.button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Add your own message. Default text: &quot;{shareText}&quot;
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
