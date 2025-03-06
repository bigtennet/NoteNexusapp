"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { CollaborativeEditor } from "@/components/collaborative-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { ShareNoteDialog } from "@/components/share-note-dialog"
import { Loader2, Save, ArrowLeft, Trash2, Share2 } from "lucide-react"
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface NoteEditorProps {
  noteId?: string
  isNew?: boolean
}

export function NoteEditor({ noteId, isNew = false }: NoteEditorProps) {
  // All hooks must be called at the top level, unconditionally
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [note, setNote] = useState<Partial<Note>>({
    title: "",
    content: "",
  })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useLocalStorage("editor-tab", "write")
  const [shouldAutoSave, setShouldAutoSave] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [sharedCount, setSharedCount] = useState(0)

  // Fetch note data
  useEffect(() => {
    if (loading || !user) return

    if (isNew || !noteId) {
      setIsLoading(false)
      return
    }

    const fetchNote = async () => {
      try {
        const noteDoc = await getDoc(doc(db, "notes", noteId))
        if (noteDoc.exists()) {
          const noteData = noteDoc.data() as Note

          // Check if user has permission to edit this note
          const isOwner = noteData.userId === user.uid
          const hasEditPermission = noteData.sharedWith?.some(
            (share) => share.email === user.email && share.role === "editor",
          )

          if (!isOwner && !hasEditPermission) {
            toast({
              variant: "destructive",
              title: "Access denied",
              description: "You don't have permission to edit this note.",
            })
            router.push("/dashboard")
            return
          }

          setNote(noteData)
          setSharedCount(noteData.sharedWith?.length || 0)
          // Enable auto-save after initial load
          setShouldAutoSave(true)
        } else {
          toast({
            variant: "destructive",
            title: "Note not found",
            description: "The requested note could not be found.",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching note:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch note. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [user, loading, isNew, noteId, router, toast])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNote((prev) => ({ ...prev, title: e.target.value }))

    // Auto-save title changes
    if (!isNew && noteId && user) {
      updateDoc(doc(db, "notes", noteId), {
        title: e.target.value || "Untitled Note",
        updatedAt: serverTimestamp(),
      })
    }
  }

  const handleContentChange = (value: string) => {
    setNote((prev) => ({ ...prev, content: value }))
    // We don't need to save here as the collaborative editor handles this
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to save notes.",
      })
      return
    }

    setIsSaving(true)
    try {
      if (isNew) {
        // Create a new note
        const newNoteRef = doc(collection(db, "notes"))
        await setDoc(newNoteRef, {
          userId: user.uid,
          title: note.title || "Untitled Note",
          content: note.content || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPublic: false,
          sharedWith: [],
        })

        toast({
          title: "Note created",
          description: "Your note has been created successfully.",
        })

        router.push(`/notes/${newNoteRef.id}`)
      } else if (noteId) {
        // Verify ownership before updating
        const noteDoc = await getDoc(doc(db, "notes", noteId))
        if (noteDoc.exists()) {
          const noteData = noteDoc.data()
          const isOwner = noteData.userId === user.uid
          const hasEditPermission = noteData.sharedWith?.some(
            (share) => share.email === user.email && share.role === "editor",
          )

          if (isOwner || hasEditPermission) {
            // Update existing note
            await updateDoc(doc(db, "notes", noteId), {
              title: note.title || "Untitled Note",
              content: note.content || "",
              updatedAt: serverTimestamp(),
            })

            toast({
              title: "Note saved",
              description: "Your note has been saved successfully.",
            })
          } else {
            toast({
              variant: "destructive",
              title: "Permission denied",
              description: "You don't have permission to edit this note.",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!noteId || !user) return

    try {
      // Verify ownership before deleting
      const noteDoc = await getDoc(doc(db, "notes", noteId))
      if (noteDoc.exists() && noteDoc.data().userId === user.uid) {
        await deleteDoc(doc(db, "notes", noteId))
        toast({
          title: "Note deleted",
          description: "Your note has been deleted successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "You can only delete notes you own.",
        })
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete note. Please try again.",
      })
    }
  }

  const handlePermissionsChange = () => {
    // Refresh shared count
    if (noteId) {
      getDoc(doc(db, "notes", noteId)).then((noteDoc) => {
        if (noteDoc.exists()) {
          const noteData = noteDoc.data() as Note
          setSharedCount(noteData.sharedWith?.length || 0)
        }
      })
    }
  }

  // Render loading state
  if (loading || (isLoading && !isNew)) {
    return (
      <DashboardShell>
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  // Check if user is the owner of the note
  const isOwner = !isNew && noteId && user && note.userId === user.uid

  // Render editor
  return (
    <DashboardShell>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={note.title || ""}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              className="max-w-md text-xl font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            {!isNew && noteId && isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShareDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
                {sharedCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {sharedCount}
                  </span>
                )}
              </Button>
            )}
            {!isNew && noteId && isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Note</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this note? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="mt-4">
            {!isNew && noteId ? (
              <CollaborativeEditor noteId={noteId} initialValue={note.content || ""} onChange={handleContentChange} />
            ) : (
              <div className="text-center p-4 border rounded-md">
                <p>Save the note first to enable collaborative editing.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <MarkdownPreview content={note.content || ""} notes={[]} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Share Dialog */}
      {noteId && (
        <ShareNoteDialog
          noteId={noteId}
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          onPermissionsChange={handlePermissionsChange}
        />
      )}
    </DashboardShell>
  )
}

