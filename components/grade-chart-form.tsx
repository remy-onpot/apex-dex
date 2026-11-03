"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export function GradeChartForm({ reviewId }: { reviewId: string }) {
  const router = useRouter()
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      })

      if (!response.ok) {
        toast({
          title: "Unable to submit feedback.",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({ description: "Chart graded and published to the Crucible." })
      router.refresh()
    } catch {
      toast({
        title: "Unable to submit feedback.",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`feedback-${reviewId}`}>Mentor feedback</Label>
        <Textarea
          id={`feedback-${reviewId}`}
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Share your review and suggestions..."
          rows={5}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !feedback.trim()}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Grading…" : "Submit feedback"}
      </Button>
    </form>
  )
}
