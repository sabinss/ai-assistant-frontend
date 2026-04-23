import { FIXED_CHAT_ORIGIN, FIXED_ORG_ID } from "./constants"
import type { CowrkrEmbedConfig } from "./types"

declare global {
  interface Window {
    __cowrkrEmbedConfig?: CowrkrEmbedConfig
    __cowrkrEmbedChatInit?: () => void
  }
}

export function toPublicChatPageBase(urlOrOrigin: string): string {
  const s = String(urlOrOrigin || "")
    .trim()
    .replace(/\/$/, "")
  if (!s) return ""
  if (/\/public_chat$/i.test(s)) return s
  try {
    const u = new URL(s.indexOf("//") === -1 ? `https://${s}` : s)
    return `${u.origin}/public_chat`
  } catch {
    return `${s}/public_chat`
  }
}

/**
 * Resolves `/public_chat` base URL: optional `chatOrigin` from `init()`, else `FIXED_CHAT_ORIGIN`.
 */
export function resolveChatPageUrl(): string {
  const cfg = window.__cowrkrEmbedConfig
  const passed = cfg?.chatOrigin != null ? String(cfg.chatOrigin).trim() : ""
  const origin = passed || FIXED_CHAT_ORIGIN
  return toPublicChatPageBase(origin)
}

export function getEmbedContext(embedContainer: HTMLElement): {
  orgId: string
  user: { name: string; email: string; userId: string; company_id?: string }
} {
  const cfg = window.__cowrkrEmbedConfig
  let userObj: CowrkrEmbedConfig["user"] | null = null

  if (cfg?.user && typeof cfg.user === "object") userObj = cfg.user

  const jsonRaw = embedContainer.getAttribute("data-user-json")
  if (!userObj && jsonRaw) {
    try {
      userObj = JSON.parse(jsonRaw) as CowrkrEmbedConfig["user"]
    } catch {
      /* ignore */
    }
  }

  const orgId = FIXED_ORG_ID

  const name =
    (userObj && (userObj.name || userObj.displayName)) ||
    embedContainer.getAttribute("data-user-name") ||
    ""
  const email = (userObj && userObj.email) || embedContainer.getAttribute("data-user-email") || ""
  const rawId =
    userObj &&
    (userObj.userId !== undefined && userObj.userId !== null ? userObj.userId : userObj.id)
  const userId =
    (rawId !== undefined && rawId !== null ? String(rawId) : "") ||
    embedContainer.getAttribute("data-user-id") ||
    ""

  const companyRaw =
    userObj &&
    userObj.company_id !== undefined &&
    userObj.company_id !== null
      ? String(userObj.company_id)
      : embedContainer.getAttribute("data-company-id") || ""

  const user: {
    name: string
    email: string
    userId: string
    company_id?: string
  } = { name, email, userId }
  if (companyRaw) user.company_id = companyRaw

  return {
    orgId,
    user,
  }
}

export function buildChatIframeSrc(ctx: ReturnType<typeof getEmbedContext>): string {
  const base = resolveChatPageUrl()
  const params = new URLSearchParams()
  params.set("org_id", ctx.orgId)

  if (ctx.user.name) {
    params.set("user_name", ctx.user.name)
    params.set("display_name", ctx.user.name)
  }
  if (ctx.user.email) params.set("user_email", ctx.user.email)
  if (ctx.user.userId !== "") params.set("user_id", ctx.user.userId)
  if (ctx.user.company_id) params.set("company_id", ctx.user.company_id)

  return `${base}?${params.toString()}`
}

const EMBEDDED_UI_HTML = `
<div class="cowrkr-chat-root" style="position:fixed; left:auto; top:auto; right:max(20px, env(safe-area-inset-right, 0px)); bottom:max(20px, env(safe-area-inset-bottom, 0px)); z-index:2147483647; margin:0; padding:0; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <a href="#" class="cowrkr-chat-icon" id="chaticon" role="button" aria-label="Open chat" aria-expanded="false" style="display:flex; align-items:center; justify-content:center; width:56px; height:56px; border-radius:9999px; background:linear-gradient(145deg,#3b82f6 0%,#2563eb 45%,#1d4ed8 100%); color:#fff; box-shadow:0 4px 6px -1px rgba(0,0,0,.12),0 10px 24px -4px rgba(37,99,235,.45); border:2px solid rgba(255,255,255,.35); cursor:pointer; text-decoration:none; transition:transform .15s ease,box-shadow .15s ease;">
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M13.087 21.388l.542-.916c.42-.71.63-1.066.968-1.262c.338-.197.763-.204 1.613-.219c1.256-.021 2.043-.098 2.703-.372a5 5 0 0 0 2.706-2.706C22 14.995 22 13.83 22 11.5v-1c0-3.273 0-4.91-.737-6.112a5 5 0 0 0-1.65-1.651C18.41 2 16.773 2 13.5 2h-3c-3.273 0-4.91 0-6.112.737a5 5 0 0 0-1.651 1.65C2 5.59 2 7.228 2 10.5v1c0 2.33 0 3.495.38 4.413a5 5 0 0 0 2.707 2.706c.66.274 1.447.35 2.703.372c.85.015 1.275.022 1.613.219c.337.196.548.551.968 1.262l.542.916c.483.816 1.69.816 2.174 0z"/>
    </svg>
  </a>
  <div id="chat-modal" class="cowrkr-chat-modal" style="display:none; position:absolute; right:0; bottom:64px; width:min(380px,calc(100vw - 40px)); max-width:380px; max-height:min(620px,calc(100vh - 96px)); box-shadow:0 25px 50px -12px rgba(0,0,0,.2),0 0 0 1px rgba(0,0,0,.06); border-radius:16px; overflow:hidden; background:#fff;">
    <iframe title="Chat" style="display:block; width:100%; height:min(580px,calc(100vh - 96px)); min-height:400px; max-height:min(580px,calc(100vh - 96px)); border:0; vertical-align:top;"></iframe>
  </div>
</div>
`.trim()

export function mountWidget(): void {
  if (typeof document === "undefined") return

  const embedContainer = document.getElementById("embed-container")
  if (!embedContainer) return

  const ctx = getEmbedContext(embedContainer)
  if (!ctx.orgId) return

  const iframeSrc = buildChatIframeSrc(ctx)

  document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())

  const wrap = document.createElement("div")
  wrap.innerHTML = EMBEDDED_UI_HTML
  const widgetRoot = wrap.firstElementChild as HTMLElement | null
  if (!widgetRoot) return

  const iframe = widgetRoot.querySelector("iframe")
  if (iframe) iframe.src = iframeSrc

  document.body.appendChild(widgetRoot)

  const ChatModalDiv = widgetRoot.querySelector("#chat-modal") as HTMLElement | null
  const ChatIcon = widgetRoot.querySelector("#chaticon") as HTMLElement | null
  if (!ChatModalDiv || !ChatIcon) return

  let chatOpen = false
  ChatIcon.addEventListener("click", (e) => {
    e.preventDefault()
    chatOpen = !chatOpen
    ChatModalDiv.style.display = chatOpen ? "block" : "none"
    ChatIcon.setAttribute("aria-expanded", chatOpen ? "true" : "false")
    ChatIcon.style.transform = chatOpen ? "scale(0.94)" : "scale(1)"
  })
}

export function removeWidget(): void {
  if (typeof document === "undefined") return
  document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
}
