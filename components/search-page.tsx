"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Tag, File } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"
import { formatDistanceToNow } from "date-fns"

export function SearchPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Note[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    // Extract tags from notes
    const fetchTags = async () => {
      try {
        const q = query(collection(db, "notes"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const allTags = new Set<string>()
        querySnapshot.forEach((doc) => {
          const note = doc.data() as Note
          const content = note.content || ""

          // Extract tags using regex (#tag)
          const tagRegex = /#(\w+)/g
          let match
          while ((match = tagRegex.exec(content)) !== null) {
            allTags.add(match[1])
          }
        })

        setTags(Array.from(allTags))
      } catch (error) {
        console.error("Error fetching tags:", error)
      }
    }

    fetchTags()
  }, [user])

  const handleSearch = async () => {
    if (!user || (!searchQuery && !selectedTag)) return

    setIsSearching(true)
    try {
      const q = query(collection(db, "notes"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)

      const results: Note[] = []
      querySnapshot.forEach((doc) => {
        const note = { id: doc.id, ...doc.data() } as Note

        // Filter by search query
        const matchesQuery =
          !searchQuery ||
          note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by selected tag
        const matchesTag = !selectedTag || (note.content && note.content.includes(`#${selectedTag}`))

        if (matchesQuery && matchesTag) {
          results.push(note)
        }
      })

      setSearchResults(results)
    } catch (error) {
      console.error("Error searching notes:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
    } else {
      setSelectedTag(tag)
    }
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`)
  }

  if (loading) {
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
      <DashboardHeader heading="Search" text="Search your notes by text or tags." />
      <div className="grid gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {tags.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tags</CardTitle>
              <CardDescription>Click on a tag to filter your notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {searchResults.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((note) => (
              <Card
                key={note.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleNoteClick(note.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{note.title || "Untitled Note"}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {note.content?.substring(0, 100).replace(/[#*`]/g, "") || "No content"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="line-clamp-3 text-sm text-muted-foreground">
                    {note.content?.substring(0, 300).replace(/[#*`]/g, "") || "No content"}
                  </div>
                </CardContent>
                <CardContent className="text-xs text-muted-foreground">
                  {note.updatedAt
                    ? `Updated ${formatDistanceToNow(new Date(note.updatedAt.toDate()), {
                        addSuffix: true,
                      })}`
                    : "Just created"}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery || selectedTag ? (
          <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <File className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">No notes match your search criteria.</p>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}

