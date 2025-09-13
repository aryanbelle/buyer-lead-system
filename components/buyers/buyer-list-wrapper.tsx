"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { BuyerListSSR } from "./buyer-list-ssr"
import { PageLoading } from "@/components/layout/page-loading"
import type { Buyer, BuyerFilters } from "@/lib/types"

interface BuyerListWrapperProps {
  initialBuyers: Buyer[]
  initialFilters: BuyerFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function BuyerListWrapper({ initialBuyers, initialFilters, pagination }: BuyerListWrapperProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <PageLoading />
  }

  if (!user) {
    return null
  }

  // Pass the server-rendered data to the client component
  return (
    <BuyerListSSR 
      initialBuyers={initialBuyers}
      initialFilters={initialFilters}
      pagination={pagination}
    />
  )
}
