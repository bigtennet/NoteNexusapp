"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches

    if (isAppInstalled) {
      return // Don't show the prompt if already installed
    }

    // Store the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Check if we should show the prompt (e.g., not shown in the last 30 days)
      const lastPromptTime = localStorage.getItem("installPromptLastShown")
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

      if (!lastPromptTime || Date.now() - Number.parseInt(lastPromptTime) > thirtyDaysInMs) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice

    // Reset the deferred prompt variable
    setDeferredPrompt(null)
    setShowPrompt(false)

    // Record when we showed the prompt
    localStorage.setItem("installPromptLastShown", Date.now().toString())

    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }
  }

  const handleClose = () => {
    setShowPrompt(false)
    localStorage.setItem("installPromptLastShown", Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install NoteNexus</DialogTitle>
          <DialogDescription>Install NoteNexus on your device for a better experience. You'll get:</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center text-center p-4 border rounded-lg">
            <Download className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-medium">Offline Access</h3>
            <p className="text-sm text-muted-foreground">Access your notes even without internet</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 border rounded-lg">
            <svg
              className="h-8 w-8 mb-2 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <h3 className="font-medium">App Experience</h3>
            <p className="text-sm text-muted-foreground">Use NoteNexus like a native app</p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:w-auto w-full">
            Not Now
          </Button>
          <Button onClick={handleInstall} className="sm:w-auto w-full">
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

