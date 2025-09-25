import qs from "query-string"
// const parseMarkup = (markdownText: any) => {
//   return marked(markdownText)
// }

function parseMarkup(str: string) {
  return str.replace(/<[^>]*>/g, "")
}

function formatCurrency(amount: number) {
  if (!amount) return 0
  const number = amount.toString().replace("$", "")
  const UsDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })
  return UsDollar.format(+number)
}

// let USDollar =
function timeAgo(date: string) {
  const now = new Date()
  const givenDate = new Date(date)
  const secondsDiff = Math.floor((now.getTime() - givenDate.getTime()) / 1000) // Difference in seconds

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

const getBubbleSize = (arr: number) => {
  // Base size: 6px, max size: 18px
  // Higher ARR values = bigger bubbles
  if (!arr || arr <= 0) return 6
  // Normalize ARR to a reasonable range (assuming max ARR is around 1M)
  const normalizedArr = Math.min(arr / 1000000, 1) // Cap at 1M
  return Math.max(6, Math.min(18, 6 + normalizedArr * 12))
}

const getHoverSize = (arr: number) => {
  // Hover size is 1.5x the base size
  return getBubbleSize(arr) * 1.5
}

export {
  parseMarkup,
  timeAgo,
  formUrlQuery,
  formatCurrency,
  getBubbleSize,
  getHoverSize,
}
