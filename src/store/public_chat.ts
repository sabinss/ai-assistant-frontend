import { create } from "zustand";

type publicChat = {
    publicChat: boolean;
    publicChatHeaders: object;
    setPublicChat: (publicChat: boolean) => void;
    setPublicChatHeaders: (publicChatHeaders: object) => void;
};

const usePublicChat = create<publicChat>((set) => ({

    publicChat: false,

    setPublicChat: (publicChat: boolean) => {
        set((state) => {
            return ({ publicChat });
        })
    },

    publicChatHeaders: {},

    setPublicChatHeaders: (publicChatHeaders: object) => {
        set((state) => {
            return ({ publicChatHeaders });
        })
    },
}));

export default usePublicChat;
