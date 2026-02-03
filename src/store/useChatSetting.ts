import { MOCK_DATA } from "@/constants"
import { create } from "zustand"

type chatConfig = {
  workflowFlag: boolean
  mockData: any
  sessionId: string | null
  selectedAgentGreeting: string | null
  selectedAgentName: string | null
  setWorkFlowFlag: (workflowFlag: boolean) => void
  setMockData: (mockData: string) => void
  setSessionId: (sessionId: any) => void
  setSelectedAgentInfo: (greeting: string | null, agentName: string | null) => void
}

const useChatConfig = create<chatConfig>((set) => ({
  workflowFlag: false,
  mockData: "",
  sessionId: null,
  selectedAgentGreeting: null,
  selectedAgentName: null,

  setWorkFlowFlag: (flag) => set({ workflowFlag: flag }),
  setMockData: (mockData) => set({ mockData }),
  setSessionId: (sessionId: any) => set({ sessionId }),
  setSelectedAgentInfo: (greeting, agentName) =>
    set({ selectedAgentGreeting: greeting ?? null, selectedAgentName: agentName ?? null }),
}))

export default useChatConfig
