"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { Users, Plus, Upload, BarChart3 } from "lucide-react"

const navigation = [
  {
    name: "All Buyers",
    href: "/buyers",
    icon: Users,
    roles: ["admin", "agent"] as const,
  },
  {
    name: "Add Buyer",
    href: "/buyers/new",
    icon: Plus,
    roles: ["admin", "agent"] as const,
  },
  {
    name: "Import/Export",
    href: "/buyers/import-export",
    icon: Upload,
    roles: ["admin"] as const,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["admin"] as const,
    disabled: true,
  },
]

export function Navigation() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (!user) return null

  const allowedNavigation = navigation.filter((item) => item.roles.includes(user.role))

  return (
    <nav className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl flex h-12 items-center space-x-1">
        {allowedNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn("flex items-center gap-2", isActive && "bg-secondary")}
              onClick={() => !item.disabled && router.push(item.href)}
              disabled={item.disabled}
            >
              <Icon className="h-4 w-4" />
              {item.name}
              {item.disabled && (
                <Badge variant="outline" className="text-xs">
                  Soon
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
