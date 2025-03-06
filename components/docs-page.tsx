"use client"

import { CardHeader } from "@/components/ui/card"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardTitle } from "@/components/ui/card"

export function DocsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  return (
    <DashboardShell>
      <DashboardHeader heading="Documentation" text="Learn how to use NoteNexus" />
      <Card>
        <CardHeader>
          <CardTitle>Welcome to NoteNexus Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This section is currently under construction. Check back soon for more information!</p>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

