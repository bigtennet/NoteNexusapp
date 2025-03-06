"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Link, Image, Code } from "lucide-react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const { theme } = useTheme()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

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

  // Update textarea value when external value changes
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value

      // Adjust height after value update
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  // Track selection for formatting
  const handleSelect = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart)
      setSelectionEnd(textareaRef.current.selectionEnd)
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

    onChange(newText)

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

      <div className={`rounded-md border p-4 ${theme === "dark" ? "bg-card" : "bg-background"}`}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelect}
          className="w-full min-h-[500px] bg-transparent outline-none resize-none font-mono leading-relaxed text-foreground"
          placeholder="Start writing your markdown here..."
          style={{ color: "inherit" }}
        />
      </div>
    </div>
  )
}

