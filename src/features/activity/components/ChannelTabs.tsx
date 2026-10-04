"use client"

import { MessageSquare, Phone, Mail } from "lucide-react"
import type { ChannelTab, ChannelTabConfig } from "../types"

const TAB_ICONS = {
  texts: MessageSquare,
  calls: Phone,
  emails: Mail,
} as const

type ChannelTabsProps = {
  tabs: ChannelTabConfig[]
  activeTab: ChannelTab
  onChange: (tab: ChannelTab) => void
}

export default function ChannelTabs({ tabs, activeTab, onChange }: ChannelTabsProps) {
  return (
    <div className="flex gap-6 border-b border-[#E2E6EF]">
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.id]
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 pb-2.5 text-[14px] font-medium transition-colors ${
              isActive ? "text-[#1B3A8C]" : "text-[#6B7280] hover:text-[#1B3A8C]"
            }`}
          >
            <Icon size={16} strokeWidth={2} />
            {tab.label}
            {tab.badge && (
              <span className="rounded-full bg-[#E85D3B] px-2 py-0.5 text-[11px] font-medium text-white">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#1B3A8C]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
