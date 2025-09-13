"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/auth/logout-button"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "agent"
}

interface HeaderProps {
  user?: User
}

export function HeaderServer({ user }: HeaderProps) {
  if (!user) return null

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="text-xs">
            Admin
          </Badge>
        )
      case "agent":
        return (
          <Badge variant="secondary" className="text-xs">
            Agent
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Buyer Lead System</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              {getRoleBadge(user.role)}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
