import { AiValidationError } from "@/lib/ai/provider"
import { checkRateLimit } from "@/lib/ai/rateLimit"
import { extractResume } from "@/lib/ai/resume"
import { authOptions } from "@/lib/serverAuth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

/** Vercel caps serverless request bodies around 4.5MB. */
const MAX_BYTES = 4 * 1024 * 1024
const ACCEPTED = ["application/pdf", "text/plain", "text/markdown"]

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const limit = await checkRateLimit(`resume:${session.user.id}`, 5, 3600)
    if (!limit.allowed) {
      return NextResponse.json(
        { message: `Too many imports. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: "File is too large. Maximum size is 4MB." }, { status: 400 })
    }
    // Declared type is client-controlled, so this is a filter rather than a
    // guard — the bytes go to an extraction model, not a parser or the disk.
    if (!ACCEPTED.includes(file.type)) {
      return NextResponse.json(
        { message: "Unsupported file type. Upload a PDF, .txt, or .md file." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const result =
      file.type === "application/pdf"
        ? await extractResume({ base64: buffer.toString("base64"), mimeType: file.type })
        : await extractResume({ text: buffer.toString("utf-8") })

    return NextResponse.json({ data: result.data, usage: result.usage }, { status: 200 })
  } catch (error) {
    // 422 not 500: the model failed, not the server. Lets the UI say "try a
    // different file" rather than "something went wrong".
    if (error instanceof AiValidationError) {
      console.error("Resume extraction validation failed:", error.message)
      return NextResponse.json(
        { message: "Could not read that resume. Try a different file or fill the form manually." },
        { status: 422 }
      )
    }
    console.error("Error importing resume:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
