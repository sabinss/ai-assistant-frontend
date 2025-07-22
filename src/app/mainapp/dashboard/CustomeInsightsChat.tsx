export default function InsightsPanel() {
  return (
    <div className="flex h-full w-full flex-col bg-[#f2f4fb] p-2">
      {/* Chat Header */}
      <div className="rounded-t-xl bg-blue-600 px-4 py-3 font-semibold text-white">
        Customer Insights AI
        <p className="text-sm font-normal text-white/90">
          Ask me anything about your metrics
        </p>
        <p className="mb-4 text-sm text-white">
          👋 Hi! I'm here to help you understand your customer insights. Click
          on any metric card or ask me questions about your scores, trends, and
          recommendations.
        </p>
      </div>

      {/* Chat Body */}
      <div className="flex flex-grow flex-col overflow-y-auto px-4 py-3">
        <div className="mb-4 text-sm text-gray-700">
          👋 Hi! I'm here to help you understand your customer insights...
        </div>

        <div className="mt-auto space-y-2 text-sm">
          <p className="text-xs font-medium text-gray-600">Quick Questions:</p>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            What’s driving our satisfaction score?
          </button>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            How can we improve response time?
          </button>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            What actions should we prioritize?
          </button>
          <button className="w-full rounded bg-white px-3 py-2 text-left text-sm shadow">
            Show me trend analysis
          </button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="mb-8 border-t bg-white p-5">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <input
            type="text"
            placeholder="Ask about your metrics..."
            className="w-full border-none bg-transparent text-sm outline-none"
          />
          <button className="text-blue-600">➤</button>
        </div>
      </div>
    </div>
  )
}
