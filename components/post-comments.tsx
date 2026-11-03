"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Comment = { id: string; content: string; author: { name: string | null } }

export function PostComments({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!content.trim()) return
    setIsSaving(true)
    setError("")
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Unable to post comment")
      setComments((current) => [...current, result])
      setContent("")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to post comment")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-3 border-t pt-4" aria-label="Comments">
      <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>
      {comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <span className="font-medium">{comment.author.name || "Member"}</span>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submitComment} className="flex gap-2">
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a comment..." aria-label="Write a comment" maxLength={2000} />
        <Button type="submit" size="sm" disabled={isSaving || !content.trim()}>{isSaving ? "Posting…" : "Post"}</Button>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
