"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import type { Note } from "@/types/note"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { memo } from "react"

interface MarkdownPreviewProps {
  content: string
  notes: Note[]
}

// Use memo to prevent unnecessary re-renders
export const MarkdownPreview = memo(function MarkdownPreview({ content, notes }: MarkdownPreviewProps) {
  const router = useRouter()

  // Process wikilinks in the content
  const processWikilinks = (text: string) => {
    return text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const noteTitle = p1.trim()
      const targetNote = notes.find((note) => note.title?.toLowerCase() === noteTitle.toLowerCase())

      if (targetNote) {
        return `<a class="wikilink" data-note-id="${targetNote.id}">${noteTitle}</a>`
      }

      return `<a class="wikilink wikilink-new">${noteTitle}</a>`
    })
  }

  // Render markdown with wikilinks
  const renderMarkdown = () => {
    const processedContent = processWikilinks(content)
    const html = marked(processedContent)
    const sanitizedHtml = DOMPurify.sanitize(html)

    return { __html: sanitizedHtml }
  }

  // Handle click on wikilinks
  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    if (target.classList.contains("wikilink")) {
      e.preventDefault()
      const noteId = target.getAttribute("data-note-id")

      if (noteId) {
        router.push(`/notes/${noteId}`)
      }
    }
  }

  return (
    <div
      className="prose prose-sm md:prose-base dark:prose-invert max-w-none rounded-md border p-4"
      dangerouslySetInnerHTML={renderMarkdown()}
      onClick={handleLinkClick}
    />
  )
})

