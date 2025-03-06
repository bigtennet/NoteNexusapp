"use client"

import { useRouter } from "next/navigation"
import type { Note } from "@/types/note"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, File, Plus, Users, Share2 } from "lucide-react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

interface NoteListProps {
  notes: Note[]
  isLoading: boolean
  isShared?: boolean
}

export function NoteList({ notes, isLoading, isShared = false }: NoteListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotes = notes.filter((note) => {
    const searchLower = searchQuery.toLowerCase()
    return note.title?.toLowerCase().includes(searchLower) || note.content?.toLowerCase().includes(searchLower)
  })

  const handleCreateNote = () => {
    router.push("/notes/new")
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search ${isShared ? "shared " : ""}notes...`}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!isShared && (
          <Button onClick={handleCreateNote}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        )}
      </div>
      {filteredNotes.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            {isShared ? (
              <Users className="h-10 w-10 text-muted-foreground" />
            ) : (
              <File className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {notes.length === 0
              ? isShared
                ? "No notes have been shared with you yet."
                : "You don't have any notes yet. Create one to get started."
              : "No notes match your search query."}
          </p>
          {notes.length === 0 && !isShared && (
            <Button onClick={handleCreateNote}>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleNoteClick(note.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="line-clamp-1">{note.title || "Untitled Note"}</CardTitle>
                  {isShared && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" />
                      Shared
                    </div>
                  )}
                  {note.isPublic && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Share2 className="mr-1 h-3 w-3" />
                      Public
                    </div>
                  )}
                </div>
                <CardDescription className="line-clamp-1">
                  {note.content?.substring(0, 100).replace(/[#*`]/g, "") || "No content"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="line-clamp-3 text-sm text-muted-foreground">
                  {note.content?.substring(0, 300).replace(/[#*`]/g, "") || "No content"}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {note.updatedAt
                  ? `Updated ${formatDistanceToNow(new Date(note.updatedAt.toDate()), {
                      addSuffix: true,
                    })}`
                  : "Just created"}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

