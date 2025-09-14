"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText } from "lucide-react"

// Main branch deployment - CSV export fix
export function CSVExport() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")

  const handleExport = () => {
    console.log("Starting CSV export via direct download...");
    
    setExporting(true)
    setError("")
    
    try {
      // Create a direct link to the CSV export API
      const exportUrl = '/api/buyers/export'
      console.log("Opening export URL:", exportUrl);
      
      // Open the CSV export URL in a new window/tab to trigger download
      const link = document.createElement('a')
      link.href = exportUrl
      link.target = '_blank'
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log("CSV export link triggered");
      
      // Reset the exporting state after a short delay
      setTimeout(() => {
        setExporting(false)
      }, 2000)
      
    } catch (error) {
      console.error("Export failed:", error)
      setError("Export failed. Please try again.")
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
