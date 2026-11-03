"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { lessonSchema } from "@/lib/validations/lesson"
import { uploadFeedImage } from "@/lib/upload-feed-image"

type LessonFormData = z.infer<typeof lessonSchema>

export function CreateLessonForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const { register, handleSubmit, formState: { errors } } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
  })

  async function onSubmit(data: LessonFormData) {
    setIsSaving(true)
    try {
      const imageUrls = await Promise.all(images.map(uploadFeedImage))
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, imageUrls }),
      })
      if (!response.ok) throw new Error("Unable to publish lesson")
      toast({ description: "Your lesson has been published." })
      router.push("/hq/academy")
      router.refresh()
    } catch {
      toast({ title: "Unable to publish lesson.", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Lesson title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Lesson notes</Label>
        <Textarea id="content" rows={12} placeholder="Write the lesson content..." {...register("content")} />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lesson-images">Lesson images</Label>
        <Input
          id="lesson-images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 6))}
        />
        <p className="text-xs text-muted-foreground">Up to 6 JPG, PNG, or WebP images. 8 MB maximum per image.</p>
        {images.length > 0 && <p className="text-xs text-muted-foreground">{images.map((image) => image.name).join(", ")}</p>}
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSaving ? "Publishing…" : "Publish lesson"}
      </Button>
    </form>
  )
}
