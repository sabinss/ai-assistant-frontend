function getGoogleOAuthURL(orgId: any) {
  const rootURL = "https://accounts.google.com/o/oauth2/v2/auth"

  const options = {
    redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL as string,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    // state: "auth_flow",,
    state: JSON.stringify({ auth_flow: "auth_flow", orgId }),
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.compose",
    ].join(" "),
  }

  console.log("options", options)
  const qs = new URLSearchParams(options)
  console.log("qs", qs.toString())
  return `${rootURL}?${qs.toString()}`
}

export { getGoogleOAuthURL }
// let params = {
//   client_id: CLIENT_ID,
//   redirect_uri: `${DEPLOYMENT_ENVIRONMENT === "dev" ? "http://localhost:4321" : "https://demo.instwise.app"}/oauthcallback`,
//   scope: "openid profile email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose",
//   include_granted_scopes: "true",
//   response_type: "code",
//   state: "auth_flow",
//   access_type: "offline",
//   prompt: "consent",
// };
