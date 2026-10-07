/**
 * Action Center — chat & draft API.
 * Replace with LLM or internal chat endpoints when ready.
 */

const DRAFTS: Record<string, { subject: string; body: string }> = {
  "northgate-champion": {
    subject: "Staying connected — introduction and next steps",
    body: `Hi [Successor Name],

I wanted to reach out following James Whitfield's transition. James has been a great partner and I want to make the handover as smooth as possible.

I'm Jamie Torres, your Customer Success Manager. Can we find 30 minutes this week to connect?

Best, Jamie`,
  },
  "castlewood-value": {
    subject: "Let's fix the import issue — call this week?",
    body: `Hi Priya,

I've been tracking the bulk import issue closely and the resolution time has not been acceptable. I want to fix that.

Can we jump on a call this week to walk through what's happening and agree a clear timeline before renewal?

Jamie`,
  },
  "vertex-reengage": {
    subject: "Checking in — government contract expansion",
    body: `Hi Rachel,

Wanted to follow up on the government contract and team expansion you mentioned. We've been thinking through compliance requirements for the new seats.

Would a 20-minute call next week work?

Jamie`,
  },
  "meridian-feature": {
    subject: "Let's unlock reporting for your team",
    body: `Hi Tom,

I'd like to propose a focused 45-minute session to get reporting and automation working for your team — built around how your team actually works.

Would next Tuesday or Wednesday afternoon work?

Jamie`,
  },
  "harmon-competitive": {
    subject: "Before you evaluate — let's talk",
    body: `Hi Daniel,

I appreciate you being upfront about exploring options. Before you go deep on any evaluation I want to make sure you've seen what we added in the last quarter.

Can we find 30 minutes this week?

Jamie`,
  },
  "vertex-expansion": {
    subject: "Expansion outline — government contract",
    body: `Hi Rachel,

Following the government contract win I've put together a preliminary outline for the 40+ seat expansion and Enterprise tier.

Would early next week work for a 45-minute discovery call?

Jamie`,
  },
  "harmon-renewal": {
    subject: "[INTERNAL] Harmon Financial — Renewal Risk Brief",
    body: `ACCOUNT: Harmon Financial Services
RENEWAL: 67 days | RISK: 65 | VALUE: 57

SITUATION: Competitive evaluation active. Daniel Frost referenced "looking at a few options before renewal." No executive sponsor engaged.

ACTION: CS Manager to convene internal alignment call before customer outreach. Agree competitive positioning and executive sponsor.`,
  },
}

const KEYWORD_RESPONSES: Record<string, string> = {
  castlewood:
    "Castlewood Risk 74 driven by: (1) severe bulk import ticket open <strong>11 days</strong>, (2) <strong>3 consecutive Struggling</strong> value signals from Priya Nair, (3) renewal in <strong>41 days</strong> — window adjustment promoted to TODAY.",
  northgate:
    "Northgate Risk 78 — Champion Departure event triggered. James Whitfield leaving end of month, no successor identified, single contact dependency. Renewal 67 days. Successor window is open now.",
  today:
    "Your 2 TODAY actions:<br><br><strong>Northgate</strong> — Champion departure. Draft intro email now while window is open. Risk 78, renewal 67d.<br><br><strong>Castlewood</strong> — Value recovery. Bulk import blocked, 11-day ticket, renewal 41d. Book a call today.",
  risk:
    "Highest risk accounts this week:<br>1. Northgate — Risk 78, renewal 67d<br>2. Castlewood — Risk 74, renewal 41d<br>3. Harmon — Risk 65, competitive evaluation active",
}

const FALLBACK_RESPONSE =
  "I'd prioritise Northgate and Castlewood first — both have time-sensitive windows today. Want a draft for either?"

type ChatTextResult = { type: "text"; content: string }
type ChatDraftResult = { type: "draft"; subject: string; body: string }

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function sendChatMessage(
  text: string,
  _agentId: string
): Promise<ChatTextResult> {
  // return http.post<ChatTextResult>("/action-center/chat", { message: text, agent: agentId }).then((r) => r.data)
  await delay(1000)
  const lower = text.toLowerCase()
  for (const [keyword, response] of Object.entries(KEYWORD_RESPONSES)) {
    if (lower.includes(keyword)) {
      return { type: "text", content: response }
    }
  }
  return { type: "text", content: FALLBACK_RESPONSE }
}

export async function requestDraft(
  account: string,
  draftType: string
): Promise<ChatTextResult | ChatDraftResult> {
  // return http.post("/action-center/drafts", { account, draftType }).then((r) => r.data)
  await delay(1000)
  const key = `${account}-${draftType}`
  const draft = DRAFTS[key]
  if (draft) {
    return { type: "draft", subject: draft.subject, body: draft.body }
  }
  return { type: "text", content: `Draft ready for ${account}. Review before sending.` }
}
