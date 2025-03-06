"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Instagram, Heart, Coffee, MessageSquare } from "lucide-react"
import Link from "next/link"

export function CreditsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // TENNET's social media links
  const socialLinks = {
    tiktok: "https://www.tiktok.com/@tech_tennet",
    twitter: "https://x.com/tennetonx",
    linkedin: "https://www.linkedin.com/in/emmanuel-edward-a90620276",
    instagram: "https://www.instagram.com/emmanuel.edward_",
    whatsapp: "https://chat.whatsapp.com/BJIz5wdZ33B5g3bSV2WbtX",
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Credits" text="About NoteNexus and its creator" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About the Creator</CardTitle>
            <CardDescription>The mind behind NoteNexus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                <div className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                  T
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center">TENNET</h3>
            <p className="text-center text-muted-foreground">Developer & Ethical Hacker</p>

            <p className="mt-4">
              NoteNexus was created by TENNET, a developer and ethical hacker with over eleven years of coding
              experience. This project combines a passion for knowledge management, markdown, bidirectional linking, and
              collaborative editing into a single, powerful application.
            </p>

            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support the Project</CardTitle>
            <CardDescription>Help keep NoteNexus growing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              NoteNexus is a passion project that TENNET is constantly improving. Your support helps dedicate more time
              to adding new features, fixing bugs, and making the application better for everyone.
            </p>
            <p>If you find NoteNexus useful, consider supporting the project in one of the following ways:</p>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button asChild>
              <Link href="/donate">
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://www.buymeacoffee.com/tennet" target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-4 w-4" />
                Buy me a coffee
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Technologies Used</CardTitle>
            <CardDescription>The building blocks of NoteNexus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/next-js.svg" alt="Next.js" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">Next.js</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/react.svg" alt="React" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">React</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/firebase.svg" alt="Firebase" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">Firebase</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/tailwind.svg" alt="Tailwind CSS" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">Tailwind CSS</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/typescript.svg" alt="TypeScript" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">TypeScript</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/markdown.svg" alt="Markdown" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">Markdown</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/cytoscape.svg" alt="Cytoscape.js" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">Cytoscape.js</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <img src="/shadcn.svg" alt="shadcn/ui" className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">shadcn/ui</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground text-center">
              Created with ❤️ by TENNET | &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

