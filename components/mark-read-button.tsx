"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

export function MarkReadButton({ postId }: { postId: string }) {
  const [isRead, setIsRead] = useState(false)

  if (isRead) return null

  async function markAsRead() {
    setIsRead(true)

    try {
      const response = await fetch(`/api/posts/${postId}/read`, { method: "POST" })
      if (!response.ok) setIsRead(false)
    } catch {
      setIsRead(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={markAsRead}>
      Mark as Read
    </Button>
  )
}
