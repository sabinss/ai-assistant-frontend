function getOutlookOAuthURL(orgId: string | undefined) {
  const rootURL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"

  const redirectUri = process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_REDIRECT_URL as string
  const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID as string

  const options = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "query",
    prompt: "consent",
    state: JSON.stringify({ auth_flow: "auth_flow", orgId }),
    scope: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "User.Read",
      "Mail.Read",
      "Mail.ReadWrite",
    ].join(" "),
  }

  const qs = new URLSearchParams({
    client_id: options.client_id,
    redirect_uri: options.redirect_uri,
    scope: options.scope,
    response_type: options.response_type,
    response_mode: options.response_mode,
    prompt: options.prompt,
    state: options.state,
  })

  return `${rootURL}?${qs.toString()}`
}

export { getOutlookOAuthURL }
