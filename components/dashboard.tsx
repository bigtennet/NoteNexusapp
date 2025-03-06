"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { NoteList } from "@/components/note-list"
import { GraphView } from "@/components/graph-view"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Users } from "lucide-react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function Dashboard() {
  // All hooks must be called at the top level, unconditionally
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>([])
  const [sharedNotes, setSharedNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useLocalStorage("dashboard-tab", "notes")

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Fetch notes
  useEffect(() => {
    if (!user || loading) return () => {}

    try {
      // Query for user's own notes
      const q = query(collection(db, "notes"), where("userId", "==", user.uid))

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
        },
      )

      return unsubscribe
    } catch (error) {
      console.error("Error setting up notes listener:", error)
      setIsLoading(false)
      return () => {}
    }
  }, [user, loading, toast])

  // Fetch shared notes
  useEffect(() => {
    if (!user || loading) return () => {}

    try {
      // Query for notes shared with the user
      const q = query(
        collection(db, "notes"),
        where("sharedWith", "array-contains", {
          email: user.email,
          role: "viewer",
        }),
      )

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const sharedNotesData: Note[] = []
          querySnapshot.forEach((doc) => {
            sharedNotesData.push({ id: doc.id, ...doc.data() } as Note)
          })
          setSharedNotes(sharedNotesData)
        },
        (error) => {
          console.error("Error fetching shared notes:", error)
        },
      )

      return unsubscribe
    } catch (error) {
      console.error("Error setting up shared notes listener:", error)
      return () => {}
    }
  }, [user, loading])

  const handleCreateNote = () => {
    router.push("/notes/new")
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Render dashboard or redirect to login
  if (!user) {
    // We already have a redirect in the useEffect, but we need to render something while that happens
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your notes and connections.">
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </DashboardHeader>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="notes">My Notes</TabsTrigger>
          {sharedNotes.length > 0 && (
            <TabsTrigger value="shared" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Shared with me
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {sharedNotes.length}
              </span>
            </TabsTrigger>
          )}
          <TabsTrigger value="graph">Graph View</TabsTrigger>
        </TabsList>
        <TabsContent value="notes" className="space-y-4">
          <NoteList notes={notes} isLoading={isLoading} />
        </TabsContent>
        {sharedNotes.length > 0 && (
          <TabsContent value="shared" className="space-y-4">
            <NoteList notes={sharedNotes} isLoading={isLoading} isShared />
          </TabsContent>
        )}
        <TabsContent value="graph" className="space-y-4">
          <GraphView notes={[...notes, ...sharedNotes]} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

