const CHAT_PROMPTS = [
  {
    category: "Insights",
    prompts: [
      "Provide a status report and achievement plus challenges for quarterly business review (QBR) meeting for HIlton's with the information from CRM notes, product usage, support interactions, and sentiment .",
      "Based on the CRM, CSM, Support information show me top 3 customers that has high chance of upsell",
    ],
  },
  {
    category: "Content Generation and Action",
    prompts: [
      `Add note for Holiday Inn in CRM and identify task from the notes and add in CRM. Plus draft a follow up email with customers based on this information. Here is the note"Meeting notes:`,
      `Provide a customer success plan for HIlton's with the information from CRM notes, product usage, support interactions, and sentiment . The format of the customer success plan should have objectives, milestones, activities and metrics.`,
    ],
  },
  {
    category: "Specialized Tasks",
    prompts: [
      `Provide a summary of HIlton's CRM notes, product usage, support interactions, and sentiment and assess renewal likelihood from 1 to 5 , 5 being highest and provide your recommendations`,
    ],
  },
]

export default CHAT_PROMPTS
