"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Tag } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"

interface TagCount {
  tag: string
  count: number
}

export function TagsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tags, setTags] = useState<TagCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const fetchTags = async () => {
      try {
        const q = query(collection(db, "notes"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const tagCounts = new Map<string, number>()
        querySnapshot.forEach((doc) => {
          const note = doc.data() as Note
          const content = note.content || ""

          // Extract tags using regex (#tag)
          const tagRegex = /#(\w+)/g
          let match
          while ((match = tagRegex.exec(content)) !== null) {
            const tag = match[1]
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
          }
        })

        const tagCountArray: TagCount[] = Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count }))

        // Sort by count (descending)
        tagCountArray.sort((a, b) => b.count - a.count)

        setTags(tagCountArray)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching tags:", error)
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [user])

  const handleTagClick = (tag: string) => {
    router.push(`/search?tag=${tag}`)
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
      <DashboardHeader heading="Tags" text="Browse your notes by tags." />
      {tags.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Tag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No tags found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">Add tags to your notes by using the #tag syntax.</p>
          <Button onClick={() => router.push("/notes/new")}>Create a Note</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map(({ tag, count }) => (
            <Card
              key={tag}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handleTagClick(tag)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />#{tag}
                </CardTitle>
                <CardDescription>
                  {count} {count === 1 ? "note" : "notes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Click to view all notes with this tag.</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}

