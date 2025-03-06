import type { Timestamp } from "firebase/firestore"

export interface NotePermission {
  userId: string
  email: string
  role: "viewer" | "editor" | "owner"
  addedAt: Timestamp
}

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
  isPublic?: boolean
  sharedWith?: NotePermission[]
  shareLink?: string
}

