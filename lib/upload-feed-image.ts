export async function uploadFeedImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/feed/images", {
    method: "POST",
    body: formData,
  })
  const result = (await response.json()) as { url?: string; error?: string }

  if (!response.ok || !result.url) {
    throw new Error(result.error || "Unable to upload image")
  }

  return result.url
}
