import { MOCK_DATA } from "@/constants"
import { create } from "zustand"

type chatConfig = {
  workflowFlag: boolean
  mockData: any
  sessionId: string | null
  setWorkFlowFlag: (workflowFlag: boolean) => void
  setMockData: (mockData: string) => void
  setSessionId: (sessionId: any) => void
}

const useChatConfig = create<chatConfig>((set) => ({
  workflowFlag: false,
  mockData: "",
  sessionId: null,

  setWorkFlowFlag: (flag) => set({ workflowFlag: flag }),
  // Method to set the mock data
  setMockData: (mockData) => set({ mockData }),
  setSessionId: (sessionId: any) => set({ sessionId }),
}))

export default useChatConfig
