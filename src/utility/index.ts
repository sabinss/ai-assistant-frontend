import qs from "query-string"
import { marked } from "marked"
import input from "postcss/lib/input"

// const parseMarkup = (markdownText: any) => {
//   return marked(markdownText)
// }
const parseMarkup = (text: string) => {
  return text.replace(/<[^>]*>/g, "") // Method 1: Regular Expression
  // Alternatively, you could use Method 2:
  // const parser = new DOMParser();
  // const doc = parser.parseFromString(text, 'text/html');
  // return doc.body.textContent || "";
}

// function parseMarkup(markdown: string) {
//   if (!markdown || typeof markdown !== "string") {
//     return ""
//   }

//   // Remove headers (e.g., # Header, ## Subheader)
//   markdown = markdown.replace(/^#{1,6}\s+/gm, "")

//   // Remove bold/italic (e.g., **bold**, __bold__, *italic*, _italic_)
//   markdown = markdown.replace(/(\*\*|__)(.*?)\1/g, "$2")
//   markdown = markdown.replace(/(\*|_)(.*?)\1/g, "$2")

//   // Remove strikethrough (e.g., ~~strikethrough~~)
//   markdown = markdown.replace(/~~(.*?)~~/g, "$1")

//   // Remove images (e.g., ![alt text](url))
//   markdown = markdown.replace(/!\[.*?\]\(.*?\)/g, "")

//   // Remove links (e.g., [text](url))
//   markdown = markdown.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")

//   // Remove blockquotes (e.g., > Blockquote)
//   markdown = markdown.replace(/^\s*>+/gm, "")

//   // Remove inline code (e.g., `code`)
//   markdown = markdown.replace(/`(.*?)`/g, "$1")

//   // Remove code blocks (e.g., ``` or ~~~ for multi-line code blocks)
//   markdown = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "")

//   // Remove horizontal rules (e.g., --- or ***)
//   markdown = markdown.replace(/^-{3,}|^\*{3,}/gm, "")

//   // Remove lists (e.g., - item or * item or 1. item)
//   markdown = markdown.replace(/^\s*[-*+]\s+/gm, "")
//   markdown = markdown.replace(/^\s*\d+\.\s+/gm, "")

//   // Remove extra newlines and trim
//   markdown = markdown.replace(/\n{2,}/g, "\n").trim()

//   return markdown
// }
function timeAgo(date: string) {
  const now = new Date()
  const givenDate = new Date(date)
  const secondsDiff = Math.floor((now - givenDate) / 1000) // Difference in seconds

  if (secondsDiff < 60) {
    return `${secondsDiff} seconds ago`
  }

  const minutesDiff = Math.floor(secondsDiff / 60)
  if (minutesDiff < 60) {
    return `${minutesDiff} minutes ago`
  }

  const hoursDiff = Math.floor(minutesDiff / 60)
  if (hoursDiff < 24) {
    return `${hoursDiff} hours ago`
  }

  const daysDiff = Math.floor(hoursDiff / 24)
  if (daysDiff < 30) {
    return `${daysDiff} days ago`
  }

  const monthsDiff = Math.floor(daysDiff / 30)
  if (monthsDiff < 12) {
    return `${monthsDiff} months ago`
  }

  const yearsDiff = Math.floor(monthsDiff / 12)
  return `${yearsDiff} years ago`
}
interface UrlQueryParams {
  params: string
  key: string
  value: string | null
}

const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params)

  currentUrl[key] = value

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  )
}
/**
 * Converts a Markdown or HTML markup string to HTML.
 *
 * @param {string} markupText - The markup text to convert.
 * @returns {string} The HTML string.
 */
const convertMarkupToHtml = (markupText: string) => {
  // If the text already contains HTML tags, return it as-is
  if (/<\/?[a-z][\s\S]*>/i.test(markupText)) {
    return markupText
  }

  // Otherwise, treat it as Markdown and convert to HTML
  return marked(markupText) ?? ""
}
const removeHtmlTags = (input: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(input, "text/html")
  return doc.body.textContent || ""
}

export {
  parseMarkup,
  timeAgo,
  formUrlQuery,
  convertMarkupToHtml,
  removeHtmlTags,
}
