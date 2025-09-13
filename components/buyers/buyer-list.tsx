"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Removed dropdown imports - using custom dropdown instead
import { BuyerFiltersComponent } from "./buyer-filters"
import { getBuyers } from "@/lib/storage"
import type { BuyerFilters, Buyer } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-provider"
import { Edit, Eye, MoreHorizontal, Phone, Mail, Plus, Upload, Users, Home, DollarSign, Activity, Clock, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

// Server-side pagination with page size 10 (handled by API)

export function BuyerList() {
  const [filters, setFilters] = useState<BuyerFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const [allBuyers, setAllBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchBuyers = async (page = 1, searchFilters = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("limit", "10")
      
      // Add filters to API call
      if (searchFilters.search) params.set("search", searchFilters.search)
      if (searchFilters.city) params.set("city", searchFilters.city)
      if (searchFilters.propertyType) params.set("propertyType", searchFilters.propertyType)
      if (searchFilters.status) params.set("status", searchFilters.status)
      if (searchFilters.timeline) params.set("timeline", searchFilters.timeline)

      const response = await fetch(`/api/buyers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAllBuyers(data.buyers || [])
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
      } else {
        console.error("Failed to fetch buyers")
      }
    } catch (error) {
      console.error("Error fetching buyers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuyers(1, filters)
  }, [filters])

  // Server-side filtering and pagination - no client-side processing needed
  const paginatedBuyers = allBuyers

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
      <BuyerFiltersComponent
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setCurrentPage(1) // Reset to page 1 when filters change
        }}
        totalCount={pagination.total}
        filteredCount={pagination.total}
      />

      {/* Buyers Table */}
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Buyers ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 px-6">
              <p className="text-muted-foreground">Loading buyers...</p>
            </div>
          ) : paginatedBuyers.length === 0 ? (
            <div className="text-center py-8 px-6">
              <p className="text-muted-foreground">No buyers found matching your criteria.</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => {
                setFilters({})
                setCurrentPage(1)
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto relative">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="min-w-[200px] font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Buyer
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[200px] font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[150px] font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Requirements
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Budget
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Status
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timeline
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px] text-center font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBuyers.map((buyer, index) => (
                      <TableRow 
                        key={buyer.id} 
                        className={`cursor-pointer hover:bg-muted/70 transition-all duration-200 border-b ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                        onClick={() => router.push(`/buyers/${buyer.id}`)}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-muted">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
                              <div className="font-semibold text-foreground">{buyer.fullName}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {buyer.city}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            {buyer.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-foreground">{buyer.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-foreground">{buyer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {buyer.propertyType}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">
                                {buyer.bhk ? `${buyer.bhk} BHK` : "N/A"}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{buyer.purpose}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground text-sm">
                              {buyer.budgetMin && buyer.budgetMax 
                                ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                                : buyer.budgetMin 
                                  ? `${formatCurrency(buyer.budgetMin)}+`
                                  : buyer.budgetMax
                                    ? `Up to ${formatCurrency(buyer.budgetMax)}`
                                    : "Not specified"
                              }
                            </div>
                            {buyer.budgetMin && buyer.budgetMax && (
                              <div className="text-xs text-muted-foreground">
                                Range: ₹{((buyer.budgetMax - buyer.budgetMin) / 100000).toFixed(1)}L spread
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            className={`${getStatusColor(buyer.status)} font-medium px-3 py-1`}
                          >
                            {buyer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">{buyer.timeline}</span>
                          </div>
                        </TableCell>
                        <TableCell className="relative py-4 text-center">
                          <div className="relative flex justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`h-8 w-8 p-0 rounded-full hover:bg-accent transition-colors ${
                                openDropdown === buyer.id ? 'bg-accent shadow-sm' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdown(openDropdown === buyer.id ? null : buyer.id)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setOpenDropdown(openDropdown === buyer.id ? null : buyer.id)
                                }
                                if (e.key === 'Escape') {
                                  setOpenDropdown(null)
                                }
                              }}
                              aria-expanded={openDropdown === buyer.id}
                              aria-haspopup="menu"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            
                            {openDropdown === buyer.id && (
                              <>
                                {/* Backdrop to close dropdown */}
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setOpenDropdown(null)}
                                />
                                
                                {/* Enhanced Dropdown Menu */}
                                <div 
                                  className="absolute right-0 top-10 z-20 min-w-[160px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 animate-in fade-in-0 zoom-in-95 duration-150"
                                  role="menu"
                                  aria-orientation="vertical"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setOpenDropdown(null)
                                    }
                                  }}
                                >
                                  <div
                                    role="menuitem"
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mx-1"
                                    onClick={() => {
                                      setOpenDropdown(null)
                                      router.push(`/buyers/${buyer.id}`)
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </div>
                                  
                                  {(user?.role === "admin" || buyer.ownerId === user?.id) && (
                                    <div
                                      role="menuitem"
                                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mx-1"
                                      onClick={() => {
                                        setOpenDropdown(null)
                                        router.push(`/buyers/${buyer.id}/edit`)
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      <span>Edit</span>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Server-Side Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-6 pb-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = pagination.page - 1
                        setCurrentPage(newPage)
                        fetchBuyers(newPage, filters)
                      }}
                      disabled={pagination.page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(pageNum)
                              fetchBuyers(pageNum, filters)
                            }}
                            disabled={loading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = pagination.page + 1
                        setCurrentPage(newPage)
                        fetchBuyers(newPage, filters)
                      }}
                      disabled={pagination.page === pagination.totalPages || loading}
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
