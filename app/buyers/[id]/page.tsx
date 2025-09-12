"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { PageLoading } from "@/components/layout/page-loading"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { getBuyerById, getBuyerHistory } from "@/lib/storage"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Phone, Mail, MapPin, Home, Target, Clock, Users } from "lucide-react"
import type { Buyer, BuyerHistory } from "@/lib/types"

export default function BuyerDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [history, setHistory] = useState<BuyerHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
      return
    }

    if (user) {
      const fetchBuyer = async () => {
        try {
          const foundBuyer = await getBuyerById(params.id)
          
          if (!foundBuyer) {
            router.push("/buyers")
            return
          }

          setBuyer(foundBuyer)

          const buyerHistory = await getBuyerHistory(params.id)
          setHistory(buyerHistory)
        } catch (error) {
          console.error("Error fetching buyer:", error)
          router.push("/buyers")
        } finally {
          setLoading(false)
        }
      }

      fetchBuyer()
    }
  }, [user, isLoading, router, params.id])

  if (isLoading || loading) {
    return <PageLoading />
  }

  if (!user || !buyer) {
    return null
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
      case "Lost":
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
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />
        <div className="container max-w-4xl mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{buyer.fullName}</h1>
                <p className="text-muted-foreground">Buyer Details</p>
              </div>
            </div>
            <Button onClick={() => router.push(`/buyers/${buyer.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buyer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{buyer.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{buyer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">City</p>
                        <p className="font-medium">{buyer.city}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{buyer.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">BHK</p>
                      <p className="font-medium">{buyer.bhk ? `${buyer.bhk} BHK` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium text-lg">
                        {buyer.budgetMin && buyer.budgetMax 
                          ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                          : buyer.budgetMin 
                            ? `${formatCurrency(buyer.budgetMin)}+`
                            : buyer.budgetMax
                              ? `Up to ${formatCurrency(buyer.budgetMax)}`
                              : "Not specified"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{buyer.purpose}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {buyer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{buyer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                    <Badge className={getStatusColor(buyer.status)}>{buyer.status}</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Timeline</p>
                        <p className="font-medium">{buyer.timeline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Source</p>
                        <p className="font-medium">{buyer.source}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(buyer.updatedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(buyer.updatedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              {history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Change History</CardTitle>
                    <CardDescription>Recent changes to this buyer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {history.slice(0, 5).map((change) => (
                        <div key={change.id} className="text-sm">
                          <p className="font-medium">Changes made</p>
                          <div className="text-muted-foreground">
                            {Object.entries(change.diff).map(([field, values]) => (
                              <div key={field} className="mb-1">
                                <span className="capitalize">{field}:</span> "{String(values.old)}" → "{String(values.new)}"
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(change.changedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
