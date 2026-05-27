export async function uploadToCloudinary(file: File, folder = "presssence"): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)

  const res = await fetch("/api/upload", { method: "POST", body: formData })
  if (!res.ok) throw new Error("Image upload failed")

  const { url } = await res.json()
  return url as string
}
