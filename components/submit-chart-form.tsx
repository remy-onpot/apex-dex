"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { chartSubmissionSchema } from "@/lib/validations/review"

type ChartSubmissionFormData = z.infer<typeof chartSubmissionSchema>

export function SubmitChartForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChartSubmissionFormData>({
    resolver: zodResolver(chartSubmissionSchema),
  })

  async function onSubmit(data: ChartSubmissionFormData) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        toast({
          title: "Unable to submit chart.",
          description: "Please check the link and thesis, then try again.",
          variant: "destructive",
        })
        return
      }

      toast({ description: "Your chart has been submitted for review." })
      router.push("/desk/reviews")
      router.refresh()
    } catch {
      toast({
        title: "Unable to submit chart.",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">TradingView Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://www.tradingview.com/x/..."
          {...register("imageUrl")}
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="thesis">Trade Thesis</Label>
        <Textarea
          id="thesis"
          rows={7}
          placeholder="Why are you taking this trade?"
          {...register("thesis")}
        />
        {errors.thesis && (
          <p className="text-sm text-destructive">{errors.thesis.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  )
}
