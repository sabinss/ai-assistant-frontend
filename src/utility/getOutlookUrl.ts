/**
 * Outlook OAuth authorize URL with PKCE (required by Microsoft for browser-based flows).
 * Verifier is stored in sessionStorage under OUTLOOK_PKCE_VERIFIER_KEY for the callback page.
 */

export const OUTLOOK_PKCE_VERIFIER_KEY = "outlook_oauth_pkce_verifier"

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function generatePkceVerifier(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncodeBytes(bytes)
}

async function pkceChallengeFromVerifier(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return base64UrlEncodeBytes(new Uint8Array(digest))
}

/**
 * Builds the Microsoft authorize URL and stores the PKCE verifier for `/oauthcallback`.
 */
export async function buildOutlookOAuthRedirectUrl(orgId: string | undefined): Promise<string> {
  const rootURL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
  const redirectUri = process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_REDIRECT_URL as string
  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID as string

  const verifier = generatePkceVerifier()
  const challenge = await pkceChallengeFromVerifier(verifier)
  if (typeof window !== "undefined") {
    sessionStorage.setItem(OUTLOOK_PKCE_VERIFIER_KEY, verifier)
  }

  const state = JSON.stringify({ auth_flow: "auth_flow", orgId })
  const scope = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "User.Read",
    "Mail.Read",
    "Mail.ReadWrite",
  ].join(" ")

  const qs = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    response_type: "code",
    response_mode: "query",
    prompt: "consent",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  })

  const url = `${rootURL}?${qs.toString()}`
  console.log("[Outlook OAuth] Built authorize URL with PKCE (S256). redirect_uri=", redirectUri)
  return url
}
