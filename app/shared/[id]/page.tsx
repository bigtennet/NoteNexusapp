"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkdownPreview } from "@/components/markdown-preview"
import { Loader2, ArrowLeft, Lock, Copy, Check } from "lucide-react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"
import { useToast } from "@/components/ui/use-toast"

export default function SharedNotePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!params.id) return

    const fetchNote = async () => {
      try {
        const noteDoc = await getDoc(doc(db, "notes", params.id))

        if (!noteDoc.exists()) {
          toast({
            variant: "destructive",
            title: "Note not found",
            description: "The note you're looking for doesn't exist or has been deleted.",
          })
          router.push("/")
          return
        }

        const noteData = noteDoc.data() as Note
        setNote(noteData)

        // Check access permissions
        const isPublic = noteData.isPublic || false
        const isOwner = user && noteData.userId === user.uid
        const isSharedWithUser = user && noteData.sharedWith?.some((share) => share.email === user.email)

        const canAccess = isPublic || isOwner || isSharedWithUser
        setHasAccess(canAccess)

        // If user has access via sharing but userId is not set, update it
        if (user && isSharedWithUser && !isOwner) {
          const userShare = noteData.sharedWith?.find((share) => share.email === user.email)
          if (userShare && !userShare.userId) {
            // Update the userId in the shared permissions
            const updatedSharedWith = noteData.sharedWith?.map((share) => {
              if (share.email === user.email) {
                return { ...share, userId: user.uid }
              }
              return share
            })

            await updateDoc(doc(db, "notes", params.id), {
              sharedWith: updatedSharedWith,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching shared note:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the shared note.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [params.id, user, loading, router, toast])

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/shared/${params.id}`
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="container flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You don't have permission to view this note.</p>
            {!user ? (
              <p className="text-sm text-muted-foreground">
                Try signing in to access this note if it was shared with your email.
              </p>
            ) : null}
            <div className="flex flex-col space-y-2">
              {!user ? <Button onClick={() => router.push("/login")}>Sign In</Button> : null}
              <Button variant="outline" onClick={() => router.push("/")}>
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <p>Note not found.</p>
      </div>
    )
  }

  const canEdit =
    user &&
    (note.userId === user.uid ||
      note.sharedWith?.some((share) => share.email === user.email && share.role === "editor"))

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{note.title || "Untitled Note"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyShareLink}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Share
          </Button>
          {canEdit && <Button onClick={() => router.push(`/notes/${params.id}`)}>Edit Note</Button>}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <MarkdownPreview content={note.content || ""} notes={[]} />
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          {note.isPublic
            ? "This is a public note that anyone with the link can view."
            : "This note is shared with specific people only."}
        </p>
      </div>
    </div>
  )
}

