(function () {
    let initialized = false;
  
    function init() {
      if (initialized) return; // prevent double init
      initialized = true;
  
      const embedContainer = document.getElementById('embed-container');
      if (!embedContainer) return;
  
      const orgId = embedContainer.getAttribute('data-org');
      if (!orgId) return;
  
      const embeddedContent = `
        <div class="widget" style="position: relative;">
          
          <a href="#" id="chaticon" style="cursor:pointer;">
            <!-- Chat Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M13.087 21.388l.542-.916c.42-.71.63-1.066.968-1.262c.338-.197.763-.204 1.613-.219c1.256-.021 2.043-.098 2.703-.372a5 5 0 0 0 2.706-2.706C22 14.995 22 13.83 22 11.5v-1c0-3.273 0-4.91-.737-6.112a5 5 0 0 0-1.65-1.651C18.41 2 16.773 2 13.5 2h-3c-3.273 0-4.91 0-6.112.737a5 5 0 0 0-1.651 1.65C2 5.59 2 7.228 2 10.5v1c0 2.33 0 3.495.38 4.413a5 5 0 0 0 2.707 2.706c.66.274 1.447.35 2.703.372c.85.015 1.275.022 1.613.219c.337.196.548.551.968 1.262l.542.916c.483.816 1.69.816 2.174 0z"/>
            </svg>
          </a>
  
          <div id="chat-modal" style="display:none; position:absolute; bottom:50px; right:0;">
            <iframe 
              src="https://main.d2g25vge8n6qq6.amplifyapp.com/public_chat?org_id=${orgId}" 
              frameborder="0" 
              width="320" 
              height="500">
            </iframe>
          </div>
  
        </div>
      `;
  
      embedContainer.innerHTML = embeddedContent;
  
      const ChatModalDiv = document.getElementById("chat-modal");
      const ChatIcon = document.getElementById("chaticon");
  
      let chatOpen = false;
  
      ChatIcon.addEventListener("click", function (e) {
        e.preventDefault();
        chatOpen = !chatOpen;
        ChatModalDiv.style.display = chatOpen ? "block" : "none";
      });
    }
  
    // ✅ Works in both HTML and React
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  
  })();