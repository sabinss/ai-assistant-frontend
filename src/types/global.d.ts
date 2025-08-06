declare global {
  interface Window {
    trackEvent: (
      feature: string,
      data: {
        email?: string
        organization?: string
        [key: string]: any
      }
    ) => void
  }
}

export {}
