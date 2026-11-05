import { NextResponse, after } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientKey } from "@/lib/ai/rateLimit"
import { sendEmail } from "@/lib/email"
import { createResetToken, RESET_TOKEN_TTL_MINUTES } from "@/lib/passwordReset"

const Body = z.object({ email: z.string().trim().toLowerCase().email() })

function resetEmail(link: string, hasPassword: boolean, base: string) {
  const action = hasPassword ? "reset your password" : "set a password"
  const intro = hasPassword
    ? "Someone asked to reset the password for your Presssence account."
    : "Someone asked to reset the password for your Presssence account. You sign in with Google, so there's no password yet. You can set one with this link, and Google sign-in keeps working."
  const outro = `The link works once and expires in ${RESET_TOKEN_TTL_MINUTES} minutes. If you didn't ask for this, ignore this email and nothing will change.`
  return {
    subject: hasPassword ? "Reset your Presssence password" : "Set a password for Presssence",
    text: `${intro}\n\nUse this link to ${action}:\n${link}\n\n${outro}`,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;color:#171717;line-height:1.5">
  <p style="margin:0 0 20px"><img src="${base}/brand/mark.png" width="32" height="32" alt="" style="vertical-align:middle;border:0;border-radius:8px"> <span style="font-size:18px;font-weight:600;letter-spacing:-0.03em;vertical-align:middle;margin-left:6px">presssence</span></p>
  <p>${intro}</p>
  <p style="margin:24px 0"><a href="${link}" style="background:#171717;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block">${hasPassword ? "Reset password" : "Set a password"}</a></p>
  <p style="color:#737373;font-size:14px">${outro}</p>
  <p style="color:#a3a3a3;font-size:12px;word-break:break-all">Or paste this into your browser: ${link}</p>
</div>`,
  }
}

/**
 * Always answers the same way, whether or not the email has an account, so
 * this form can't be used to find out who has signed up. The email is sent
 * after the response so the reply time doesn't give it away either.
 */
export async function POST(req: Request) {
  const ok = NextResponse.json({ ok: true })
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ message: "Enter a valid email address" }, { status: 400 })
    }
    const { email } = parsed.data

    const byIp = await checkRateLimit(getClientKey(req, "pwreset"), 5, 15 * 60)
    if (!byIp.allowed) {
      return NextResponse.json(
        { message: "Too many requests. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(byIp.retryAfter) } }
      )
    }
    // Per address too, so nobody can flood one inbox from many IPs. Answers
    // like a success to keep this from revealing anything.
    const byEmail = await checkRateLimit(`pwreset:email:${email}`, 3, 60 * 60)
    if (!byEmail.allowed) return ok

    after(async () => {
      try {
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: { id: true, email: true, password: true },
        })
        if (!user?.email) return
        const token = await createResetToken(user.id)
        const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin
        const link = `${base}/auth/reset-password?token=${token}`
        await sendEmail({ to: user.email, ...resetEmail(link, Boolean(user.password), base) })
      } catch (error) {
        console.error("Password reset email failed:", error)
      }
    })

    return ok
  } catch (error) {
    console.error("Password reset request failed:", error)
    return NextResponse.json({ message: "Something went wrong. Try again." }, { status: 500 })
  }
}
