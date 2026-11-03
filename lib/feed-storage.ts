const storageBaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/+$/, "")
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "posts"

function requireStorageConfig() {
  if (!storageBaseUrl || !serviceRoleKey) {
    throw new Error("Supabase Storage is not configured")
  }

  return { storageBaseUrl, serviceRoleKey, storageBucket }
}

function storageObjectPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/")
}

export async function uploadFeedImage(path: string, file: File) {
  const config = requireStorageConfig()
  const response = await fetch(
    `${config.storageBaseUrl}/storage/v1/object/${encodeURIComponent(config.storageBucket)}/${storageObjectPath(path)}`,
    {
      method: "POST",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "Content-Type": file.type,
        "Cache-Control": "max-age=3600",
        "x-upsert": "false",
      },
      body: file,
    }
  )

  if (!response.ok) {
    throw new Error("Unable to upload image to Supabase Storage")
  }
}

export function publicFeedImageUrl(path: string) {
  const baseUrl = storageBaseUrl
  if (!baseUrl) throw new Error("Supabase Storage is not configured")
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/${storageObjectPath(path)}`
}

export function isOwnedFeedImageUrl(url: string, userId: string) {
  try {
    const parsed = new URL(url)
    const expectedPrefix = `${storageBaseUrl}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/feed/${encodeURIComponent(userId)}/`
    return Boolean(storageBaseUrl) && url.startsWith(expectedPrefix) && parsed.protocol === "https:"
  } catch {
    return false
  }
}
