"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { Download, FileText } from "lucide-react"

export function CSVExport() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()

  const handleExport = async () => {
    if (!user) {
      setError("Please sign in to export data")
      return
    }
    
    setExporting(true)
    setError("")

    try {
      console.log("Starting CSV export...");
      
      // Get current filters from URL
      const urlParams = new URLSearchParams(window.location.search)
      const dataUrl = `/api/buyers/data?${urlParams.toString()}`
      
      console.log("Fetching data from:", dataUrl);
      
      // Fetch buyer data as JSON
      const response = await fetch(dataUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} - ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch buyer data")
      }
      
      const buyers = result.data || []
      console.log(`Processing ${buyers.length} buyers for export`);
      
      if (buyers.length === 0) {
        throw new Error("No data to export. Try adjusting your filters or add some buyers first.")
      }
      
      // Generate CSV content with proper headers
      const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Budget', 'Notes', 'Created Date', 'Updated Date']
      const csvRows = [headers.join(',')]
      
      buyers.forEach((buyer: any) => {
        const cleanValue = (value: any) => {
          if (value === null || value === undefined) return ''
          const str = String(value).replace(/"/g, '""')
          return `"${str}"`
        }
        
        const row = [
          cleanValue(buyer.name || ''),
          cleanValue(buyer.email || ''),
          cleanValue(buyer.phone || ''),
          cleanValue(buyer.company || ''),
          cleanValue(buyer.status || ''),
          cleanValue(buyer.budget || ''),
          cleanValue(buyer.notes || ''),
          cleanValue(buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : ''),
          cleanValue(buyer.updatedAt ? new Date(buyer.updatedAt).toLocaleDateString() : '')
        ]
        
        csvRows.push(row.join(','))
      })
      
      const csvContent = csvRows.join('\n')
      console.log("Generated CSV content, length:", csvContent.length);
      
      // Create and download file with BOM for Excel compatibility
      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      })
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `buyer-leads-${timestamp}.csv`
      
      // Create download link and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup
      URL.revokeObjectURL(url)
      
      console.log(`CSV export completed successfully! Downloaded ${buyers.length} buyers as ${filename}`);
      
    } catch (error) {
      console.error("Export failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Export failed. Please try again."
      setError(errorMessage)
    } finally {
      setExporting(false)
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Buyers to CSV
        </CardTitle>
        <CardDescription>
          Export filtered buyer data to CSV format. The export will include all buyers that match your current filters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground">
          This will export all buyers that match your current search and filter criteria from the main buyers list.
        </div>

        <Button 
          onClick={handleExport} 
          disabled={exporting}
          className="w-full"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Export Buyers to CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
