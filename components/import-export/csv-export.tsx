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
    if (!user) return
    
    setExporting(true)
    setError("")

    try {
      console.log("Starting export...");
      
      // Get current filters from URL if available
      const urlParams = new URLSearchParams(window.location.search)
      
      // Build export URL with current filters
      const exportUrl = `/api/buyers/export?${urlParams.toString()}`
      console.log("Export URL:", exportUrl);
      
      // Fetch the CSV data
      const response = await fetch(exportUrl)
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error("Export API error:", errorData);
        throw new Error(`Export failed: ${response.status}`)
      }
      
      // Get the CSV content
      const csvContent = await response.text()
      console.log("CSV content length:", csvContent.length);
      
      if (!csvContent || csvContent.length === 0) {
        throw new Error("No data to export")
      }
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `buyer-leads-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      URL.revokeObjectURL(url)
      
      console.log("Export completed successfully");
      
    } catch (error) {
      console.error("Export failed:", error)
      setError(error instanceof Error ? error.message : "Export failed. Please try again.")
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
