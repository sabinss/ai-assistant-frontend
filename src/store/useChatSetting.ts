import { MOCK_DATA } from "@/constants"
import { create } from "zustand"

type chatConfig = {
  workflowFlag: boolean
  mockData: any
  setWorkFlowFlag: (workflowFlag: boolean) => void
  setMockData: (mockData: string) => void
}

const useChatConfig = create<chatConfig>((set) => ({
  workflowFlag: false,
  mockData: "",

  setWorkFlowFlag: (flag) => set({ workflowFlag: flag }),
  // Method to set the mock data
  setMockData: (mockData) => set({ mockData }),
}))

export default useChatConfig
