"use client"

import * as React from "react"
import { X, Search, Check, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

export interface Tool {
  name: string
  description: string
}

// Default tools list with descriptions
export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: "insert_summary_in_redshift",
    description:
      "Insert or update customer engagement summary data (sentiment, opportunity, risk, followup, summary_info) into Redshift or RDS for a specific tenant, company, and week date.",
  },
  {
    name: "insert_customer_score_in_redshift",
    description:
      "Insert or update monthly customer score data (health score, churn risk score, expansion opportunity score, recommendations, and analyses) into Redshift or RDS for a specific tenant, customer, year, and month.",
  },
  {
    name: "query_database",
    description:
      "Convert a natural language query to SQL and execute it on the RDS PostgreSQL or Redshift database, returning the query results.",
  },
  {
    name: "call_rag_api",
    description:
      "Send a query to the RAG API with the organization ID and return the answer from the knowledge base.",
  },
  {
    name: "create_note_hubspot",
    description:
      "Create a note in HubSpot associated with a company, including the note body and timestamp.",
  },
  {
    name: "create_task_hubspot",
    description:
      "Create a task in HubSpot associated with a company, including task body, timestamp, and optional owner assignment.",
  },
  {
    name: "send_personalized_emails",
    description:
      "Send personalized emails to a list of recipients using Gmail, with custom subject and body content.",
  },
  {
    name: "create_email_in_draftbox",
    description:
      "Create an email draft in Gmail draft box for a list of recipients with custom subject and body content, without sending it.",
  },
  {
    name: "create_zendesk_ticket_for_unresolved_issues",
    description: "Create a support ticket in Zendesk for unresolved customer issues.",
  },
  {
    name: "send_whatsapp_message",
    description:
      "Send a WhatsApp message to a business organization using the specified phone number and message content.",
  },
  {
    name: "add_company_engagement_summary_score",
    description:
      "Add or update company engagement summary scores (health score, churn risk score, expansion opportunity score) in Redshift or RDS for a specific company.",
  },
  {
    name: "add_score_details",
    description:
      "Insert or update a score detail record in Redshift or RDS, including score type, score driver ID, score value, and score analysis for a specific customer, year, and month.",
  },
  {
    name: "send_email_tool",
    description:
      "Send an email using SMTP with an HTML template to one or more recipients, supporting custom message content and optional tokens.",
  },
  {
    name: "set_company_logs_flag",
    description:
      "Set a specific boolean flag to True for a company in the companies_change_log table in Redshift or RDS for a given change date.",
  },
  {
    name: "insert_alert_in_redshift",
    description:
      "Insert or update an alert in the alert_log_table in Redshift or RDS, including alert type, alert message, URL, recipients, and status flags, with auto-generated alert ID and timestamps.",
  },
  {
    name: "update_alert_sent_status",
    description:
      "Update the sent_date field in the alert_log_table with the current timestamp for a specific alert ID.",
  },
  {
    name: "send_email_via_crm",
    description:
      "Send an email via the CRM Conversations API to a contact using the contact ID, with custom subject and HTML body content.",
  },
]

interface ToolsMultiSelectProps {
  selectedTools: string[]
  onChange: (tools: string[]) => void
  tools?: Tool[]
  placeholder?: string
  className?: string
}

export function ToolsMultiSelect({
  selectedTools = [],
  onChange,
  tools = AVAILABLE_TOOLS,
  placeholder = "Select tools...",
  className,
}: ToolsMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Ensure selectedTools is always an array
  const safeSelectedTools = Array.isArray(selectedTools) ? selectedTools : []

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (toolName: string) => {
    if (safeSelectedTools.includes(toolName)) {
      onChange(safeSelectedTools.filter((t) => t !== toolName))
    } else {
      onChange([...safeSelectedTools, toolName])
    }
  }

  const handleRemove = (toolName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(safeSelectedTools.filter((t) => t !== toolName))
  }

  const handleSelectAll = () => {
    if (safeSelectedTools.length === tools.length) {
      onChange([])
    } else {
      onChange(tools.map((t) => t.name))
    }
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const getToolDescription = (toolName: string) => {
    return tools.find((t) => t.name === toolName)?.description || ""
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex min-h-[42px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white bg-white p-2 text-sm transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
              className
            )}
          >
            {safeSelectedTools.length > 0 ? (
              <>
                {safeSelectedTools.map((toolName) => (
                  <Tooltip key={toolName}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                        <Wrench className="h-3 w-3 text-gray-400" />
                        {toolName}
                        <button
                          onClick={(e) => handleRemove(toolName, e)}
                          className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-100"
                        >
                          <X className="h-3 w-3 text-gray-400" />
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[300px] bg-gray-900 text-white">
                      <p className="text-xs">{getToolDescription(toolName)}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {safeSelectedTools.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="ml-auto rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] border-gray-700 bg-[#1a1f2e] p-0" align="start">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-700 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Options List */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {/* Select All Option */}
            <div
              onClick={handleSelectAll}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-white transition-colors hover:bg-gray-700/50"
            >
              <Checkbox
                checked={safeSelectedTools.length === tools.length}
                className="h-4 w-4 border-gray-500 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
              />
              <span className="text-sm font-medium">(Select All)</span>
            </div>

            {/* Tool Options */}
            {filteredTools.map((tool) => {
              const isSelected = safeSelectedTools.includes(tool.name)
              return (
                <Tooltip key={tool.name}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleSelect(tool.name)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-white transition-colors hover:bg-gray-700/50"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="h-4 w-4 border-gray-500 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                      />
                      <Wrench className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{tool.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="max-w-[350px] border-gray-700 bg-gray-900 text-white"
                  >
                    <p className="text-xs leading-relaxed">{tool.description}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}

            {filteredTools.length === 0 && (
              <div className="py-4 text-center text-sm text-gray-400">No tools found</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
