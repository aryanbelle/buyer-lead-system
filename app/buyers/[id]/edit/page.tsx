"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { BuyerForm } from "@/components/forms/buyer-form"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { getBuyerById } from "@/lib/storage"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Buyer } from "@/lib/types"

export default function EditBuyerPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
      return
    }

    if (user) {
      const fetchBuyer = async () => {
        try {
          const foundBuyer = await getBuyerById(params.id)
          
          if (!foundBuyer) {
            router.push("/buyers")
            return
          }

          setBuyer(foundBuyer)
        } catch (error) {
          console.error("Error fetching buyer:", error)
          router.push("/buyers")
        } finally {
          setLoading(false)
        }
      }

      fetchBuyer()
    }
  }, [user, isLoading, router, params.id])

  if (isLoading || loading) {
    return <PageLoading />
  }

  if (!user || !buyer) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <BuyerForm mode="edit" buyer={buyer} />
      </div>
    </ErrorBoundary>
  )
}
