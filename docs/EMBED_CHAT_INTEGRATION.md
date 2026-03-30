# CoWrkr embed chat — client integration guide

This document explains how to add the **floating chat widget** to a customer website using `embedchat.js`. The widget loads your **public chat** page (`/public_chat`) in an iframe behind a bottom-right chat button.

---

## Prerequisites

1. **Organization ID** — CoWrkr provides a unique `org_id` for your workspace (Mongo-style id string).
2. **Hosted CoWrkr frontend URL** — The HTTPS base URL where CoWrkr is deployed, for example `https://app.example.com`. You must load `embedchat.js` from that host (or set `chatOrigin` / `chatBaseUrl`; see below).
3. **HTTPS** — Use `https://` for the script and chat URL in production.

---

## Step 1 — Add a container element

The script looks for an element with **`id="embed-container"`**. It can be invisible; it is only used for configuration fallbacks.

Add this once per page (or once in your app shell), typically near the end of `<body>`:

```html
<div id="embed-container" data-org="YOUR_ORG_ID"></div>
```

Replace `YOUR_ORG_ID` with the value CoWrkr gave you.  
`data-org` is required if you do not set `orgId` in JavaScript (Step 2).

Optional attributes on the same element (if you are not using the JS config object for user fields):

| Attribute | Purpose |
|-----------|---------|
| `data-user-name` | Visitor display name in chat |
| `data-user-email` | Visitor email |
| `data-user-id` | Visitor id in your system |
| `data-user-json` | JSON string of a user object (`name` / `displayName`, `email`, `userId` or `id`) |

---

## Step 2 — Set configuration (recommended)

Before or after loading the script, assign **`window.__cowrkrEmbedConfig`**. This is the preferred way to pass org and logged-in user data from your app.

```html
<script>
  window.__cowrkrEmbedConfig = {
    orgId: "YOUR_ORG_ID",
    /** Required if the script is NOT served from the same host as CoWrkr (see Step 4). */
    // chatOrigin: "https://your-cowrkr-frontend.example.com",
    user: {
      name: "Jane Doe",
      email: "jane@client.com",
      userId: "user-123",
    },
  };
</script>
```

| Field | Required | Description |
|-------|----------|-------------|
| `orgId` | Yes* | Same as `data-org` on `#embed-container`. *One of `orgId` or `data-org` is required. |
| `user` | No | `name` (or `displayName`), `email`, `userId` (or `id`) — passed into the chat iframe as query params. |
| `chatOrigin` | Sometimes | HTTPS origin of the CoWrkr app **without** a trailing slash, e.g. `https://app.example.com`. Use when the embed script is loaded from a different host than CoWrkr. |
| `chatBaseUrl` | Rare | Full URL of the chat page, e.g. `https://app.example.com/public_chat`. If omitted, the script uses `chatOrigin` + `/public_chat` or derives the host from the script’s URL. |

---

## Step 3 — Load `embedchat.js`

Use the **full HTTPS URL** to the script on the CoWrkr deployment:

```html
<script
  src="https://your-cowrkr-frontend.example.com/embedchat.js"
  async
></script>
```

**Order:** Defining `__cowrkrEmbedConfig` in an inline `<script>` **above** this tag is fine. If you set config later (e.g. after your auth SDK loads), call the initializer once config and DOM are ready (Step 5).

---

## Step 4 — Choose the correct chat URL (important)

The iframe loads **`{origin}/public_chat?org_id=...&...`**. How `{origin}` is chosen:

1. `chatBaseUrl` in `__cowrkrEmbedConfig` (normalized to end with `/public_chat`).
2. Else `chatOrigin` + `/public_chat`.
3. Else the **origin of the `embedchat.js` script URL**.
4. Else **`window.location.origin`** of the **page** (the client site).
5. Else a default staging URL (should not be relied on in production).

**Typical client setup**

- Host `embedchat.js` **on the CoWrkr frontend** (Step 3). Then you usually **do not** need `chatOrigin`.
- If you **mirror** `embedchat.js` on the client’s domain, you **must** set **`chatOrigin`** (or `chatBaseUrl`) to the CoWrkr app origin, otherwise the iframe will point at the wrong host.

---

## Step 5 — Single-page apps (React, Vue, etc.)

1. Ensure `#embed-container` exists in the DOM.
2. Set `window.__cowrkrEmbedConfig` when you know `orgId` and the current user.
3. Load the script once (see pattern below).
4. After updating config (e.g. login/logout), call **`window.__cowrkrEmbedChatInit()`** if it exists, so the widget rebuilds with the new user/org.

Example pattern (same idea as React `useEffect`):

```javascript
const COWRKR_ORIGIN = "https://your-cowrkr-frontend.example.com";
const ORG_ID = "your_org_id";

function setCowrkrEmbedUser(user) {
  window.__cowrkrEmbedConfig = {
    orgId: ORG_ID,
    chatOrigin: COWRKR_ORIGIN,
    user: user
      ? {
          name: user.name,
          email: user.email,
          userId: user.id,
        }
      : {},
  };

  const runInit = () => window.__cowrkrEmbedChatInit?.();

  let script = document.querySelector(`script[src="${COWRKR_ORIGIN}/embedchat.js"]`);
  if (!script) {
    script = document.createElement("script");
    script.src = `${COWRKR_ORIGIN}/embedchat.js`;
    script.async = true;
    script.onload = runInit;
    document.body.appendChild(script);
  } else if (window.__cowrkrEmbedChatInit) {
    runInit();
  } else {
    script.addEventListener("load", runInit, { once: true });
  }
}
```

On unmount / leaving the page, you may remove the widget from the DOM and delete `window.__cowrkrEmbedConfig` if your app requires a full cleanup.

---

## Step 6 — Verify

1. Open the client site, confirm a **chat bubble** appears bottom-right.
2. Click it — the panel should open without browser console errors about **X-Frame-Options** or **Content-Security-Policy / frame-ancestors**.
3. In DevTools → **Network**, the iframe document request should be **`…/public_chat?org_id=…`**, not the site home page `/`.

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| No widget | Missing `#embed-container` or missing `orgId` / `data-org` | Add container and org. |
| Iframe refused / “X-Frame-Options” | Framed URL is the **home page** or a page that blocks framing | Ensure iframe URL is `/public_chat`. Set `chatOrigin` or `chatBaseUrl` if the script is hosted on the wrong domain. CoWrkr must serve `/public_chat` with framing allowed for embeds. |
| Wrong environment | Staging vs production | Use the production `embedchat.js` URL and matching `chatOrigin`. |
| Stale user after login | Config updated after init | Call `__cowrkrEmbedChatInit()` after updating `__cowrkrEmbedConfig`. |

---

## Minimal copy-paste (static HTML)

Replace placeholders with your real CoWrkr URL and org id.

```html
<script>
  window.__cowrkrEmbedConfig = {
    orgId: "YOUR_ORG_ID",
    chatOrigin: "https://your-cowrkr-frontend.example.com",
    user: {
      name: "Guest",
      email: "guest@example.com",
      userId: "anonymous",
    },
  };
</script>
<div id="embed-container" data-org="YOUR_ORG_ID"></div>
<script
  src="https://your-cowrkr-frontend.example.com/embedchat.js"
  async
></script>
```

---

## Support

For org IDs, deployment URLs, or CSP issues on the CoWrkr side, contact your CoWrkr project owner or support channel.
