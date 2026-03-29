import { create } from "zustand"

type publicChat = {
  publicChat: boolean
  publicChatHeaders: object
  /** From /public_chat?user_name=… — shown in top bar instead of bot name when set. */
  publicVisitorDisplayName: string | null
  setPublicChat: (publicChat: boolean) => void
  setPublicChatHeaders: (publicChatHeaders: object) => void
  setPublicVisitorDisplayName: (name: string | null) => void
}

const usePublicChat = create<publicChat>((set) => ({
  publicChat: false,

  setPublicChat: (publicChat: boolean) => {
    set((state) => {
      return { publicChat }
    })
  },

  publicChatHeaders: {},

  setPublicChatHeaders: (publicChatHeaders: object) => {
    set((state) => {
      return { publicChatHeaders }
    })
  },

  publicVisitorDisplayName: null,

  setPublicVisitorDisplayName: (publicVisitorDisplayName: string | null) => {
    set({ publicVisitorDisplayName })
  },
}))

export default usePublicChat
