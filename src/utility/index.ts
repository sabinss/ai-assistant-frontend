import { marked } from "marked"

// const parseMarkup = (markdownText: any) => {
//   return marked(markdownText)
// }

function parseMarkup(markdown: string) {
  if (!markdown || typeof markdown !== "string") {
    return ""
  }

  // Remove headers (e.g., # Header, ## Subheader)
  markdown = markdown.replace(/^#{1,6}\s+/gm, "")

  // Remove bold/italic (e.g., **bold**, __bold__, *italic*, _italic_)
  markdown = markdown.replace(/(\*\*|__)(.*?)\1/g, "$2")
  markdown = markdown.replace(/(\*|_)(.*?)\1/g, "$2")

  // Remove strikethrough (e.g., ~~strikethrough~~)
  markdown = markdown.replace(/~~(.*?)~~/g, "$1")

  // Remove images (e.g., ![alt text](url))
  markdown = markdown.replace(/!\[.*?\]\(.*?\)/g, "")

  // Remove links (e.g., [text](url))
  markdown = markdown.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")

  // Remove blockquotes (e.g., > Blockquote)
  markdown = markdown.replace(/^\s*>+/gm, "")

  // Remove inline code (e.g., `code`)
  markdown = markdown.replace(/`(.*?)`/g, "$1")

  // Remove code blocks (e.g., ``` or ~~~ for multi-line code blocks)
  markdown = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "")

  // Remove horizontal rules (e.g., --- or ***)
  markdown = markdown.replace(/^-{3,}|^\*{3,}/gm, "")

  // Remove lists (e.g., - item or * item or 1. item)
  markdown = markdown.replace(/^\s*[-*+]\s+/gm, "")
  markdown = markdown.replace(/^\s*\d+\.\s+/gm, "")

  // Remove extra newlines and trim
  markdown = markdown.replace(/\n{2,}/g, "\n").trim()

  return markdown
}

export { parseMarkup }
