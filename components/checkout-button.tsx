"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export function CheckoutButton({ label }: { label: string }) {
  const [isStarting, setIsStarting] = useState(false)

  async function startCheckout() {
    setIsStarting(true)
    try {
      const response = await fetch("/api/payments/initialize", { method: "POST" })
      const result = await response.json()
      if (!response.ok || typeof result.authorizationUrl !== "string") {
        throw new Error(result.error ?? "Unable to start checkout")
      }
      window.location.assign(result.authorizationUrl)
    } catch (error) {
      toast({
        title: "Checkout could not start.",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
      setIsStarting(false)
    }
  }

  return (
    <Button className="w-full" size="lg" onClick={startCheckout} disabled={isStarting}>
      {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {isStarting ? "Opening Mobile Money checkout…" : label}
    </Button>
  )
}
