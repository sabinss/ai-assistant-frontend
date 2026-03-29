(function () {
    function init() {
      const embedContainer = document.getElementById('embed-container');
      if (!embedContainer) return;
  
      const orgId = embedContainer.getAttribute('data-org');
      if (!orgId) return;
  
      // Mount on document.body so position:fixed is always relative to the viewport
      // (not clipped or offset by a transformed ancestor like #root).
      document.querySelectorAll('.cowrkr-chat-root').forEach((el) => el.remove());
  
      const embeddedContent = `
          <div class="cowrkr-chat-root" style="position:fixed; left:auto; top:auto; right:max(24px, env(safe-area-inset-right, 0px)); bottom:max(24px, env(safe-area-inset-bottom, 0px)); z-index:2147483647; margin:0; padding:0;">
            <a href="#" class="cowrkr-chat-icon" id="chaticon" style="display:flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; background:#2563eb; color:#fff; box-shadow:0 4px 14px rgba(0,0,0,.2); cursor:pointer; text-decoration:none;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M13.087 21.388l.542-.916c.42-.71.63-1.066.968-1.262c.338-.197.763-.204 1.613-.219c1.256-.021 2.043-.098 2.703-.372a5 5 0 0 0 2.706-2.706C22 14.995 22 13.83 22 11.5v-1c0-3.273 0-4.91-.737-6.112a5 5 0 0 0-1.65-1.651C18.41 2 16.773 2 13.5 2h-3c-3.273 0-4.91 0-6.112.737a5 5 0 0 0-1.651 1.65C2 5.59 2 7.228 2 10.5v1c0 2.33 0 3.495.38 4.413a5 5 0 0 0 2.707 2.706c.66.274 1.447.35 2.703.372c.85.015 1.275.022 1.613.219c.337.196.548.551.968 1.262l.542.916c.483.816 1.69.816 2.174 0z"/>
              </svg>
            </a>
            <div id="chat-modal" class="cowrkr-chat-modal" style="display:none; position:absolute; right:0; bottom:56px; width:320px; max-height:min(500px, calc(100vh - 120px)); box-shadow:0 8px 32px rgba(0,0,0,.18); border-radius:12px; overflow:hidden; background:#fff;">
              <iframe
                title="Chat"
                src="https://main.d2g25vge8n6qq6.amplifyapp.com/public_chat?org_id=${orgId}"
                style="display:block; width:100%; height:500px; max-height:min(500px, calc(100vh - 120px)); border:0;">
              </iframe>
            </div>
          </div>
        `;
  
      const wrap = document.createElement('div');
      wrap.innerHTML = embeddedContent.trim();
      const widgetRoot = wrap.firstElementChild;
      document.body.appendChild(widgetRoot);
      const ChatModalDiv = widgetRoot?.querySelector('#chat-modal');
      const ChatIcon = widgetRoot?.querySelector('#chaticon');
      if (!ChatModalDiv || !ChatIcon) return;
  
      let chatOpen = false;
  
      ChatIcon.addEventListener('click', function (e) {
        e.preventDefault();
        chatOpen = !chatOpen;
        ChatModalDiv.style.display = chatOpen ? 'block' : 'none';
      });
    }
  
    window.__cowrkrEmbedChatInit = init;
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  