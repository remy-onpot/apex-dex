import type { Prisma } from "@prisma/client"

export function getPostImageUrls(value: Prisma.JsonValue | null): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}
