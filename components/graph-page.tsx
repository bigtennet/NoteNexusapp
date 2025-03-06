"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { GraphView } from "@/components/graph-view"
import { Loader2 } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"

export function GraphPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const fetchNotes = async () => {
      try {
        const q = query(collection(db, "notes"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const notesData: Note[] = []
        querySnapshot.forEach((doc) => {
          notesData.push({ id: doc.id, ...doc.data() } as Note)
        })

        setNotes(notesData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching notes:", error)
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [user])

  if (loading || isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Graph View" text="Visualize connections between your notes." />
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Graph View" text="Visualize connections between your notes." />
      <div className="h-[calc(100vh-16rem)]">
        <GraphView notes={notes} />
      </div>
    </DashboardShell>
  )
}

