function InsightsPanel() {
  return (
    <div className="flex h-full w-full max-w-sm flex-col border-r border-gray-200 bg-[#f2f4fb] p-4">
      <div className="flex flex-grow flex-col rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-blue-700">
          Customer Insights AI
        </h2>
        <p className="mb-4 text-sm text-gray-700">
          👋 Hi! I'm here to help you understand your customer insights. Click
          on any metric card or ask me questions about your scores, trends, and
          recommendations.
        </p>

        <div className="mt-auto">
          <p className="mb-2 font-semibold text-gray-600">Quick Questions:</p>
          <ul className="space-y-2">
            <li className="cursor-pointer rounded bg-gray-100 px-3 py-2 hover:bg-gray-200">
              What's driving our satisfaction score?
            </li>
            <li className="cursor-pointer rounded bg-gray-100 px-3 py-2 hover:bg-gray-200">
              How can we improve response time?
            </li>
            <li className="cursor-pointer rounded bg-gray-100 px-3 py-2 hover:bg-gray-200">
              What actions should we prioritize?
            </li>
            <li className="cursor-pointer rounded bg-gray-100 px-3 py-2 hover:bg-gray-200">
              Show me trend analysis
            </li>
          </ul>

          <div className="mt-4 flex items-center rounded border bg-white px-3 py-2">
            <input
              type="text"
              placeholder="Ask about your metrics..."
              className="flex-grow text-sm outline-none"
            />
            <button className="ml-2 text-blue-600">➤</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InsightsPanel
