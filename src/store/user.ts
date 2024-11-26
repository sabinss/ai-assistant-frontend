import { create } from "zustand"
import { persist } from "zustand/middleware"

type UserData = {
  email: string
  user_id: string
  organization: string
  first_name: string
  last_name: string
  role: string
  status: string
}

type UserStore = {
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  is_logged_in: boolean | undefined
  user_data: UserData | null
  access_token: string | null
  loginUser: (
    user_data: UserData,
    access_token: string,
    rolePermission: string[],
    chatSession: string
  ) => void
  logoutUser: () => void
  rolePermission: string[]
  chatSession: string
  setChatSession: (chatSession: string) => void
  setOrgToken: (token: string) => void
}

const useAuth = create(
  persist<UserStore>(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        })
      },
      chatSession: "",
      rolePermission: [],
      is_logged_in: undefined,
      user_data: null,
      access_token: null,
      loginUser: (
        user_data: UserData,
        access_token: string,
        rolePermission: string[],
        chatSession: string
      ) => {
        set((state) => ({
          ...state,
          is_logged_in: true,
          user_data,
          access_token,
          rolePermission,
          chatSession,
        }))
      },

      logoutUser: () => {
        set((state) => ({
          ...state,
          is_logged_in: false,
          user_data: null,
          access_token: null,
          rolePermission: [],
          chatSession: "",
        }))
      },
      setChatSession: (chatSession: string) => {
        set((state) => ({
          ...state,
          chatSession,
        }))
      },
    }),
    {
      name: "agile-user-data", // unique name for the storage
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
    }
  )
)

export default useAuth
