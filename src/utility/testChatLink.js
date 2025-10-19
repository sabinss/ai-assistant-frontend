/**
 * Test script to demonstrate the chat link functionality
 * Run this in the browser console to test the email functionality
 */

// Test function to generate and display email template
function testEmailTemplate() {
  const query = "hi"
  const chatUrl = `${window.location.origin}/mainapp/chat?query=${encodeURIComponent(query)}`

  console.log("=== CHAT LINK TEST ===")
  console.log("Generated URL:", chatUrl)
  console.log("")
  console.log("To test manually:")
  console.log("1. Copy the URL above")
  console.log("2. Open it in a new tab")
  console.log("3. The chat should open with 'hi' pre-filled and auto-sent")
  console.log("")
  console.log(
    "To test with different queries, modify the 'query' variable above"
  )
}

// Test function to open the chat link
function testOpenChatLink(query = "hi") {
  const chatUrl = `${window.location.origin}/mainapp/chat?query=${encodeURIComponent(query)}`
  window.open(chatUrl, "_blank")
  console.log(`Opened chat with query: "${query}"`)
}

// Test function to simulate email template
function testEmailTemplateHTML(query = "hi") {
  const chatUrl = `${window.location.origin}/mainapp/chat?query=${encodeURIComponent(query)}`

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Test Chat Link</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #174894; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1>🤖 AI Assistant Test</h1>
      </div>
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2>Test Chat Functionality</h2>
        <p>Click the button below to test the chat functionality with a pre-filled query:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${chatUrl}" 
             style="display: inline-block; background-color: #174894; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;"
             target="_blank">
            Open Chat with Query: "${query}"
          </a>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #174894;">
          <h3>What happens when you click:</h3>
          <ul>
            <li>Opens the chat section in a new tab</li>
            <li>Pre-fills the chat input with: <strong>"${query}"</strong></li>
            <li>Automatically sends the message</li>
          </ul>
        </div>
        
        <p>This is a test email to verify the chat functionality works correctly with URL parameters.</p>
      </div>
    </body>
    </html>
  `

  console.log("=== EMAIL TEMPLATE HTML ===")
  console.log(htmlTemplate)

  // Open the template in a new window for preview
  const newWindow = window.open("", "_blank")
  newWindow.document.write(htmlTemplate)
  newWindow.document.close()

  return htmlTemplate
}

// Export functions for use
window.testEmailTemplate = testEmailTemplate
window.testOpenChatLink = testOpenChatLink
window.testEmailTemplateHTML = testEmailTemplateHTML

console.log("Chat link test functions loaded!")
console.log("Available functions:")
console.log("- testEmailTemplate() - Generate and display test info")
console.log("- testOpenChatLink('your query') - Open chat with specific query")
console.log(
  "- testEmailTemplateHTML('your query') - Generate and preview email template"
)
