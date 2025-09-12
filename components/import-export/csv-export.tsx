"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getBuyers } from "@/lib/storage"
import { exportToCSV, downloadCSV } from "@/lib/csv-utils"
import type { BuyerFilters } from "@/lib/types"
import { Download, FileText } from "lucide-react"

interface CSVExportProps {
  filters?: BuyerFilters
}

export function CSVExport({ filters = {} }: CSVExportProps) {
  const [exportFilters, setExportFilters] = useState<BuyerFilters>(filters)
  const [includeAllFields, setIncludeAllFields] = useState(true)
  const [exporting, setExporting] = useState(false)

  const allBuyers = getBuyers()

  const filteredBuyers = allBuyers.filter((buyer) => {
    // Apply filters
    if (exportFilters.search) {
      const searchTerm = exportFilters.search.toLowerCase()
      const matchesSearch =
        buyer.name.toLowerCase().includes(searchTerm) ||
        buyer.email.toLowerCase().includes(searchTerm) ||
        buyer.phone.toLowerCase().includes(searchTerm)
      if (!matchesSearch) return false
    }

    if (exportFilters.city && buyer.city !== exportFilters.city) return false
    if (exportFilters.propertyType && buyer.propertyType !== exportFilters.propertyType) return false
    if (exportFilters.bhk && buyer.bhk !== exportFilters.bhk) return false
    if (exportFilters.purpose && buyer.purpose !== exportFilters.purpose) return false
    if (exportFilters.timeline && buyer.timeline !== exportFilters.timeline) return false
    if (exportFilters.source && buyer.source !== exportFilters.source) return false
    if (exportFilters.status && buyer.status !== exportFilters.status) return false
    if (exportFilters.budgetMin && buyer.budget < exportFilters.budgetMin) return false
    if (exportFilters.budgetMax && buyer.budget > exportFilters.budgetMax) return false

    return true
  })

  const handleExport = async () => {
    setExporting(true)

    try {
      const csvContent = exportToCSV(filteredBuyers)
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `buyer-leads-${timestamp}.csv`

      downloadCSV(csvContent, filename)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  const updateFilter = (key: keyof BuyerFilters, value: any) => {
    setExportFilters({ ...exportFilters, [key]: value })
  }

  const clearFilter = (key: keyof BuyerFilters) => {
    const newFilters = { ...exportFilters }
    delete newFilters[key]
    setExportFilters(newFilters)
  }

  const activeFiltersCount = Object.keys(exportFilters).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Buyers to CSV
        </CardTitle>
        <CardDescription>Export buyer data to CSV format for external use</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Export Filters</h4>
            <Badge variant="secondary">
              {filteredBuyers.length} of {allBuyers.length} buyers
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={exportFilters.status || "all"}
                onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={exportFilters.city || "all"}
                onValueChange={(value) => updateFilter("city", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={exportFilters.propertyType || "all"}
                onValueChange={(value) => updateFilter("propertyType", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select
                value={exportFilters.purpose || "all"}
                onValueChange={(value) => updateFilter("purpose", value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All purposes</SelectItem>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(exportFilters).map(([key, value]) => (
                <Badge key={key} variant="outline" className="gap-1">
                  <span className="capitalize">{key}:</span>
                  <span>{String(value)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => clearFilter(key as keyof BuyerFilters)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h4 className="font-medium">Export Options</h4>
          <div className="flex items-center space-x-2">
            <Checkbox id="include-all-fields" checked={includeAllFields} onCheckedChange={setIncludeAllFields} />
            <Label htmlFor="include-all-fields">Include all fields (recommended)</Label>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={exporting || filteredBuyers.length === 0} className="flex-1">
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Export {filteredBuyers.length} Buyers
              </>
            )}
          </Button>
        </div>

        {filteredBuyers.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">No buyers match the current filters</div>
        )}
      </CardContent>
    </Card>
  )
}
