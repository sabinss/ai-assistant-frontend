window.addEventListener('DOMContentLoaded', (event) => {
    // Get the organization ID from the embed-container
    const orgId = document.getElementById('embed-container').getAttribute('dataOrg');

    // Create and append HTML content based on the organization ID
    const embedContainer = document.getElementById('embed-container');

    // Example content to be embedded
    const embeddedContent = `
        <div class="widget"  style="position: relative;">
            <a href="#" class="chat-icon" id="chaticon" onclick="toggleChat()">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m13.087 21.388l.542-.916c.42-.71.63-1.066.968-1.262c.338-.197.763-.204 1.613-.219c1.256-.021 2.043-.098 2.703-.372a5 5 0 0 0 2.706-2.706C22 14.995 22 13.83 22 11.5v-1c0-3.273 0-4.91-.737-6.112a5 5 0 0 0-1.65-1.651C18.41 2 16.773 2 13.5 2h-3c-3.273 0-4.91 0-6.112.737a5 5 0 0 0-1.651 1.65C2 5.59 2 7.228 2 10.5v1c0 2.33 0 3.495.38 4.413a5 5 0 0 0 2.707 2.706c.66.274 1.447.35 2.703.372c.85.015 1.275.022 1.613.219c.337.196.548.551.968 1.262l.542.916c.483.816 1.69.816 2.174 0M14.97 7.299a.75.75 0 0 1 1.06 0l.209.209c.635.635 1.165 1.165 1.529 1.642c.384.503.654 1.035.654 1.68c0 .644-.27 1.176-.654 1.68c-.364.476-.894 1.006-1.53 1.642l-.208.208a.75.75 0 1 1-1.06-1.06l.171-.172c.682-.682 1.139-1.141 1.434-1.528c.283-.37.347-.586.347-.77c0-.185-.064-.4-.347-.77c-.295-.388-.752-.847-1.434-1.529l-.171-.171a.75.75 0 0 1 0-1.06m-.952-1.105a.75.75 0 1 0-1.449-.388l-2.588 9.66a.75.75 0 1 0 1.45.387zM9.03 7.3a.75.75 0 0 1 0 1.06l-.171.172c-.682.682-1.139 1.141-1.434 1.529c-.283.37-.347.585-.347.77c0 .184.064.4.347.77c.295.387.752.846 1.434 1.528l.171.171a.75.75 0 1 1-1.06 1.06l-.172-.17l-.037-.037c-.635-.636-1.165-1.165-1.529-1.643c-.384-.503-.654-1.035-.654-1.68c0-.644.27-1.176.654-1.68c.364-.476.894-1.006 1.53-1.641l.036-.037l.172-.172a.75.75 0 0 1 1.06 0" clip-rule="evenodd"/></svg>
            </a>
            <!-- Modal window for chat -->
            <div class="modal fade" id="chat-modal" tabindex="-1" role="dialog" style="display: none;">
                <div class="modal-dialog" role="document">
                    <div class="modal-content" style="position: absolute;">
                        <iframe src="https://main.d2g25vge8n6qq6.amplifyapp.com/public_chat?org_id=${orgId}" frameborder="0" width="100%" height="500" id="chat-iframe"></iframe>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append the embedded content to the embed-container
    embedContainer.innerHTML = embeddedContent;
    let chatOpen = false;
    const ChatModalDiv = document.getElementById("chat-modal");
    const ChatIcon = document.getElementById("chaticon");
    const ChatIframe = document.getElementById("chat-iframe");

    window.toggleChat = () => {
        chatOpen = !chatOpen;
        if (chatOpen) {
            ChatIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19.1 4.9C15.2 1 8.8 1 4.9 4.9S1 15.2 4.9 19.1s10.2 3.9 14.1 0s4-10.3.1-14.2m-4.3 11.3L12 13.4l-2.8 2.8l-1.4-1.4l2.8-2.8l-2.8-2.8l1.4-1.4l2.8 2.8l2.8-2.8l1.4 1.4l-2.8 2.8l2.8 2.8z"/></svg>`
            ChatModalDiv.style.display = "block";

        } else {
            ChatIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m13.087 21.388l.542-.916c.42-.71.63-1.066.968-1.262c.338-.197.763-.204 1.613-.219c1.256-.021 2.043-.098 2.703-.372a5 5 0 0 0 2.706-2.706C22 14.995 22 13.83 22 11.5v-1c0-3.273 0-4.91-.737-6.112a5 5 0 0 0-1.65-1.651C18.41 2 16.773 2 13.5 2h-3c-3.273 0-4.91 0-6.112.737a5 5 0 0 0-1.651 1.65C2 5.59 2 7.228 2 10.5v1c0 2.33 0 3.495.38 4.413a5 5 0 0 0 2.707 2.706c.66.274 1.447.35 2.703.372c.85.015 1.275.022 1.613.219c.337.196.548.551.968 1.262l.542.916c.483.816 1.69.816 2.174 0M14.97 7.299a.75.75 0 0 1 1.06 0l.209.209c.635.635 1.165 1.165 1.529 1.642c.384.503.654 1.035.654 1.68c0 .644-.27 1.176-.654 1.68c-.364.476-.894 1.006-1.53 1.642l-.208.208a.75.75 0 1 1-1.06-1.06l.171-.172c.682-.682 1.139-1.141 1.434-1.528c.283-.37.347-.586.347-.77c0-.185-.064-.4-.347-.77c-.295-.388-.752-.847-1.434-1.529l-.171-.171a.75.75 0 0 1 0-1.06m-.952-1.105a.75.75 0 1 0-1.449-.388l-2.588 9.66a.75.75 0 1 0 1.45.387zM9.03 7.3a.75.75 0 0 1 0 1.06l-.171.172c-.682.682-1.139 1.141-1.434 1.529c-.283.37-.347.585-.347.77c0 .184.064.4.347.77c.295.387.752.846 1.434 1.528l.171.171a.75.75 0 1 1-1.06 1.06l-.172-.17l-.037-.037c-.635-.636-1.165-1.165-1.529-1.643c-.384-.503-.654-1.035-.654-1.68c0-.644.27-1.176.654-1.68c.364-.476.894-1.006 1.53-1.641l.036-.037l.172-.172a.75.75 0 0 1 1.06 0" clip-rule="evenodd"/></svg>
            `
            ChatModalDiv.style.display = "none";
        }
    }
});
