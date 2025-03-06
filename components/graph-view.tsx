"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { Note } from "@/types/note"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import cytoscape to avoid SSR issues
const Cytoscape = dynamic(() => import("cytoscape"), { ssr: false })

interface GraphViewProps {
  notes: Note[]
}

export function GraphView({ notes }: GraphViewProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !containerRef.current || notes.length === 0) {
      if (isClient && notes.length === 0) {
        setIsLoading(false)
      }
      return
    }

    const initGraph = async () => {
      try {
        // Extract wikilinks from note content
        const extractWikilinks = (content: string) => {
          if (!content) return []
          const regex = /\[\[(.*?)\]\]/g
          const matches = []
          let match
          while ((match = regex.exec(content)) !== null) {
            matches.push(match[1])
          }
          return matches
        }

        // Create nodes and edges for the graph
        const nodes = notes.map((note) => ({
          data: {
            id: note.id,
            label: note.title || "Untitled Note",
          },
        }))

        const edges = []
        notes.forEach((note) => {
          if (!note.content) return

          const wikilinks = extractWikilinks(note.content)
          wikilinks.forEach((link) => {
            const targetNote = notes.find((n) => n.title?.toLowerCase() === link.toLowerCase())
            if (targetNote) {
              edges.push({
                data: {
                  id: `${note.id}-${targetNote.id}`,
                  source: note.id,
                  target: targetNote.id,
                },
              })
            }
          })
        })

        // Initialize cytoscape
        const cytoscape = await import("cytoscape")
        const cy = cytoscape.default({
          container: containerRef.current,
          elements: {
            nodes,
            edges,
          },
          style: [
            {
              selector: "node",
              style: {
                "background-color": "#8b5cf6",
                label: "data(label)",
                color: "#ffffff",
                "text-valign": "center",
                "text-halign": "center",
                "text-wrap": "wrap",
                "text-max-width": "80px",
                "font-size": "10px",
                width: "30px",
                height: "30px",
              },
            },
            {
              selector: "edge",
              style: {
                width: 2,
                "line-color": "#d4d4d8",
                "curve-style": "bezier",
              },
            },
          ],
          layout: {
            name: "cose",
            animate: false,
            nodeDimensionsIncludeLabels: true,
            randomize: true,
            idealEdgeLength: 100,
            nodeOverlap: 20,
            refresh: 20,
            fit: true,
            padding: 30,
            componentSpacing: 100,
          },
        })

        // Add click event to nodes
        cy.on("tap", "node", (event: any) => {
          const nodeId = event.target.id()
          router.push(`/notes/${nodeId}`)
        })

        cyRef.current = cy
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing graph:", error)
        setIsLoading(false)
      }
    }

    initGraph()

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [notes, router, isClient])

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
    }
  }

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.fit()
    }
  }

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graph View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graph View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] flex-col items-center justify-center text-center">
            <p className="mb-4 text-muted-foreground">
              Create notes with [[wikilinks]] to see connections in the graph view.
            </p>
            <Button onClick={() => router.push("/notes/new")}>Create Your First Note</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Graph View</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div ref={containerRef} id="graph-container" className="h-[400px] w-full rounded-md border" />
        )}
      </CardContent>
    </Card>
  )
}

