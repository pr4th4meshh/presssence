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
 * Every step is a single conditional write, so concurrent requests can't both
 * read "count = limit - 1" and both get through. The filter *is* the check:
 * Mongo applies the filter and the increment atomically on one document.
 *
 * Known trade-off: a burst straddling the window boundary can briefly allow 2x
 * the limit. Fine for abuse prevention, not for billing accuracy.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  attempt = 0
): Promise<RateLimitResult> {
  const now = new Date()

  // 1. Live window with room left: increment only if still under the limit.
  const incremented = await prisma.aiRateLimit.updateMany({
    where: { key, windowEnd: { gt: now }, count: { lt: limit } },
    data: { count: { increment: 1 } },
  })
  if (incremented.count === 1) {
    const row = await prisma.aiRateLimit.findUnique({ where: { key } })
    return { allowed: true, remaining: Math.max(0, limit - (row?.count ?? limit)), retryAfter: 0 }
  }

  // 2. Expired window: reset it. Only one concurrent request can win this,
  //    because the others no longer match `windowEnd <= now` afterwards.
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000)
  const reset = await prisma.aiRateLimit.updateMany({
    where: { key, windowEnd: { lte: now } },
    data: { count: 1, windowEnd },
  })
  if (reset.count === 1) {
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  const existing = await prisma.aiRateLimit.findUnique({ where: { key } })

  // 3. No row yet: create it. The unique index on `key` means a concurrent
  //    create fails with P2002; retry so that request goes through step 1.
  if (!existing) {
    try {
      await prisma.aiRateLimit.create({ data: { key, count: 1, windowEnd } })
      return { allowed: true, remaining: limit - 1, retryAfter: 0 }
    } catch (error) {
      if ((error as { code?: string }).code === "P2002" && attempt < 2) {
        return checkRateLimit(key, limit, windowSeconds, attempt + 1)
      }
      throw error
    }
  }

  // A concurrent request reset the window between our steps; try again.
  if (existing.windowEnd > now && existing.count < limit && attempt < 2) {
    return checkRateLimit(key, limit, windowSeconds, attempt + 1)
  }

  // 4. Live window, limit reached.
  const retryAfter = Math.max(1, Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000))
  return { allowed: false, remaining: 0, retryAfter }
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
