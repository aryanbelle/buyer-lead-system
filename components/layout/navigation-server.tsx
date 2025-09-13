"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Upload, Plus } from "lucide-react"

export function NavigationServer() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/buyers",
      label: "Buyers",
      icon: Users,
      isActive: pathname === "/buyers",
    },
    {
      href: "/buyers/new", 
      label: "Add Buyer",
      icon: Plus,
      isActive: pathname === "/buyers/new",
    },
    {
      href: "/buyers/import-export",
      label: "Import/Export",
      icon: Upload,
      isActive: pathname === "/buyers/import-export",
    },
  ]

  return (
    <nav className="border-b bg-muted/40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-12 items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                item.isActive
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
