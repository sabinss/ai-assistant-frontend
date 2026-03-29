import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  securityConfig,
  generateCSP,
  generateHSTS,
} from "./src/config/security"

function isPublicChatPath(pathname: string) {
  return pathname === "/public_chat" || pathname.startsWith("/public_chat/")
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const embeddable = isPublicChatPath(request.nextUrl.pathname)

  // Apply security headers from configuration
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
    if (embeddable && key === "X-Frame-Options") return
    response.headers.set(key, value)
  })

  if (embeddable) {
    response.headers.delete("X-Frame-Options")
  }

  // Public chat is loaded in third-party iframes; allow framing via CSP (not X-Frame-Options: DENY).
  response.headers.set(
    "Content-Security-Policy",
    generateCSP({ embeddable })
  )

  // HSTS header for HTTPS (production only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", generateHSTS())
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
