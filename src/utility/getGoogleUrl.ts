function getGoogleOAuthURL(orgId: any) {
  const rootURL = "https://accounts.google.com/o/oauth2/v2/auth"

  const options = {
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL as string,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state: JSON.stringify({ auth_flow: "auth_flow", orgId }),
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
    ].join(" "),
  }

  const qs = new URLSearchParams({
    client_id: options.client_id,
    redirect_uri: options.redirect_uri,
    scope: options.scope,
    response_type: options.response_type,
    access_type: options.access_type,
    prompt: options.prompt,
    state: options.state,
  })

  return `${rootURL}?${qs.toString()}`
}

export { getGoogleOAuthURL }
