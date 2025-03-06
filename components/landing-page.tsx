"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen, Link2, CloudIcon as CloudSync, Search, Info } from "lucide-react"
import Link from "next/link"

export function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">NoteNexus</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Log in
            </Button>
            <Button onClick={() => router.push("/signup")}>Sign up</Button>
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Your thoughts, connected.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A powerful Markdown note-taking app with bidirectional linking, graph visualization, and real-time
                  sync.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" onClick={() => router.push("/signup")}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
                  Log in
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                  <BookOpen className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Markdown Editor</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    Write in Markdown with syntax highlighting and live preview.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                  <Link2 className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Wikilinks</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    Connect your notes with bidirectional [[wikilinks]].
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                  <CloudSync className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Cloud Sync</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    Your notes sync across all your devices in real-time.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                  <Search className="h-10 w-10 text-primary" />
                  <h3 className="text-xl font-bold">Search & Tags</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    Find your notes quickly with powerful search and tagging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NoteNexus. Created by{" "}
            <Link href="/credits" className="font-medium hover:underline">
              TENNET
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/credits">
                <Info className="mr-2 h-4 w-4" />
                Credits
              </Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}

