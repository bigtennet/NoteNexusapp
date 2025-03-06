"use client"

import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import type { Note } from "@/types/note"
import { openDB, type IDBPDatabase } from "idb"

// Define the database schema
interface NoteDB {
  notes: {
    key: string
    value: Note & { syncStatus: "synced" | "pending" | "error" }
  }
}

// Initialize IndexedDB
const initDB = async (): Promise<IDBPDatabase<NoteDB>> => {
  return openDB<NoteDB>("notes-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" })
      }
    },
  })
}

export function useOfflineSync(userId: string | undefined) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [db, setDB] = useState<IDBPDatabase<NoteDB> | null>(null)

  // Initialize IndexedDB
  useEffect(() => {
    const setupDB = async () => {
      const database = await initDB()
      setDB(database)
    }
    setupDB()
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Sync with Firestore when online
  useEffect(() => {
    if (!userId || !db || !isOnline) return

    const syncPendingNotes = async () => {
      setIsSyncing(true)
      try {
        const tx = db.transaction("notes", "readonly")
        const store = tx.objectStore("notes")
        const pendingNotes = await store.getAll()

        for (const note of pendingNotes) {
          if (note.syncStatus === "pending") {
            try {
              const noteRef = doc(db, "notes", note.id)
              await updateDoc(noteRef, {
                title: note.title,
                content: note.content,
                updatedAt: new Date(),
              })

              // Update sync status
              const updateTx = db.transaction("notes", "readwrite")
              const updateStore = updateTx.objectStore("notes")
              await updateStore.put({
                ...note,
                syncStatus: "synced",
              })
              await updateTx.done
            } catch (error) {
              console.error("Error syncing note:", error)

              // Mark as error
              const errorTx = db.transaction("notes", "readwrite")
              const errorStore = errorTx.objectStore("notes")
              await errorStore.put({
                ...note,
                syncStatus: "error",
              })
              await errorTx.done
            }
          }
        }
      } catch (error) {
        console.error("Error during sync:", error)
      } finally {
        setIsSyncing(false)
      }
    }

    if (isOnline) {
      syncPendingNotes()
    }
  }, [userId, db, isOnline])

  // Listen for Firestore changes and update IndexedDB
  useEffect(() => {
    if (!userId || !db) return

    const q = query(collection(db, "notes"), where("userId", "==", userId))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        querySnapshot.docChanges().forEach(async (change) => {
          const noteData = { id: change.doc.id, ...change.doc.data() } as Note

          if (change.type === "added" || change.type === "modified") {
            const tx = db.transaction("notes", "readwrite")
            const store = tx.objectStore("notes")
            await store.put({
              ...noteData,
              syncStatus: "synced",
            })
            await tx.done
          } else if (change.type === "removed") {
            const tx = db.transaction("notes", "readwrite")
            const store = tx.objectStore("notes")
            await store.delete(change.doc.id)
            await tx.done
          }
        })
      },
      (error) => {
        console.error("Error listening to Firestore:", error)
      },
    )

    return () => unsubscribe()
  }, [userId, db])

  // Functions to interact with notes
  const getNotes = async (): Promise<Note[]> => {
    if (!db) return []

    try {
      const tx = db.transaction("notes", "readonly")
      const store = tx.objectStore("notes")
      const notes = await store.getAll()
      return notes.map(({ syncStatus, ...note }) => note as Note)
    } catch (error) {
      console.error("Error getting notes from IndexedDB:", error)
      return []
    }
  }

  const getNote = async (noteId: string): Promise<Note | null> => {
    if (!db) return null

    try {
      const tx = db.transaction("notes", "readonly")
      const store = tx.objectStore("notes")
      const note = await store.get(noteId)
      return note ? ({ ...note, syncStatus: undefined } as Note) : null
    } catch (error) {
      console.error("Error getting note from IndexedDB:", error)
      return null
    }
  }

  const saveNote = async (note: Partial<Note> & { id: string }): Promise<void> => {
    if (!db || !userId) return

    try {
      const tx = db.transaction("notes", "readwrite")
      const store = tx.objectStore("notes")

      // Get existing note or create new one
      const existingNote = await store.get(note.id)
      const updatedNote = {
        ...(existingNote || {}),
        ...note,
        userId,
        syncStatus: isOnline ? "synced" : "pending",
      }

      await store.put(updatedNote)
      await tx.done

      // If online, sync to Firestore
      if (isOnline) {
        try {
          const noteRef = doc(db, "notes", note.id)
          if (existingNote) {
            await updateDoc(noteRef, {
              title: note.title,
              content: note.content,
              updatedAt: new Date(),
            })
          } else {
            await setDoc(noteRef, {
              userId,
              title: note.title || "Untitled Note",
              content: note.content || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        } catch (error) {
          console.error("Error syncing to Firestore:", error)

          // Mark as error
          const errorTx = db.transaction("notes", "readwrite")
          const errorStore = errorTx.objectStore("notes")
          await errorStore.put({
            ...updatedNote,
            syncStatus: "error",
          })
          await errorTx.done
        }
      }
    } catch (error) {
      console.error("Error saving note to IndexedDB:", error)
    }
  }

  const deleteNote = async (noteId: string): Promise<void> => {
    if (!db) return

    try {
      const tx = db.transaction("notes", "readwrite")
      const store = tx.objectStore("notes")
      await store.delete(noteId)
      await tx.done

      // If online, delete from Firestore
      if (isOnline) {
        try {
          await deleteDoc(doc(db, "notes", noteId))
        } catch (error) {
          console.error("Error deleting from Firestore:", error)
        }
      }
    } catch (error) {
      console.error("Error deleting note from IndexedDB:", error)
    }
  }

  return {
    isOnline,
    isSyncing,
    getNotes,
    getNote,
    saveNote,
    deleteNote,
  }
}

