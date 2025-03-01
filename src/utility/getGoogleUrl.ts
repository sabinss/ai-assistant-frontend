function getGoogleOAuthURL(orgId: any) {
  const rootURL = "https://accounts.google.com/o/oauth2/v2/auth"

  const options = {
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL as string,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    // state: "auth_flow",
    state: JSON.stringify({ auth_flow: "auth_flow", orgId }),
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
    ].join(" "),
  }

  console.log("options", options)
  const qs = new URLSearchParams(options)
  console.log("qs", qs.toString())
  return `${rootURL}?${qs.toString()}`
}

export { getGoogleOAuthURL }
