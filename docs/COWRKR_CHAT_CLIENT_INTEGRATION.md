# Cowrkr Chat

**Client Integration Guide — Passing logged-in user identity to the embedded chatbot**

---

## Overview

The Cowrkr chat widget is embedded in your application via a small HTML snippet that loads `embedchat.js`. By default the widget only knows your **organization**; it does not know who is logged in on your site unless you pass that data in.

This guide explains how to pass the logged-in user’s **name**, **email**, and **id** into the chat iframe so conversations can be personalised and attributed correctly.

**How it works in code**

The widget reads configuration from **`window.__cowrkrEmbedConfig`** and builds a floating launcher plus an iframe pointed at **`/public_chat`** on the Cowrkr frontend. After you change that config (login, logout, or user switch), you call **`window.__cowrkrEmbedChatInit()`** so the widget is rebuilt with the latest identity.

There is **no** `window.Cowrkr` object in the current script — integration is done with these two globals.

---

## Prerequisites

| Requirement                       | Notes                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Organization ID (`org_id`)**    | Unique workspace id from Cowrkr (Mongo-style string).                                                                      |
| **HTTPS**                         | Use `https://` for the script and production chat URLs.                                                                    |
| **`#embed-container` in the DOM** | Required. The script looks up `document.getElementById("embed-container")`.                                                |
| **Correct chat host**             | The iframe must load Cowrkr’s `/public_chat`, not your site’s home page (see [Chat URL resolution](#chat-url-resolution)). |

---

## Step 1 — Keep (or add) your embed snippet

Your page should include a container and the script. The container can be visually hidden; it holds fallbacks like `data-org`.

```html
<div data-org="YOUR_ORG_ID" id="embed-container" style="font-size: 16px;"></div>

<script src="https://YOUR_COWRKR_FRONTEND/embedchat.js" async></script>
```

Use your real Cowrkr frontend origin instead of `YOUR_COWRKR_FRONTEND` (for example `https://staging.mycowrkr.cloud`).

**Legacy attribute:** `dataOrg` is also supported (same meaning as `data-org`).

---

## Step 2 — Set identity and org with `window.__cowrkrEmbedConfig`

Assign **`window.__cowrkrEmbedConfig`** when you know the current user — on every page load if a session already exists, and immediately after login. This is the **preferred** way to pass a logged-in user.

```javascript
window.__cowrkrEmbedConfig = {
  orgId: "YOUR_ORG_ID",
  user: {
    name: "Jane Doe", // or displayName in some flows
    email: "jane@client.com",
    userId: "user-123", // or id — see payload reference
  },
  // Optional — only if embedchat.js is NOT served from the same origin as Cowrkr:
  // chatOrigin: "https://YOUR_COWRKR_FRONTEND",
  // chatBaseUrl: "https://YOUR_COWRKR_FRONTEND/public_chat",
}
```

| Field         | Required  | Description                                                                                                                      |
| ------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `orgId`       | Yes\*     | Workspace id. \*Can be omitted from JS if `#embed-container` has `data-org` / `dataOrg`.                                         |
| `user`        | No        | Object with visitor identity (see [Payload reference](#cowrkrembedconfig-user-payload-reference)).                               |
| `chatOrigin`  | Sometimes | HTTPS origin of the Cowrkr app **without** trailing slash. Use if you load `embedchat.js` from a **different** host than Cowrkr. |
| `chatBaseUrl` | Rare      | Full public chat URL (normalized to end with `/public_chat`). Overrides `chatOrigin` when set.                                   |

If `user` is omitted or empty, the chat still opens for the org, without personalised query params.

---

## Step 3 — Call `__cowrkrEmbedChatInit()` after config changes

The script exposes **`window.__cowrkrEmbedChatInit`**. After you set or update `__cowrkrEmbedConfig`, call it so the iframe URL is rebuilt (for example with the new user’s query string).

**Important:** There is **no** automatic queue if you call `init` before the script has loaded. Load the script with **`onload`** and then call `__cowrkrEmbedChatInit()`, or check that `__cowrkrEmbedChatInit` exists before calling (same pattern as the in-app Help page).

### React

```tsx
import { useEffect } from "react"

declare global {
  interface Window {
    __cowrkrEmbedConfig?: {
      orgId?: string
      user?: { name?: string; email?: string; userId?: string }
      chatOrigin?: string
    }
    __cowrkrEmbedChatInit?: () => void
  }
}

const COWRKR_SCRIPT = "https://YOUR_COWRKR_FRONTEND/embedchat.js"

export function CowrkrChatEmbed({ user, orgId }: { user: YourUser | null; orgId: string | null }) {
  useEffect(() => {
    if (!orgId) {
      document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
      delete window.__cowrkrEmbedConfig
      return
    }

    window.__cowrkrEmbedConfig = {
      orgId,
      user: user
        ? {
            name: user.name ?? "",
            email: user.email ?? "",
            userId: String(user.id),
          }
        : undefined,
    }

    const runInit = () => window.__cowrkrEmbedChatInit?.()

    let script = document.querySelector(
      `script[src="${COWRKR_SCRIPT}"]`
    ) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement("script")
      script.src = COWRKR_SCRIPT
      script.async = true
      script.onload = runInit
      document.body.appendChild(script)
    } else if (window.__cowrkrEmbedChatInit) {
      runInit()
    } else {
      script.addEventListener("load", runInit, { once: true })
    }

    return () => {
      document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
      delete window.__cowrkrEmbedConfig
    }
  }, [user, orgId])

  return <div id="embed-container" data-org={orgId ?? ""} className="sr-only" aria-hidden />
}
```

### Next.js (App Router) — same idea as above

Use `useEffect` with your session (NextAuth, Clerk, custom store). Re-run when `session` or `orgId` changes; on logout clear config and remove `.cowrkr-chat-root` as in the cleanup above.

### Vue 3

```ts
import { watch, onUnmounted } from "vue"

watch(
  () => [store.user, store.orgId] as const,
  ([user, orgId]) => {
    if (!orgId) {
      document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
      delete window.__cowrkrEmbedConfig
      return
    }
    window.__cowrkrEmbedConfig = {
      orgId,
      user: user ? { name: user.name, email: user.email, userId: String(user.id) } : undefined,
    }
    window.__cowrkrEmbedChatInit?.()
  },
  { immediate: true }
)
```

### Vanilla JavaScript

```javascript
function setCowrkrUser(user, orgId) {
  if (!orgId) {
    document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
    delete window.__cowrkrEmbedConfig
    return
  }
  window.__cowrkrEmbedConfig = {
    orgId,
    user: user && {
      name: user.name,
      email: user.email,
      userId: String(user.id),
    },
  }
  const run = () => window.__cowrkrEmbedChatInit?.()
  const src = "https://YOUR_COWRKR_FRONTEND/embedchat.js"
  let s = document.querySelector('script[src="' + src + '"]')
  if (!s) {
    s = document.createElement("script")
    s.src = src
    s.async = true
    s.onload = run
    document.body.appendChild(s)
  } else if (window.__cowrkrEmbedChatInit) {
    run()
  } else {
    s.addEventListener("load", run, { once: true })
  }
}
```

---

## Step 4 — Logout and account switch

When the user **logs out**, remove the widget and clear the config so the next visitor does not inherit the previous user’s embed settings:

```javascript
document.querySelectorAll(".cowrkr-chat-root").forEach((el) => el.remove())
delete window.__cowrkrEmbedConfig
```

Call **`__cowrkrEmbedChatInit()`** again only after you set a **new** `__cowrkrEmbedConfig` (for example after a different user logs in).

**Note:** Chat history inside the iframe may also use browser storage on the **Cowrkr** origin. Clearing your app’s cookies does not automatically clear that. For a strict “new user, new thread” guarantee on shared devices, coordinate with Cowrkr support if you need server-side session invalidation.

---

## `__cowrkrEmbedConfig.user` payload reference

Values are passed into the iframe as query parameters on `/public_chat`.

| Field                   | Type            | Required for personalisation | Description                                                   |
| ----------------------- | --------------- | ---------------------------- | ------------------------------------------------------------- |
| `name` or `displayName` | string          | No                           | Shown in the chat UI; sent as `user_name` and `display_name`. |
| `email`                 | string          | No                           | Sent as `user_email`.                                         |
| `userId` or `id`        | string / number | No                           | Sent as `user_id`.                                            |

Alternatively, you can put a JSON string on the container: **`data-user-json='{"name":"…","email":"…","userId":"…"}'`**, or use **`data-user-name`**, **`data-user-email`**, **`data-user-id`** on `#embed-container`. Priority is: **`__cowrkrEmbedConfig`** first, then **`data-user-json`**, then individual `data-user-*` attributes.

---

## Chat URL resolution

The iframe loads **`{base}/public_chat?org_id=…&…`**. The script picks `base` in this order:

1. `chatBaseUrl` in `__cowrkrEmbedConfig` (normalized to end with `/public_chat`).
2. `chatOrigin` + `/public_chat`.
3. Origin of the **`embedchat.js` script URL**.
4. `window.location.origin` of the **page** hosting the embed.
5. Fallback staging URL (do not rely on this in production).

If you **self-host** `embedchat.js` on your domain but Cowrkr runs elsewhere, you **must** set **`chatOrigin`** or **`chatBaseUrl`**, otherwise the iframe will point at the wrong host.

---

## Timing guide

| When                               | What to do                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| User logs in                       | Set `__cowrkrEmbedConfig` with `orgId` + `user`, then call `__cowrkrEmbedChatInit()` (after script load). |
| Page loads, session already active | Same as login — set config and run init.                                                                  |
| User logs out                      | Remove `.cowrkr-chat-root`, `delete window.__cowrkrEmbedConfig`.                                          |
| User switches accounts             | Logout cleanup, then set config for the new user and call `__cowrkrEmbedChatInit()` again.                |
| You change only `user` fields      | Update `__cowrkrEmbedConfig` and call `__cowrkrEmbedChatInit()` so the iframe URL updates.                |

---

## Framework quick reference

| Framework       | Where to run logic                                          |
| --------------- | ----------------------------------------------------------- |
| React / Next.js | `useEffect` dependent on user + org id                      |
| Vue             | `watch` on user + org                                       |
| Angular         | Subscribe to auth service observable                        |
| Vanilla JS      | After login API resolves; on route changes if you use a SPA |

---

## Verify the integration

1. Open your site — a **chat bubble** should appear bottom-right.
2. Open DevTools → **Network** — the iframe document should be **`…/public_chat?org_id=…`**, not `/`.
3. Confirm `user_name`, `user_email`, or `user_id` appear on the query string when you passed `user` in config.

---

## Troubleshooting

| Symptom                          | Likely cause                                               | What to do                                                                                               |
| -------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| No widget                        | Missing `#embed-container` or missing `orgId` / `data-org` | Add container and org.                                                                                   |
| Iframe blocked / X-Frame-Options | Wrong framed URL                                           | Ensure URL is `/public_chat` on Cowrkr; set `chatOrigin` / `chatBaseUrl` if script is on another domain. |
| Stale user after login           | Config updated without rebuild                             | Call `__cowrkrEmbedChatInit()` after updating `__cowrkrEmbedConfig`.                                     |
| Wrong environment                | Mixed staging/production URLs                              | Use one consistent Cowrkr frontend URL for script and `chatOrigin`.                                      |

---

## Related documentation

A shorter technical reference lives in [`EMBED_CHAT_INTEGRATION.md`](./EMBED_CHAT_INTEGRATION.md) in this repository.

---

## Need help?

Include the following so we can assist faster:

- Your framework and version (e.g. React 18, Next.js 14).
- Whether you set `chatOrigin` / `chatBaseUrl` and the exact `embedchat.js` URL.
- The point in your app where you set `__cowrkrEmbedConfig` and call `__cowrkrEmbedChatInit`.
- Any browser console or network errors (especially CSP / frame-ancestors / X-Frame-Options).

We are happy to review a minimal code snippet if needed.
