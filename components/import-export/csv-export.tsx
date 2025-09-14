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
  const [useClientSide, setUseClientSide] = useState(false)
  const { user } = useAuth()
  
  // Fallback: Client-side CSV generation
  const handleClientSideExport = async () => {
    try {
      console.log("Using client-side export fallback...");
      
      // Fetch buyers data from API
      const response = await fetch('/api/buyers?limit=500')
      if (!response.ok) throw new Error('Failed to fetch buyers data')
      
      const data = await response.json()
      const buyers = data.buyers || []
      
      if (buyers.length === 0) {
        throw new Error('No buyers data found')
      }
      
      // Generate CSV content
      const header = 'fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status'
      const rows = buyers.map((buyer: any) => {
        const cleanValue = (value: any) => {
          if (value === null || value === undefined) return ''
          const str = String(value).replace(/"/g, '""')
          return `"${str}"`
        }
        
        return [
          cleanValue(buyer.fullName),
          cleanValue(buyer.email),
          cleanValue(buyer.phone),
          cleanValue(buyer.city),
          cleanValue(buyer.propertyType),
          cleanValue(buyer.bhk),
          cleanValue(buyer.purpose),
          cleanValue(buyer.budgetMin),
          cleanValue(buyer.budgetMax),
          cleanValue(buyer.timeline),
          cleanValue(buyer.source),
          cleanValue(buyer.notes),
          cleanValue(Array.isArray(buyer.tags) ? buyer.tags.join(';') : ''),
          cleanValue(buyer.status)
        ].join(',')
      })
      
      const csvContent = [header, ...rows].join('\n')
      
      // Download the CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `buyer-leads-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`Client-side export completed: ${buyers.length} buyers`);
      
    } catch (error) {
      console.error("Client-side export failed:", error)
      throw error
    }
  }

  const handleExport = async () => {
    if (!user) return
    
    setExporting(true)
    setError("")

    try {
      if (useClientSide) {
        // Use client-side generation
        await handleClientSideExport()
      } else {
        console.log("Trying server-side export first...");
        
        try {
          // Try server-side export first
          const urlParams = new URLSearchParams(window.location.search)
          const exportUrl = `/api/buyers/export?${urlParams.toString()}`
          console.log("Export URL:", exportUrl);
          
          const response = await fetch(exportUrl)
          console.log("Response status:", response.status);
          
          if (!response.ok) {
            throw new Error(`Server export failed: ${response.status}`)
          }
          
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
          URL.revokeObjectURL(url)
          
          console.log("Server-side export completed successfully");
          
        } catch (serverError) {
          console.log("Server-side export failed, trying client-side fallback...");
          // Fallback to client-side export
          await handleClientSideExport()
        }
      }
      
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
