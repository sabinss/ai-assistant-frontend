import type { ActionItem } from "./types"

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Builds chat input text from API-aligned fields: `description` → `whyNow`,
 * plus `action_detail` → `actionDetailParts` / `actionDetail`.
 */
export function buildDraftBestActionChatMessage(action: ActionItem): string {
  const desc = stripHtml(action.whyNow?.trim() ?? "")
  const fromParts =
    action.actionDetailParts
      ?.map((p) => stripHtml(String(p.body ?? "").trim()))
      .filter(Boolean)
      .join("\n\n") ?? ""
  const legacy = action.actionDetail?.trim() ? stripHtml(action.actionDetail) : ""
  const detailBlock = fromParts || legacy

  if (desc && detailBlock) return `${desc}\n\n${detailBlock}`
  if (desc) return desc
  if (detailBlock) return detailBlock
  return ""
}
