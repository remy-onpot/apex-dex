"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadFeedImage } from "@/lib/upload-feed-image"
import { setupSchema } from "@/lib/validations/setup"

type SetupFormData = z.infer<typeof setupSchema>

export function CreateSetupForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: { direction: "BUY" },
  })

  async function onSubmit(data: SetupFormData) {
    setIsSaving(true)
    try {
      const imageUrls = await Promise.all(images.map(uploadFeedImage))
      const response = await fetch("/api/setups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, imageUrls }),
      })

      if (!response.ok) {
        toast({
          title: "Unable to publish setup.",
          description: "Please check the details and try again.",
          variant: "destructive",
        })
        return
      }

      toast({ description: "Your trade setup has been published." })
      router.push("/hq/setups")
      router.refresh()
    } catch {
      toast({
        title: "Unable to publish setup.",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Gold breakout setup" {...register("title")} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="asset">Asset</Label>
          <Input id="asset" placeholder="XAUUSD" {...register("asset")} />
          {errors.asset && <p className="text-sm text-destructive">{errors.asset.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <Select defaultValue="BUY" onValueChange={(value) => setValue("direction", value as SetupFormData["direction"], { shouldValidate: true })}>
            <SelectTrigger id="direction"><SelectValue placeholder="Choose direction" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BUY">BUY</SelectItem>
              <SelectItem value="SELL">SELL</SelectItem>
            </SelectContent>
          </Select>
          {errors.direction && <p className="text-sm text-destructive">{errors.direction.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry</Label>
          <Input id="entryPrice" {...register("entryPrice")} />
          {errors.entryPrice && <p className="text-sm text-destructive">{errors.entryPrice.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stopLoss">Stop Loss</Label>
          <Input id="stopLoss" {...register("stopLoss")} />
          {errors.stopLoss && <p className="text-sm text-destructive">{errors.stopLoss.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="takeProfit">Take Profit</Label>
          <Input id="takeProfit" {...register("takeProfit")} />
          {errors.takeProfit && <p className="text-sm text-destructive">{errors.takeProfit.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="content">Analysis</Label>
          <Textarea id="content" rows={7} placeholder="Share the trade thesis and key levels..." {...register("content")} />
          {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="setup-images">Chart images</Label>
          <Input
            id="setup-images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 6))}
          />
          <p className="text-xs text-muted-foreground">Up to 6 JPG, PNG, or WebP images. 8 MB maximum per image.</p>
          {images.length > 0 && <p className="text-xs text-muted-foreground">{images.map((image) => image.name).join(", ")}</p>}
        </div>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Publishing…" : "Publish setup"}
      </Button>
    </form>
  )
}
