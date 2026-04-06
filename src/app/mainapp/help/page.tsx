"use client"

const HelpPage = () => {
  return (
    <div className="flex min-h-[min(100%,calc(100vh-120px))] w-full flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Help</h1>
      <p className="text-muted-foreground">
        Use the chat bubble in the corner to reach support. It stays available on every page while you
        navigate the app.
      </p>
    </div>
  )
}

export default HelpPage
