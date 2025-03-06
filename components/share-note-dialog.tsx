"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check, Trash2, Globe, Lock, Mail } from "lucide-react"
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note, NotePermission } from "@/types/note"

interface ShareNoteDialogProps {
  noteId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPermissionsChange: () => void
}

export function ShareNoteDialog({ noteId, isOpen, onOpenChange, onPermissionsChange }: ShareNoteDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [note, setNote] = useState<Note | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"viewer" | "editor">("viewer")
  const [sharedUsers, setSharedUsers] = useState<NotePermission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch note data when dialog opens
  useEffect(() => {
    if (isOpen && noteId) {
      fetchNoteData()
    }
  }, [isOpen, noteId])

  const fetchNoteData = async () => {
    if (!noteId) return

    try {
      const noteDoc = await getDoc(doc(db, "notes", noteId))
      if (noteDoc.exists()) {
        const noteData = noteDoc.data() as Note
        setNote(noteData)
        setIsPublic(noteData.isPublic || false)
        setShareLink(noteData.shareLink || generateShareLink(noteId))
        setSharedUsers(noteData.sharedWith || [])
      }
    } catch (error) {
      console.error("Error fetching note:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch note data.",
      })
    }
  }

  const generateShareLink = (id: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/shared/${id}`
  }

  const handlePublicToggle = async (checked: boolean) => {
    if (!noteId || !user) return

    setIsLoading(true)
    try {
      await updateDoc(doc(db, "notes", noteId), {
        isPublic: checked,
        shareLink: checked ? shareLink : null,
        updatedAt: serverTimestamp(),
      })

      setIsPublic(checked)
      toast({
        title: checked ? "Note is now public" : "Note is now private",
        description: checked
          ? "Anyone with the link can view this note."
          : "Only you and people you share with can access this note.",
      })
      onPermissionsChange()
    } catch (error) {
      console.error("Error updating note visibility:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update note visibility.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyShareLink = () => {
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

  const handleShareWithUser = async () => {
    if (!noteId || !user || !email) return

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address.",
      })
      return
    }

    // Don't allow sharing with yourself
    if (email === user.email) {
      toast({
        variant: "destructive",
        title: "Cannot share with yourself",
        description: "You already have owner access to this note.",
      })
      return
    }

    // Check if already shared with this user
    if (sharedUsers.some((u) => u.email === email)) {
      toast({
        variant: "destructive",
        title: "Already shared",
        description: "This note is already shared with this user.",
      })
      return
    }

    setIsLoading(true)
    try {
      const newPermission: NotePermission = {
        userId: "", // Will be filled when user accesses the note
        email: email,
        role: role,
        addedAt: serverTimestamp() as any,
      }

      await updateDoc(doc(db, "notes", noteId), {
        sharedWith: arrayUnion(newPermission),
        updatedAt: serverTimestamp(),
      })

      setSharedUsers([...sharedUsers, newPermission])
      setEmail("")
      toast({
        title: "Note shared",
        description: `Note shared with ${email} as a ${role}.`,
      })
      onPermissionsChange()
    } catch (error) {
      console.error("Error sharing note:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share note.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeSharedUser = async (userEmail: string) => {
    if (!noteId || !user) return

    const userToRemove = sharedUsers.find((u) => u.email === userEmail)
    if (!userToRemove) return

    setIsLoading(true)
    try {
      await updateDoc(doc(db, "notes", noteId), {
        sharedWith: arrayRemove(userToRemove),
        updatedAt: serverTimestamp(),
      })

      setSharedUsers(sharedUsers.filter((u) => u.email !== userEmail))
      toast({
        title: "Access removed",
        description: `Access for ${userEmail} has been removed.`,
      })
      onPermissionsChange()
    } catch (error) {
      console.error("Error removing shared user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove user access.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userEmail: string, newRole: "viewer" | "editor") => {
    if (!noteId || !user) return

    const userIndex = sharedUsers.findIndex((u) => u.email === userEmail)
    if (userIndex === -1) return

    setIsLoading(true)
    try {
      // Create updated user list
      const updatedUsers = [...sharedUsers]
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        role: newRole,
      }

      await updateDoc(doc(db, "notes", noteId), {
        sharedWith: updatedUsers,
        updatedAt: serverTimestamp(),
      })

      setSharedUsers(updatedUsers)
      toast({
        title: "Permission updated",
        description: `${userEmail} is now a ${newRole}.`,
      })
      onPermissionsChange()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user permission.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>Share your note with others or make it public.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              {isPublic ? (
                <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{isPublic ? "Public note" : "Private note"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPublic
                ? "Anyone with the link can view this note"
                : "Only you and people you share with can access this note"}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={handlePublicToggle} disabled={isLoading} />
        </div>

        {isPublic && (
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Share link
              </Label>
              <Input id="link" value={shareLink} readOnly className="h-9" />
            </div>
            <Button size="sm" className="px-3" onClick={copyShareLink} disabled={isLoading}>
              <span className="sr-only">Copy link</span>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Share with people</h4>
            <div className="flex space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Enter email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "viewer" | "editor")}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleShareWithUser} disabled={!email || isLoading}>
                <Mail className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">People with access</h4>
              <div className="space-y-2">
                {sharedUsers.map((sharedUser, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {sharedUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sharedUser.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{sharedUser.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={sharedUser.role}
                        onValueChange={(value) => updateUserRole(sharedUser.email, value as "viewer" | "editor")}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 w-[90px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSharedUser(sharedUser.email)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

