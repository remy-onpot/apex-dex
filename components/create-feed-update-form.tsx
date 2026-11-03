"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadFeedImage } from "@/lib/upload-feed-image"

export function CreateFeedUpdateForm() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [isPublishing, setIsPublishing] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) return
    setIsPublishing(true)

    try {
      const imageUrls = await Promise.all(images.map(uploadFeedImage))
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), imageUrls }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to publish update")

      setText("")
      setImages([])
      toast({ description: "Your update is live in the feed." })
      router.push("/desk/feed")
      router.refresh()
    } catch (error) {
      toast({
        title: "Unable to publish update.",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-lg border bg-card p-5">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Share a market update or a note with the students..."
        aria-label="Update text"
        maxLength={5000}
        rows={6}
        required
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-label="Attach images"
            onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 6))}
          />
          <p className="text-xs text-muted-foreground">
            Up to 6 JPG, PNG, or WebP images; 8 MB each.
            {images.length > 0 && ` Selected: ${images.map((image) => image.name).join(", ")}`}
          </p>
        </div>
        <Button type="submit" disabled={isPublishing || !text.trim()}>
          {isPublishing ? "Publishing…" : "Post update"}
        </Button>
      </div>
    </form>
  )
}
