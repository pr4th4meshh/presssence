import { v2 as cloudinary } from "cloudinary"
import { NextRequest, NextResponse } from "next/server"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "presssence"

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

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
