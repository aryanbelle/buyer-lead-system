"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Filter, Search } from "lucide-react"
import type { BuyerFilters } from "@/lib/types"

interface BuyerFiltersSSRProps {
  filters: BuyerFilters
  onFiltersChange: (filters: BuyerFilters) => void
  totalCount: number
  isLoading?: boolean
}

export function BuyerFiltersSSR({ filters, onFiltersChange, totalCount, isLoading }: BuyerFiltersSSRProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<BuyerFilters>(filters)
  const [searchValue, setSearchValue] = useState(filters.search || "")

  // Debounced search
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (value: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setLocalFilters(prev => ({ ...prev, search: value || undefined }))
        }, 500) // 500ms debounce
      }
    })(),
    []
  )

  useEffect(() => {
    debounceSearch(searchValue)
  }, [searchValue, debounceSearch])

  // Apply filters when localFilters change
  useEffect(() => {
    onFiltersChange(localFilters)
  }, [localFilters, onFiltersChange])

  const updateFilter = (key: keyof BuyerFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilter = (key: keyof BuyerFilters) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    
    if (key === 'search') {
      setSearchValue("")
    }
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    setSearchValue("")
  }

  const activeFiltersCount = Object.keys(localFilters).length

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount} active</Badge>}
            {isLoading && <Badge variant="outline">Loading...</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalCount} buyers
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setSearchValue("")
                clearFilter("search")
              }}
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => (
              <Badge key={key} variant="outline" className="gap-1">
                <span className="capitalize">{key}:</span>
                <span>{String(value)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(key as keyof BuyerFilters)}
                  disabled={isLoading}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} disabled={isLoading}>
              Clear all
            </Button>
          </div>
        )}

        {/* Expanded Filters - Only required ones per assignment */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={localFilters.city || ""}
                onValueChange={(value) => updateFilter("city", value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All cities</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Mohali">Mohali</SelectItem>
                  <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                  <SelectItem value="Panchkula">Panchkula</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={localFilters.propertyType || ""}
                onValueChange={(value) => updateFilter("propertyType", value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={localFilters.status || ""}
                onValueChange={(value) => updateFilter("status", value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Visited">Visited</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timeline</Label>
              <Select
                value={localFilters.timeline || ""}
                onValueChange={(value) => updateFilter("timeline", value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All timelines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All timelines</SelectItem>
                  <SelectItem value="0-3m">0-3 months</SelectItem>
                  <SelectItem value="3-6m">3-6 months</SelectItem>
                  <SelectItem value=">6m">6+ months</SelectItem>
                  <SelectItem value="Exploring">Exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}