"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { NoteList } from "@/components/note-list"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from 'lucide-react'
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Note } from "@/types/note"
import { useToast } from "@/components/ui/use-toast"

export function NotesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return;
    }
  }, [user, loading, router])

  useEffect(() => {
    // Only run this effect if we have a user and they're authenticated
    if (!user || loading) return;

    try {
      const q = query(
        collection(db, "notes"),
        where("userId", "==", user.uid)
      )

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const notesData: Note[] = []
          querySnapshot.forEach((doc) => {
            notesData.push({ id: doc.id, ...doc.data() } as Note)
          })
          setNotes(notesData)
          setIsLoading(false)
        },
        (error) => {
          console.error("Error fetching notes:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch notes. Please check Firebase permissions.",
          })
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up notes listener:", error)
      setIsLoading(false)
    }
  }, [user, loading, toast])

  const handleCreateNote = () => {
    router.push("/notes/new")
  }

  if (loading || isLoading) {
    return (
      <DashboardShell>
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Notes"
        text="Create and manage your notes."
      >
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </DashboardHeader>
      <NoteList notes={notes} isLoading={isLoading} />
    </DashboardShell>
  )
}

