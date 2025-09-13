"use client"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoading } from "@/components/layout/page-loading"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading])

  if (isLoading) {
    return <PageLoading />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
