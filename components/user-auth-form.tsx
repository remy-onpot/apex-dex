"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const searchParams = useSearchParams()
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  return (
    <div className={cn("w-full", className)} {...props}>
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full text-base font-semibold"
        onClick={() => {
          setIsGoogleLoading(true)
          signIn("google", {
            callbackUrl: searchParams?.get("from") || "/desk/feed",
          })
        }}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Continue with Google
      </Button>
    </div>
  )
}
