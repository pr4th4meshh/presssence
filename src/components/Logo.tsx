import { cn } from "@/lib/utils"

type Tone = "dark" | "light"

const COLORS: Record<Tone, { square: string; letter: string; text: string }> = {
  dark: { square: "#000", letter: "#fff", text: "text-black" },
  light: { square: "#fff", letter: "#000", text: "text-white" },
}

/**
 * The Presssence mark: a lowercase "p" whose bowl is a presence indicator
 * (a ring with a dot), set in a rounded square.
 *
 * Strictly black and white: portfolio themes tint the page colours, so the
 * mark doesn't inherit them. Use tone="light" on dark backgrounds.
 *
 * Drawn on a 32-unit grid. The favicon, app icons and social preview image
 * use the same geometry (see src/app/icon.svg).
 */
export function LogoMark({
  className,
  tone = "dark",
  title,
}: {
  className?: string
  tone?: Tone
  title?: string
}) {
  const { square, letter } = COLORS[tone]
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="8" fill={square} />
      <g fill={letter}>
        <path d="M16 6.4a7.4 7.4 0 1 1 0 14.8a7.4 7.4 0 0 1 0-14.8Zm0 3.6a3.8 3.8 0 1 0 0 7.6a3.8 3.8 0 0 0 0-7.6Z" />
        <circle cx="16" cy="13.8" r="2" />
        <rect x="8.6" y="13.8" width="3.6" height="12" rx="1.8" />
      </g>
    </svg>
  )
}

/** Mark plus the lowercase wordmark. Use as the home link in headers. */
export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  tone = "dark",
}: {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  tone?: Tone
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", COLORS[tone].text, className)}>
      <LogoMark className={markClassName} tone={tone} />
      <span className={cn("text-[17px] font-semibold leading-none tracking-[-0.035em]", wordmarkClassName)}>
        presssence
      </span>
    </span>
  )
}
