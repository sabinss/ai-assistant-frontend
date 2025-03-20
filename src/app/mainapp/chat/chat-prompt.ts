const CHAT_PROMPTS = [
  {
    category: "Insights & Recommendations",
    prompts: [
      "Based on the CRM, CSM, Support information show me top 3 customers that has high chance of upsell",
      "Provide a summary of HIlton's CRM notes, product usage, support interactions, and sentiment and assess renewal likelihood from 1 to 5 , 5 being highest and provide your recommendations",
      "Analyze the CRM notes, support ticket, ticket comments, conversation, feedback for Hilton for last 4 months and rate the customer sentiments for last 4 months. The rating should be 1-10, 10 being highest. Provide rating for each month separately so that I can compare sentiment trend.",
    ],
  },
  {
    category: "Content Generation",
    prompts: [
      `Provide a status report and achievement plus challenges for quarterly business review (QBR) meeting for HIlton's with the information from CRM notes, product usage, support interactions, and sentiment .`,
      `Provide a customer success plan for HIlton's with the information from CRM notes, product usage, support interactions, and sentiment . The format of the customer success plan should have objectives, milestones, activities and metrics.`,
      `Based on CRM notes information for Hilton, identify anything I need to be caution about and draft me meeting agenda for an hour as I am meeting with them soon. `,
    ],
  },
  {
    category: "Data Entry",
    prompts: [
      `Add note for Holiday Inn in CRM and identify task from the notes and add in CRM. Plus draft a follow up email with customers based on this information. Here is the note"Meeting notes:`,
      `Create Support Ticket for Hyatt. Here is the description " Can not update closed invoice". The user is sarah@hyatt.com and subject is same as description. `,
      `Show me the trend of feature usage for Hilton and create a task in Hubspot to follow up with customer`,
    ],
  },
]

export default CHAT_PROMPTS
