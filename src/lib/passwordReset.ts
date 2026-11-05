import "server-only"
import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

/**
 * Reset tokens live in NextAuth's VerificationToken table (unused otherwise,
 * since there is no email sign-in provider), keyed by a prefixed identifier.
 *
 * Only a SHA-256 hash of the token is stored. The raw token exists in the
 * email alone, so someone who can read the database still can't use it.
 */
const PREFIX = "password-reset:"
export const RESET_TOKEN_TTL_MINUTES = 60

const hash = (token: string) => createHash("sha256").update(token).digest("hex")

/** Creates a fresh token for the user, cancelling any earlier ones. */
export async function createResetToken(userId: string) {
  const token = randomBytes(32).toString("base64url")
  const identifier = PREFIX + userId
  await prisma.verificationToken.deleteMany({ where: { identifier } })
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hash(token),
      expires: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    },
  })
  return token
}

/** The user a token belongs to, or null if it's unknown, used or expired. Doesn't use it up. */
export async function findResetToken(token: string) {
  if (!token || token.length > 100) return null
  const row = await prisma.verificationToken.findUnique({ where: { token: hash(token) } })
  if (!row || !row.identifier.startsWith(PREFIX) || row.expires < new Date()) return null
  return { userId: row.identifier.slice(PREFIX.length), identifier: row.identifier }
}

/**
 * Uses the token up. The delete is the check: if two requests race with the
 * same token, only one of them deletes the row, so it works exactly once.
 */
export async function consumeResetToken(token: string) {
  const found = await findResetToken(token)
  if (!found) return null
  const { count } = await prisma.verificationToken.deleteMany({ where: { token: hash(token) } })
  if (count !== 1) return null
  // Any other outstanding links for this user stop working too.
  await prisma.verificationToken.deleteMany({ where: { identifier: found.identifier } })
  return found.userId
}
