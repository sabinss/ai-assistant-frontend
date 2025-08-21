import { create } from "zustand"

type ApiType = {
  apiType: string
  setApiType: (apiType: string) => void
}

const useApiType = create<ApiType>((set) => ({
  apiType: "Product Knowledge",
  setApiType: (apiType: string) => {
    set({ apiType })
  },
}))

export default useApiType
