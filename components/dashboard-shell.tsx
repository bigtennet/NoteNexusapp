import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { BookOpen, Info } from "lucide-react"
import { InstallPrompt } from "@/components/install-prompt"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">NoteNexus</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/credits">
                <Info className="mr-2 h-4 w-4" />
                Credits
              </Link>
            </Button>
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden p-4">{children}</main>
      </div>
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NoteNexus. Created by{" "}
            <Link href="/credits" className="font-medium hover:underline">
              TENNET
            </Link>
          </p>
        </div>
      </footer>
      <InstallPrompt />
    </div>
  )
}

