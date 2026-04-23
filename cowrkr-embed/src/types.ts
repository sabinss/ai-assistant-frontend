export type CowrkrEmbedUser = {
  name?: string
  displayName?: string
  email?: string
  userId?: string | number
  id?: string | number
  company_id?: string | number | null
}

export type CowrkrEmbedInitOptions = {
  user?: CowrkrEmbedUser
  /**
   * HTTPS origin for the Cowrkr app (no trailing slash), e.g. `https://staging.cowrkr.com`.
   * If omitted or empty, `FIXED_CHAT_ORIGIN` is used.
   */
  chatOrigin?: string
}

export type CowrkrEmbedConfig = {
  user?: CowrkrEmbedUser
  chatOrigin?: string
}
