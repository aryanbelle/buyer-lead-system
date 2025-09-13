"use client"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoading } from "@/components/layout/page-loading"

interface ClientAuthCheckProps {
  children: React.ReactNode
}

export function ClientAuthCheck({ children }: ClientAuthCheckProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading])

  // Show loading while checking auth
  if (isLoading) {
    return <PageLoading />
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return <PageLoading />
  }

  // Render the server-side content if authenticated
  return <>{children}</>
}
