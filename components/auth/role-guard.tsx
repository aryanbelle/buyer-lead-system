"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import type { User } from "@/lib/auth"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: User["role"][]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-muted-foreground">Access Denied</h3>
          <p className="text-sm text-muted-foreground mt-2">You don't have permission to access this feature.</p>
        </div>
      )
    )
  }

  return <>{children}</>
}
