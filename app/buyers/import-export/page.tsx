"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { RoleGuard } from "@/components/auth/role-guard"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { CSVImport } from "@/components/import-export/csv-import"
import { CSVExport } from "@/components/import-export/csv-export"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ImportExportPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading])

  if (isLoading) {
    return <PageLoading />
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <div className="container max-w-4xl mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Import & Export</h1>
              <p className="text-muted-foreground">Manage bulk buyer data operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import */}
            <CSVImport onImportComplete={() => router.push("/buyers")} />

            {/* Export */}
            <CSVExport />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
