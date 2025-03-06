"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

interface User {
  id: string
  displayName: string | null
  email: string | null
  lastActive: Date
  color: string
}

interface CollaborationPresenceProps {
  noteId: string
}

// Generate a random color for each user
const getRandomColor = () => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function CollaborationPresence({ noteId }: CollaborationPresenceProps) {
  const { user } = useAuth()
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [userColor] = useState(getRandomColor())

  useEffect(() => {
    if (!user || !noteId) return

    // Create a presence reference
    const presenceRef = doc(db, "notes", noteId, "presence", user.uid)

    // Update user presence when they join
    const updatePresence = async () => {
      await setDoc(presenceRef, {
        userId: user.uid,
        displayName: user.displayName,
        email: user.email,
        lastActive: serverTimestamp(),
        color: userColor,
      })
    }

    // Update presence immediately and then every 30 seconds
    updatePresence()
    const intervalId = setInterval(updatePresence, 30000)

    // Listen for other users' presence
    const unsubscribe = onSnapshot(doc(db, "notes", noteId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        // Get presence subcollection
        const presenceQuery = onSnapshot(doc(db, "notes", noteId).collection("presence"), (querySnapshot) => {
          const users: User[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            // Only include users who were active in the last 2 minutes
            const lastActive = data.lastActive?.toDate() || new Date()
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

            if (lastActive > twoMinutesAgo && data.userId !== user.uid) {
              users.push({
                id: data.userId,
                displayName: data.displayName,
                email: data.email,
                lastActive,
                color: data.color || "bg-gray-500",
              })
            }
          })
          setActiveUsers(users)
        })

        return () => presenceQuery()
      }
    })

    // Clean up
    return () => {
      clearInterval(intervalId)
      unsubscribe()
      // Remove user presence when they leave
      setDoc(presenceRef, { lastActive: serverTimestamp() }, { merge: true })
    }
  }, [user, noteId, userColor])

  if (activeUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-muted-foreground mr-2">Also editing:</span>
      <TooltipProvider>
        {activeUsers.map((activeUser) => (
          <Tooltip key={activeUser.id}>
            <TooltipTrigger asChild>
              <Avatar className={`h-8 w-8 ${activeUser.color}`}>
                <AvatarFallback>
                  {activeUser.displayName?.charAt(0) || activeUser.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{activeUser.displayName || activeUser.email || "Anonymous User"}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

