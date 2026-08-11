import "server-only"
import { prisma } from "@/lib/prisma"

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  /** Seconds until reset. Send as Retry-After on a 429. */
  retryAfter: number
}

/**
 * Fixed-window counter, Mongo-backed to avoid a Redis dependency.
 *
 * Known trade-off: a burst straddling the window boundary can briefly allow 2x
 * the limit. Fine for abuse prevention, not for billing accuracy.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date()
  const existing = await prisma.aiRateLimit.findUnique({ where: { key } })

  if (!existing || existing.windowEnd <= now) {
    const windowEnd = new Date(now.getTime() + windowSeconds * 1000)
    await prisma.aiRateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowEnd },
      update: { count: 1, windowEnd },
    })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  const retryAfter = Math.max(1, Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000))

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter }
  }

  const updated = await prisma.aiRateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  })

  return { allowed: true, remaining: Math.max(0, limit - updated.count), retryAfter }
}

/**
 * Best-effort identity for anonymous endpoints. x-forwarded-for is
 * client-settable, so this stops accidental hammering, not a determined
 * attacker — that needs auth or edge-level protection.
 */
export function getClientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  return `${scope}:${ip}`
}
