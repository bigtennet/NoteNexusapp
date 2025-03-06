"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, GitGraphIcon as Graph, Home, Search, Settings, Tag, HelpCircle, Heart, Info } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Notes",
    href: "/notes",
    icon: BookOpen,
  },
  {
    title: "Graph View",
    href: "/graph",
    icon: Graph,
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
  },
  {
    title: "Tags",
    href: "/tags",
    icon: Tag,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: HelpCircle,
  },
  {
    title: "Donate",
    href: "/donate",
    icon: Heart,
  },
  {
    title: "Credits",
    href: "/credits",
    icon: Info,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

