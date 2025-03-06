"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Link, Image, Code } from "lucide-react"
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { CollaborationPresence } from "@/components/collaboration-presence"

interface CollaborativeEditorProps {
  noteId: string
  initialValue: string
  onChange: (value: string) => void
}

export function CollaborativeEditor({ noteId, initialValue, onChange }: CollaborativeEditorProps) {
  const { theme } = useTheme()
  const { user } = useAuth()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(initialValue)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const lastUpdateRef = useRef<number>(Date.now())
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for remote changes
  useEffect(() => {
    if (!noteId) return

    const unsubscribe = onSnapshot(doc(db, "notes", noteId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const noteData = docSnapshot.data()

        // Only update if the change was made by another user
        // and we're not currently typing
        if (!isTyping && noteData.content !== value) {
          setValue(noteData.content || "")
          onChange(noteData.content || "")
        }
      }
    })

    return unsubscribe
  }, [noteId, value, isTyping, onChange])

  // Adjust textarea height to fit content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    adjustHeight()

    // Add event listener for input to adjust height as user types
    textarea.addEventListener("input", adjustHeight)

    return () => {
      textarea.removeEventListener("input", adjustHeight)
    }
  }, [])

  // Track selection for formatting
  const handleSelect = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart)
      setSelectionEnd(textareaRef.current.selectionEnd)
    }
  }

  // Handle local changes with debouncing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(newValue)
    setIsTyping(true)

    // Update the remote document with debouncing
    const now = Date.now()
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // If it's been more than 2 seconds since the last update, update immediately
    if (now - lastUpdateRef.current > 2000) {
      updateRemoteDocument(newValue)
      lastUpdateRef.current = now
    } else {
      // Otherwise, debounce for 500ms
      debounceTimeoutRef.current = setTimeout(() => {
        updateRemoteDocument(newValue)
        lastUpdateRef.current = Date.now()
      }, 500)
    }
  }

  // Update the remote document
  const updateRemoteDocument = async (content: string) => {
    if (!user || !noteId) return

    try {
      await updateDoc(doc(db, "notes", noteId), {
        content,
        updatedAt: serverTimestamp(),
      })

      // Reset typing state after update
      setTimeout(() => setIsTyping(false), 100)
    } catch (error) {
      console.error("Error updating document:", error)
    }
  }

  // Format functions
  const formatText = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    const newText = textarea.value.substring(0, start) + prefix + selectedText + suffix + textarea.value.substring(end)

    setValue(newText)
    onChange(newText)
    updateRemoteDocument(newText)

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  const insertBold = () => formatText("**")
  const insertItalic = () => formatText("*")
  const insertUnorderedList = () => formatText("- ")
  const insertOrderedList = () => formatText("1. ")
  const insertLink = () => formatText("[", "](url)")
  const insertImage = () => formatText("![alt text](", ")")
  const insertCode = () => formatText("`")
  const insertWikilink = () => formatText("[[", "]]")

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 p-1 border rounded-md bg-muted/30">
          <Button variant="ghost" size="sm" onClick={insertBold} title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertItalic} title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertUnorderedList} title="Bullet List">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertOrderedList} title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertLink} title="Link">
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertImage} title="Image">
            <Image className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertCode} title="Code">
            <Code className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertWikilink} title="Wikilink">
            [[]]
          </Button>
        </div>

        <CollaborationPresence noteId={noteId} />
      </div>

      <div className={`rounded-md border p-4 ${theme === "dark" ? "bg-card" : "bg-background"}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          className="w-full min-h-[500px] bg-transparent outline-none resize-none font-mono leading-relaxed text-foreground"
          placeholder="Start writing your markdown here..."
          style={{ color: "inherit" }}
        />
      </div>
    </div>
  )
}

