import { FIXED_CHAT_ORIGIN, FIXED_ORG_ID } from "./constants"
import type { CowrkrEmbedConfig, CowrkrEmbedInitOptions } from "./types"
import { mountWidget, removeWidget } from "./widget"

export type { CowrkrEmbedConfig, CowrkrEmbedInitOptions, CowrkrEmbedUser } from "./types"
export { FIXED_CHAT_ORIGIN, FIXED_ORG_ID } from "./constants"
export {
  mountWidget,
  removeWidget,
  resolveChatPageUrl,
  buildChatIframeSrc,
  getEmbedContext,
} from "./widget"

declare global {
  interface Window {
    __cowrkrEmbedConfig?: CowrkrEmbedConfig
    __cowrkrEmbedChatInit?: () => void
  }
}

function normalizeChatOrigin(origin: string | undefined): string | undefined {
  if (origin == null) return undefined
  const t = String(origin).trim()
  return t === "" ? undefined : t
}

/**
 * Shows the floating chat. Pass `chatOrigin` to override the iframe base; otherwise `FIXED_CHAT_ORIGIN` is used.
 */
export function init(config: CowrkrEmbedInitOptions = {}): void {
  if (typeof window === "undefined") return

  const chatOrigin = normalizeChatOrigin(config.chatOrigin)

  window.__cowrkrEmbedConfig = {
    user: config.user,
    ...(chatOrigin !== undefined ? { chatOrigin } : {}),
  }

  let el = document.getElementById("embed-container")
  if (!el) {
    el = document.createElement("div")
    el.id = "embed-container"
    document.body.appendChild(el)
  }
  el.setAttribute("data-org", FIXED_ORG_ID)

  mountWidget()

  window.__cowrkrEmbedChatInit = () => {
    mountWidget()
  }
}

export function destroy(): void {
  if (typeof window === "undefined") return
  removeWidget()
  delete window.__cowrkrEmbedConfig
  delete window.__cowrkrEmbedChatInit
}
