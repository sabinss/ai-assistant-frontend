import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomId(): string {
  const randomId = Math.random().toString(36).substring(2) + Date.now().toString(36)
  return randomId
}

/** Generates a unique session ID to avoid collisions with existing sessions. */
export function generateUniqueSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 15)}`
}

/** Random 5-digit integer for session id / chat session id (10000–99999). Not guaranteed unique (90k values). */
export function generateSessionIdLength5(): number {
  return Math.floor(10000 + Math.random() * 90000)
}
