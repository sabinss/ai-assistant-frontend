import { create } from "zustand"

type NavBarStore = {
  isCollapsed: boolean
  showSideBar: boolean
  toggleCollapse: () => void
  setCollapse: () => void
  setOpen: () => void
  greeting: string
  setGreeting: (greeting: string) => void
  botName: string
  setBotName: (botName: string) => void
  handleSideBar: (flag: boolean) => void
}

const useNavBarStore = create<NavBarStore>((set) => ({
  isCollapsed: true,
  showSideBar: true,
  toggleCollapse: () => {
    set((state) => {
      return { isCollapsed: !state.isCollapsed }
    })
  },
  setCollapse: () => {
    set((state) => {
      return { isCollapsed: true }
    })
  },
  handleSideBar: () => {
    set((state) => {
      return { showSideBar: !state.showSideBar }
    })
  },
  setOpen: () => {
    set((state) => {
      return { isCollapsed: false }
    })
  },
  greeting: "Hello X",
  setGreeting: (greeting: string) => {
    set((state) => {
      return { greeting }
    })
  },
  botName: "Gabby",
  setBotName(botName: string) {
    set((state) => {
      return { botName }
    })
  },
}))

export default useNavBarStore
