import "server-only"

interface Email {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * Sends through Resend's HTTP API (no SDK needed). Set RESEND_API_KEY and
 * EMAIL_FROM, e.g. "Presssence <hello@yourdomain.com>".
 *
 * Without a key in development the email is printed to the server log so the
 * flow can be tested locally. In production a missing key is an error: never
 * log emails there, since they can contain sign-in links.
 */
export async function sendEmail({ to, subject, text, html }: Email) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[email] To: ${to}\n[email] Subject: ${subject}\n\n${text}\n`)
      return
    }
    throw new Error("RESEND_API_KEY is not set, so emails can't be sent")
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Presssence <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    }),
  })
  if (!res.ok) throw new Error(`Email provider returned ${res.status}: ${await res.text()}`)
}
