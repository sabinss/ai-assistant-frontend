(function () {
  /**
   * Ensures iframe loads /public_chat, never bare site root (root often has X-Frame-Options: DENY).
   */
  function toPublicChatPageBase(urlOrOrigin) {
    var s = String(urlOrOrigin || "").trim().replace(/\/$/, "");
    if (!s) return "";
    if (/\/public_chat$/i.test(s)) return s;
    try {
      var u = new URL(s.indexOf("//") === -1 ? "https://" + s : s);
      return u.origin + "/public_chat";
    } catch (e) {
      return s + "/public_chat";
    }
  }

  function scriptOriginFromDom() {
    var src = null;
    try {
      var cs = document.currentScript;
      if (cs && cs.src) src = cs.src;
    } catch (e) {}
    if (!src) {
      var nodes = document.querySelectorAll("script[src*='embedchat']");
      if (nodes.length) src = nodes[nodes.length - 1].getAttribute("src") || "";
    }
    if (src) {
      try {
        return new URL(src, window.location.href).origin + "/public_chat";
      } catch (e2) {}
    }
    return "";
  }

  /**
   * Public chat page URL (no query string).
   * Priority: chatBaseUrl (normalized) → chatOrigin → embed script origin → page origin → staging.
   */
  function resolveChatPageUrl() {
    var cfg = window.__cowrkrEmbedConfig;
    if (cfg && cfg.chatBaseUrl) {
      return toPublicChatPageBase(cfg.chatBaseUrl);
    }
    if (cfg && cfg.chatOrigin) {
      return toPublicChatPageBase(cfg.chatOrigin);
    }
    var fromScript = scriptOriginFromDom();
    if (fromScript) return fromScript;
    try {
      if (window.location && window.location.origin) {
        return window.location.origin + "/public_chat";
      }
    } catch (e3) {}
    return "https://staging.mycowrkr.cloud/public_chat";
  }

  /**
   * Resolves org + user from (priority):
   * 1) window.__cowrkrEmbedConfig — { orgId, user: { name, displayName, email, userId, ... } }
   * 2) data-user-json on #embed-container — JSON string of a user object
   * 3) data-org + data-user-name / data-user-email / data-user-id on the container
   */
  function getEmbedContext(embedContainer) {
    var cfg = window.__cowrkrEmbedConfig;
    var userObj = null;

    if (cfg && cfg.user && typeof cfg.user === "object") {
      userObj = cfg.user;
    }

    var jsonRaw = embedContainer.getAttribute("data-user-json");
    if (!userObj && jsonRaw) {
      try {
        userObj = JSON.parse(jsonRaw);
      } catch (e) {
        /* ignore */
      }
    }

    var orgId =
      (cfg && cfg.orgId) ||
      embedContainer.getAttribute("data-org") ||
      embedContainer.getAttribute("dataOrg");

    var name =
      (userObj && (userObj.name || userObj.displayName)) ||
      embedContainer.getAttribute("data-user-name") ||
      "";
    var email =
      (userObj && userObj.email) ||
      embedContainer.getAttribute("data-user-email") ||
      "";
    var userId =
      (userObj &&
        (userObj.userId !== undefined && userObj.userId !== null
          ? userObj.userId
          : userObj.id)) ||
      embedContainer.getAttribute("data-user-id") ||
      "";

    return {
      orgId: orgId,
      user: { name: name, email: email, userId: userId },
    };
  }

  function buildChatIframeSrc(ctx) {
    var base = resolveChatPageUrl();
    var params = new URLSearchParams();
    params.set("org_id", ctx.orgId);

    var userName = ctx.user.name;
    var userEmail = ctx.user.email;
    var userId = ctx.user.userId;

    if (userName) {
      params.set("user_name", userName);
      params.set("display_name", userName);
    }
    if (userEmail) params.set("user_email", userEmail);
    if (userId !== "" && userId != null)
      params.set("user_id", String(userId));

    return base + "?" + params.toString();
  }

  function init() {
    var embedContainer = document.getElementById("embed-container");
    if (!embedContainer) return;

    var ctx = getEmbedContext(embedContainer);
    if (!ctx.orgId) return;

    var iframeSrc = buildChatIframeSrc(ctx);

    document.querySelectorAll(".cowrkr-chat-root").forEach(function (el) {
      el.remove();
    });

    var embeddedContent =
      '\n          <div class="cowrkr-chat-root" style="position:fixed; left:auto; top:auto; right:max(24px, env(safe-area-inset-right, 0px)); bottom:max(24px, env(safe-area-inset-bottom, 0px)); z-index:2147483647; margin:0; padding:0;">\n            <a href="#" class="cowrkr-chat-icon" id="chaticon" style="display:flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; background:#2563eb; color:#fff; box-shadow:0 4px 14px rgba(0,0,0,.2); cursor:pointer; text-decoration:none;">\n              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">\n                <path fill="currentColor" d="M13.087 21.388l.542-.916c.42-.71.63-1.066.968-1.262c.338-.197.763-.204 1.613-.219c1.256-.021 2.043-.098 2.703-.372a5 5 0 0 0 2.706-2.706C22 14.995 22 13.83 22 11.5v-1c0-3.273 0-4.91-.737-6.112a5 5 0 0 0-1.65-1.651C18.41 2 16.773 2 13.5 2h-3c-3.273 0-4.91 0-6.112.737a5 5 0 0 0-1.651 1.65C2 5.59 2 7.228 2 10.5v1c0 2.33 0 3.495.38 4.413a5 5 0 0 0 2.707 2.706c.66.274 1.447.35 2.703.372c.85.015 1.275.022 1.613.219c.337.196.548.551.968 1.262l.542.916c.483.816 1.69.816 2.174 0z"/>\n              </svg>\n            </a>\n            <div id="chat-modal" class="cowrkr-chat-modal" style="display:none; position:absolute; right:0; bottom:56px; width:320px; max-height:min(500px, calc(100vh - 120px)); box-shadow:0 8px 32px rgba(0,0,0,.18); border-radius:12px; overflow:hidden; background:#fff;">\n              <iframe\n                title="Chat"\n                style="display:block; width:100%; height:500px; max-height:min(500px, calc(100vh - 120px)); border:0;">\n              </iframe>\n            </div>\n          </div>\n        ';

    var wrap = document.createElement("div");
    wrap.innerHTML = embeddedContent.trim();
    var widgetRoot = wrap.firstElementChild;
    var iframe = widgetRoot.querySelector("iframe");
    if (iframe) iframe.src = iframeSrc;
    document.body.appendChild(widgetRoot);
    var ChatModalDiv = widgetRoot.querySelector("#chat-modal");
    var ChatIcon = widgetRoot.querySelector("#chaticon");
    if (!ChatModalDiv || !ChatIcon) return;

    var chatOpen = false;

    ChatIcon.addEventListener("click", function (e) {
      e.preventDefault();
      chatOpen = !chatOpen;
      ChatModalDiv.style.display = chatOpen ? "block" : "none";
    });
  }

  window.__cowrkrEmbedChatInit = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
