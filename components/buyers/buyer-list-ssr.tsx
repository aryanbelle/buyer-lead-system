"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BuyerFiltersSSR } from "./buyer-filters-ssr"
import { BuyerRowActions } from "./buyer-row-actions"
import type { BuyerFilters, Buyer } from "@/lib/types"
import { Phone, Mail, Plus, Upload } from "lucide-react"
import type { User } from "@/lib/auth"

interface BuyerListSSRProps {
  initialBuyers: Buyer[]
  initialFilters: BuyerFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  user: User
}

export function BuyerListSSR({ initialBuyers, initialFilters, pagination, user }: BuyerListSSRProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToPage = (page: number, filters: BuyerFilters = initialFilters) => {
    const params = new URLSearchParams()
    
    // Always set page (even if it's 1)
    params.set("page", page.toString())
    
    // Add all non-empty filter values
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString())
      }
    })

    const url = `/buyers?${params.toString()}`
    router.push(url)
  }

  const handleFiltersChange = (newFilters: BuyerFilters) => {
    // When filters change, always go to page 1
    navigateToPage(1, newFilters)
  }

  const handlePageChange = (newPage: number) => {
    // When page changes, keep current filters
    navigateToPage(newPage, initialFilters)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Contacted":
        return "bg-yellow-100 text-yellow-800"
      case "Qualified":
        return "bg-green-100 text-green-800"
      case "Converted":
        return "bg-purple-100 text-purple-800"
      case "Visited":
        return "bg-orange-100 text-orange-800"
      case "Negotiation":
        return "bg-indigo-100 text-indigo-800"
      case "Dropped":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }


  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Buyer Leads</h1>
          <p className="text-muted-foreground">Manage and track your buyer leads</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => router.push("/buyers/import-export")}>
            <Upload className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Button onClick={() => router.push("/buyers/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Buyer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <BuyerFiltersSSR
        filters={initialFilters}
        onFiltersChange={handleFiltersChange}
        totalCount={pagination.total}
      />

      {/* Buyers Table */}
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Buyers ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {initialBuyers.length === 0 ? (
            <div className="text-center py-8 px-6">
              <p className="text-muted-foreground">No buyers found matching your criteria.</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => handleFiltersChange({})}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Buyer</TableHead>
                      <TableHead className="min-w-[200px]">Contact</TableHead>
                      <TableHead className="min-w-[150px]">Requirements</TableHead>
                      <TableHead className="min-w-[120px]">Budget</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Timeline</TableHead>
                      <TableHead className="min-w-[120px]">Updated</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialBuyers.map((buyer) => (
                      <TableRow key={buyer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {buyer.fullName
                                  ? buyer.fullName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{buyer.fullName}</div>
                              <div className="text-sm text-muted-foreground">{buyer.city}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {buyer.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {buyer.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {buyer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{buyer.propertyType}</div>
                            <div className="text-sm text-muted-foreground">
                              {buyer.bhk ? `${buyer.bhk} BHK` : "N/A"} • {buyer.purpose}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {buyer.budgetMin && buyer.budgetMax 
                              ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                              : buyer.budgetMin 
                                ? `${formatCurrency(buyer.budgetMin)}+`
                                : buyer.budgetMax
                                  ? `Up to ${formatCurrency(buyer.budgetMax)}`
                                  : "Not specified"
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(buyer.status)}>{buyer.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{buyer.timeline}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(buyer.updatedAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <BuyerRowActions buyerId={buyer.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-6 pb-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    (Page {pagination.page} of {pagination.totalPages})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const currentPage = pagination.page
                        const totalPages = pagination.totalPages
                        const maxVisible = 5
                        
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                        let endPage = Math.min(totalPages, startPage + maxVisible - 1)
                        
                        // Adjust start page if we're near the end
                        if (endPage - startPage < maxVisible - 1) {
                          startPage = Math.max(1, endPage - maxVisible + 1)
                        }
                        
                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                          const pageNum = startPage + i
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })
                      })()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}