"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { BuyerForm } from "@/components/forms/buyer-form"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NewBuyerPage() {
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <BuyerForm mode="create" />
      </div>
    </ErrorBoundary>
  )
}
