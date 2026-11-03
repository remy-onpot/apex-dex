"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadFeedImage } from "@/lib/upload-feed-image"

type ContentKind = "setups" | "lessons" | "announcements"

type ManagedPost = {
  id: string
  title: string
  content: unknown
  imageUrls: unknown
  createdAt: Date
  tradeMetadata: {
    asset: string
    direction: string
    entryPrice: string
    stopLoss: string
    takeProfit: string
  } | null
}

type Draft = {
  title: string
  content: string
  asset: string
  direction: "BUY" | "SELL"
  entryPrice: string
  stopLoss: string
  takeProfit: string
  imageUrls: string[]
}

function contentText(value: unknown) {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return ""

  const blocks = (value as { blocks?: Array<{ data?: { text?: string } }> }).blocks
  return blocks?.map((block) => block.data?.text ?? "").filter(Boolean).join("\n\n") ?? ""
}

function imageList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((url): url is string => typeof url === "string")
}

function createDraft(post: ManagedPost): Draft {
  return {
    title: post.title,
    content: contentText(post.content),
    asset: post.tradeMetadata?.asset ?? "",
    direction: post.tradeMetadata?.direction === "SELL" ? "SELL" : "BUY",
    entryPrice: post.tradeMetadata?.entryPrice ?? "",
    stopLoss: post.tradeMetadata?.stopLoss ?? "",
    takeProfit: post.tradeMetadata?.takeProfit ?? "",
    imageUrls: imageList(post.imageUrls),
  }
}

export function MentorContentManager({
  kind,
  posts,
}: {
  kind: ContentKind
  posts: ManagedPost[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEditing(post: ManagedPost) {
    setEditingId(post.id)
    setDraft(createDraft(post))
    setNewImages([])
  }

  function stopEditing() {
    setEditingId(null)
    setDraft(null)
    setNewImages([])
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
  }

  async function savePost(postId: string) {
    if (!draft) return
    setSavingId(postId)

    try {
      const uploadedUrls = await Promise.all(newImages.map(uploadFeedImage))
      const imageUrls = [...draft.imageUrls, ...uploadedUrls]
      const payload =
        kind === "announcements"
          ? { text: draft.content, imageUrls }
          : {
              title: draft.title,
              content: draft.content,
              imageUrls,
              ...(kind === "setups"
                ? {
                    asset: draft.asset,
                    direction: draft.direction,
                    entryPrice: draft.entryPrice,
                    stopLoss: draft.stopLoss,
                    takeProfit: draft.takeProfit,
                  }
                : {}),
            }

      const response = await fetch(`/api/${kind}/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? "Unable to save changes")

      toast({ description: "Your changes have been saved." })
      stopEditing()
      router.refresh()
    } catch (error) {
      toast({
        title: "Unable to save changes.",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingId(null)
    }
  }

  async function deletePost(post: ManagedPost) {
    const label = kind === "setups" ? "setup" : kind === "lessons" ? "lesson" : "update"
    if (!window.confirm(`Delete this ${label} and its attached images?`)) return

    setDeletingId(post.id)
    try {
      const response = await fetch(`/api/${kind}/${post.id}`, { method: "DELETE" })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? `Unable to delete ${label}`)

      toast({ description: `The ${label} and its images have been deleted.` })
      if (editingId === post.id) stopEditing()
      router.refresh()
    } catch (error) {
      toast({
        title: `Unable to delete ${label}.`,
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
        Nothing has been published here yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isEditing = editingId === post.id && draft !== null
        const imageUrls = isEditing ? draft.imageUrls : imageList(post.imageUrls)

        return (
          <Card key={post.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>{kind === "announcements" ? contentText(post.content).slice(0, 120) : post.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Published {post.createdAt.toLocaleDateString()}
                  {post.tradeMetadata ? ` · ${post.tradeMetadata.asset} ${post.tradeMetadata.direction}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={Boolean(savingId || deletingId)}
                  onClick={() => (isEditing ? stopEditing() : startEditing(post))}
                >
                  {isEditing ? <X className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={Boolean(savingId || deletingId)}
                  onClick={() => deletePost(post)}
                >
                  {deletingId === post.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  Delete
                </Button>
              </div>
            </CardHeader>

            {isEditing && draft && (
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void savePost(post.id)
                  }}
                >
                  {kind !== "announcements" && (
                    <div className="space-y-2">
                      <Label htmlFor={`${post.id}-title`}>Title</Label>
                      <Input
                        id={`${post.id}-title`}
                        value={draft.title}
                        onChange={(event) => updateDraft("title", event.target.value)}
                        required
                      />
                    </div>
                  )}

                  {kind === "setups" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${post.id}-asset`}>Asset</Label>
                        <Input id={`${post.id}-asset`} value={draft.asset} onChange={(event) => updateDraft("asset", event.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${post.id}-direction`}>Direction</Label>
                        <select
                          id={`${post.id}-direction`}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={draft.direction}
                          onChange={(event) => updateDraft("direction", event.target.value as Draft["direction"])}
                        >
                          <option value="BUY">BUY</option>
                          <option value="SELL">SELL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${post.id}-entry`}>Entry</Label>
                        <Input id={`${post.id}-entry`} value={draft.entryPrice} onChange={(event) => updateDraft("entryPrice", event.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${post.id}-stop`}>Stop loss</Label>
                        <Input id={`${post.id}-stop`} value={draft.stopLoss} onChange={(event) => updateDraft("stopLoss", event.target.value)} required />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`${post.id}-target`}>Take profit</Label>
                        <Input id={`${post.id}-target`} value={draft.takeProfit} onChange={(event) => updateDraft("takeProfit", event.target.value)} required />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`${post.id}-content`}>
                      {kind === "announcements" ? "Update text" : kind === "setups" ? "Trade analysis" : "Lesson notes"}
                    </Label>
                    <Textarea
                      id={`${post.id}-content`}
                      rows={kind === "lessons" ? 10 : 6}
                      value={draft.content}
                      onChange={(event) => updateDraft("content", event.target.value)}
                      required
                    />
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <Label>Attached images</Label>
                      <ul className="space-y-2">
                        {imageUrls.map((url) => (
                          <li key={url} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
                            <a href={url} target="_blank" rel="noreferrer" className="truncate text-primary underline">
                              {url.split("/").pop() ?? "Attached image"}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateDraft("imageUrls", draft.imageUrls.filter((item) => item !== url))}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {imageUrls.length + newImages.length < 6 && (
                    <div className="space-y-2">
                      <Label htmlFor={`${post.id}-images`}>Add images</Label>
                      <Input
                        id={`${post.id}-images`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(event) => {
                          const available = 6 - imageUrls.length
                          setNewImages(Array.from(event.target.files ?? []).slice(0, available))
                        }}
                      />
                      <p className="text-xs text-muted-foreground">JPG, PNG, or WebP; up to 8 MB each and 6 total.</p>
                    </div>
                  )}

                  <Button type="submit" disabled={savingId === post.id}>
                    {savingId === post.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                    {savingId === post.id ? "Saving…" : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
