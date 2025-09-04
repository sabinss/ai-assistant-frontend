import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  securityConfig,
  generateCSP,
  generateHSTS,
} from "./src/config/security"

export function middleware(request: NextRequest) {
  // Block dangerous HTTP methods
  const method = request.method
  if (['TRACE', 'TRACK', 'OPTIONS'].includes(method)) {
    return new NextResponse(null, { 
      status: 405, 
      statusText: 'Method Not Allowed',
      headers: {
        'Allow': 'GET, POST, PUT, DELETE, HEAD, PATCH',
        // Remove all server identification
        'Server': '',
        'X-Powered-By': '',
        'X-AspNet-Version': '',
        'X-AspNetMvc-Version': '',
        'X-Drupal-Cache': '',
        'X-Generator': '',
      }
    })
  }

  const response = NextResponse.next()

  // Aggressively remove ALL server identification headers
  const headersToRemove = [
    'Server',
    'X-Powered-By',
    'X-AspNet-Version',
    'X-AspNetMvc-Version',
    'X-Drupal-Cache',
    'X-Generator',
    'X-Framework',
    'X-CMS',
    'X-Engine',
    'X-PHP-Version',
    'X-Node-Version',
    'X-React-Version',
    'X-Next-Version',
  ]

  headersToRemove.forEach(header => {
    response.headers.delete(header)
  })

  // Apply security headers from configuration
  Object.entries(securityConfig.headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Content Security Policy
  response.headers.set("Content-Security-Policy", generateCSP())

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
