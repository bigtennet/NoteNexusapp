"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bitcoin, Copy, Check, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export function DonatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const cryptoAddresses = {
    btc: "15cjRnm94vM1K144nzkHgT5L8WrLTbWvu8",
    usdt: "TCPhWYC3Dwnty7iAyLJrnPonSJVDYND5Yp",
    bnb: "0x1ee4026ab2ac48aa34b076d8f606d681c4880345",
  }

  const bankInfo = {
    accountNumber: "8124269148",
    bank: "OPAY DIGITAL BANK",
    accountName: "EDWARD EMMANUEL",
  }

  const contactInfo = "+2348124269148"

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({
      title: "Copied to clipboard",
      description: `${field} has been copied to your clipboard.`,
    })

    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Donate" text="Support the development of NoteNexus" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bitcoin className="mr-2 h-5 w-5" />
              Cryptocurrency
            </CardTitle>
            <CardDescription>Donate using cryptocurrency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Bitcoin (BTC)</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all flex justify-between items-center">
                <span>{cryptoAddresses.btc}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(cryptoAddresses.btc, "BTC Address")}
                >
                  {copiedField === "BTC Address" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">USDT (TRC20)</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all flex justify-between items-center">
                <span>{cryptoAddresses.usdt}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(cryptoAddresses.usdt, "USDT Address")}
                >
                  {copiedField === "USDT Address" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">BNB (BEP20)</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all flex justify-between items-center">
                <span>{cryptoAddresses.bnb}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(cryptoAddresses.bnb, "BNB Address")}
                >
                  {copiedField === "BNB Address" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10h3v7H4zm6.5-5h3v12h-3zm6.5 3h3v9h-3z" />
              </svg>
              Bank Transfer
            </CardTitle>
            <CardDescription>Support via direct bank transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Account Number</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all flex justify-between items-center">
                <span>{bankInfo.accountNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(bankInfo.accountNumber, "Account Number")}
                >
                  {copiedField === "Account Number" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Bank Name</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all">{bankInfo.bank}</div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Account Name</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all">{bankInfo.accountName}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Get in touch directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Phone/WhatsApp</div>
              <div className="p-2 bg-muted rounded-md font-mono text-xs break-all flex justify-between items-center">
                <span>{contactInfo}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => copyToClipboard(contactInfo, "Contact Number")}
                >
                  {copiedField === "Contact Number" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`https://wa.me/${contactInfo.replace("+", "")}`} target="_blank" rel="noopener noreferrer">
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Why Donate?</CardTitle>
            <CardDescription>How your support helps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              NoteNexus is a passion project that I'm developing in my free time. Your donations directly support the
              continued development and improvement of the application.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">New Features</h3>
                <p className="text-sm text-muted-foreground">
                  Your donations help fund the development of new features like mobile apps, enhanced collaboration
                  tools, and improved graph visualization.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Server Costs</h3>
                <p className="text-sm text-muted-foreground">
                  Keeping NoteNexus running smoothly requires servers and infrastructure. Your support helps cover these
                  ongoing costs.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Development Time</h3>
                <p className="text-sm text-muted-foreground">
                  With your support, I can dedicate more time to improving NoteNexus, fixing bugs, and responding to
                  user feedback.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Thank you for considering a donation. Every contribution, no matter how small, makes a difference and is
              deeply appreciated.
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

