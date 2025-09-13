"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parseCSV, validateCSVData, generateSampleCSV, downloadCSV, type ImportResult } from "@/lib/csv-utils"
import { useAuth } from "@/components/auth/auth-provider"
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface CSVImportProps {
  onImportComplete?: () => void
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResult(null)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  const handleImport = async () => {
    if (!file || !user) return

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)
      const validationResult = validateCSVData(rows)

      // Send data to API for import
      const response = await fetch("/api/buyers/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: validationResult.data || [],
          userId: user.id,
        }),
      })

      const apiResult = await response.json()
      
      if (!response.ok) {
        setResult({
          success: false,
          errors: [apiResult.error || "Failed to import data"],
        })
        return
      }

      setResult({
        success: apiResult.success,
        errors: apiResult.errors || [],
        validRows: apiResult.validRows,
        totalRows: apiResult.totalRows,
        data: apiResult.results,
      })

      if (apiResult.success && onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      setResult({
        success: false,
        errors: ["Failed to process CSV file. Please check the file format."],
      })
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadSample = () => {
    const sampleCSV = generateSampleCSV()
    downloadCSV(sampleCSV, "buyer-leads-sample.csv")
  }

  const resetImport = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Buyers from CSV
        </CardTitle>
        <CardDescription>Upload a CSV file to import multiple buyer leads at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleImport} disabled={!file || importing} className="flex-1">
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </>
                  )}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Format
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>CSV Format Requirements</DialogTitle>
                      <DialogDescription>
                        Your CSV file must include the following columns in this exact order:
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-2">Required Columns:</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Name</li>
                            <li>• Email</li>
                            <li>• Phone</li>
                            <li>• City</li>
                            <li>• Property Type</li>
                            <li>• BHK</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Additional Columns:</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Budget</li>
                            <li>• Purpose</li>
                            <li>• Timeline</li>
                            <li>• Source</li>
                            <li>• Status</li>
                            <li>• Notes</li>
                          </ul>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button onClick={handleDownloadSample} variant="outline" className="flex-1 bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Download Sample CSV
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing CSV file...</span>
                </div>
                <Progress value={50} className="w-full" />
              </div>
            )}
          </>
        )}

        {result && (
          <div className="space-y-4">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="flex items-center justify-between">
                    <span>
                      Successfully imported {result.validRows} of {result.totalRows} buyers
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Complete
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Import failed with {result.errors?.length || 0} errors</span>
                      {result.validRows && result.totalRows && (
                        <Badge variant="destructive">
                          {result.validRows}/{result.totalRows} valid
                        </Badge>
                      )}
                    </div>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          View Errors ({result.errors.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={resetImport} variant="outline" className="flex-1 bg-transparent">
                Import Another File
              </Button>
              {result.success && onImportComplete && (
                <Button onClick={onImportComplete} className="flex-1">
                  View Imported Buyers
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Error Details Dialog */}
        {result?.errors && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Errors</DialogTitle>
                <DialogDescription>The following errors were found in your CSV file:</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
