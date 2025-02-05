"use client" // 👈 Add this line at the top

import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw" // Allows rendering inline HTML inside Markdown

const message = `- **Total Open Deals for Hilton:** 5
- **Total Open Customer Support Interactions for Hilton:** 5

### Insights and Recommendations:

1. **Renewal Probability:**
   - The number of open deals and open customer support interactions can provide insights into the likelihood of renewal. A moderate number of open deals (5) suggests active engagement with Hilton, which can be a positive indicator for renewal.
   - However, the same number of open customer support interactions (5) could imply potential issues or queries that need resolution. This may affect the renewal probability negatively if not addressed promptly.

2. **Actionable Recommendations:**
   - **Engagement Strategy:** Focus on closing the open deals by addressing any pending negotiations or requirements. This can enhance the relationship and increase the likelihood of renewal.
   - **Customer Support:** Prioritize resolving open customer support tickets to improve customer satisfaction. A proactive approach in addressing these issues can positively influence Hilton's decision to renew.
   - **Feedback Loop:** Establish a feedback mechanism to understand Hilton's concerns and expectations better. This can help in tailoring solutions that align with their needs, thereby increasing renewal chances.

By focusing on these areas, you can enhance the probability of Hilton renewing their engagement with your services.`

export default function Page() {
  return (
    <motion.div
      className="mx-auto max-w-3xl rounded-lg border border-gray-300 bg-gray-100 p-6 text-black shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Customer Success Plan
      </h2>
      {/* Add 'prose' class to enable proper Markdown styling */}
      <div className="prose prose-lg prose-gray max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message}</ReactMarkdown>
      </div>
    </motion.div>
  )
}
