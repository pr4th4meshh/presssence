import { v2 as cloudinary } from "cloudinary"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/serverAuth"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const ALLOWED_FOLDERS = new Set([
  "presssence",
  "presssence/profiles",
  "presssence/gallery",
  "presssence/projects",
  "presssence/blogs",
])

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    const requestedFolder = formData.get("folder")

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Only JPEG, PNG, WebP or GIF images are allowed" },
        { status: 415 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File must be 5 MB or smaller" }, { status: 413 })
    }

    const folder =
      typeof requestedFolder === "string" && ALLOWED_FOLDERS.has(requestedFolder)
        ? requestedFolder
        : "presssence"

    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type: "image" }, (error, res) => {
            if (error || !res) reject(error ?? new Error("Upload failed"))
            else resolve(res as { secure_url: string; public_id: string })
          })
          .end(buffer)
      }
    )

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id })
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    return NextResponse.json({ message: "Upload failed" }, { status: 500 })
  }
}
