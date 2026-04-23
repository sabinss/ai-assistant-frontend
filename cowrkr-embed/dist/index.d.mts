type CowrkrEmbedUser = {
    name?: string;
    displayName?: string;
    email?: string;
    userId?: string | number;
    id?: string | number;
    company_id?: string | number | null;
};
type CowrkrEmbedInitOptions = {
    user?: CowrkrEmbedUser;
    /**
     * HTTPS origin for the Cowrkr app (no trailing slash), e.g. `https://staging.cowrkr.com`.
     * If omitted or empty, `FIXED_CHAT_ORIGIN` is used.
     */
    chatOrigin?: string;
};
type CowrkrEmbedConfig = {
    user?: CowrkrEmbedUser;
    chatOrigin?: string;
};

declare const FIXED_ORG_ID = "68a4a47efc4f54cacb902baa";
/** Used when `init()` is called without `chatOrigin`. */
declare const FIXED_CHAT_ORIGIN = "https://staging.mycowrkr.cloud";

declare global {
    interface Window {
        __cowrkrEmbedConfig?: CowrkrEmbedConfig;
        __cowrkrEmbedChatInit?: () => void;
    }
}
/**
 * Resolves `/public_chat` base URL: optional `chatOrigin` from `init()`, else `FIXED_CHAT_ORIGIN`.
 */
declare function resolveChatPageUrl(): string;
declare function getEmbedContext(embedContainer: HTMLElement): {
    orgId: string;
    user: {
        name: string;
        email: string;
        userId: string;
        company_id?: string;
    };
};
declare function buildChatIframeSrc(ctx: ReturnType<typeof getEmbedContext>): string;
declare function mountWidget(): void;
declare function removeWidget(): void;

declare global {
    interface Window {
        __cowrkrEmbedConfig?: CowrkrEmbedConfig;
        __cowrkrEmbedChatInit?: () => void;
    }
}
/**
 * Shows the floating chat. Pass `chatOrigin` to override the iframe base; otherwise `FIXED_CHAT_ORIGIN` is used.
 */
declare function init(config?: CowrkrEmbedInitOptions): void;
declare function destroy(): void;

export { type CowrkrEmbedConfig, type CowrkrEmbedInitOptions, type CowrkrEmbedUser, FIXED_CHAT_ORIGIN, FIXED_ORG_ID, buildChatIframeSrc, destroy, getEmbedContext, init, mountWidget, removeWidget, resolveChatPageUrl };
