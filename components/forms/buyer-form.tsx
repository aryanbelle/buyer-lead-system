"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { buyerSchema, type BuyerFormData } from "@/lib/validation"
import { addBuyer, updateBuyer } from "@/lib/storage"
import { useAuth } from "@/components/auth/auth-provider"
import type { Buyer } from "@/lib/types"
import { ArrowLeft, Save } from "lucide-react"
import { TagInput } from "@/components/ui/tag-input"
import { useTagSuggestions } from "@/hooks/use-tag-suggestions"

interface BuyerFormProps {
  buyer?: Buyer
  mode: "create" | "edit"
}

export function BuyerForm({ buyer, mode }: BuyerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()
  const { suggestions: tagSuggestions } = useTagSuggestions()

  const form = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: buyer
      ? {
          fullName: buyer.fullName,
          email: buyer.email || "",
          phone: buyer.phone,
          city: buyer.city,
          propertyType: buyer.propertyType,
          bhk: buyer.bhk,
          purpose: buyer.purpose,
          budgetMin: buyer.budgetMin,
          budgetMax: buyer.budgetMax,
          timeline: buyer.timeline,
          source: buyer.source,
          notes: buyer.notes || "",
          tags: buyer.tags || [],
        }
      : {
          fullName: "",
          email: "",
          phone: "",
          city: "Chandigarh",
          propertyType: "Apartment",
          bhk: "2",
          purpose: "Buy",
          budgetMin: undefined,
          budgetMax: undefined,
          timeline: "0-3m",
          source: "Website",
          notes: "",
          tags: [],
        },
  })

  const onSubmit = async (data: BuyerFormData) => {
    if (!user) return

    setIsLoading(true)
    setError("")

    try {
      if (mode === "create") {
        const buyerData = {
          ...data,
          ownerId: user.id,
          status: "New" as const,
        }
        await addBuyer(buyerData)
      } else if (buyer) {
        // For update, we need to include the original ownerId and status
        const updateData = {
          ...data,
          ownerId: buyer.ownerId, // Keep the original owner
          status: buyer.status,   // Keep the current status
          lastUpdated: buyer.updatedAt, // For concurrency control
        }
        await updateBuyer(buyer.id, updateData, user.id, user.id, user.role)
      }

      router.push("/buyers")
    } catch (err) {
      console.error("Error saving buyer:", err)
      setError(`Failed to save buyer: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{mode === "create" ? "Add New Buyer" : "Edit Buyer"}</h1>
          <p className="text-muted-foreground">
            {mode === "create" ? "Enter buyer information to create a new lead" : "Update buyer information"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Information</CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormDescription>10-15 digits only</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                            <SelectItem value="Mohali">Mohali</SelectItem>
                            <SelectItem value="Zirakpur">Zirakpur</SelectItem>
                            <SelectItem value="Panchkula">Panchkula</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Property Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Property Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="Villa">Villa</SelectItem>
                            <SelectItem value="Plot">Plot</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bhk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BHK {(form.watch("propertyType") === "Apartment" || form.watch("propertyType") === "Villa") ? "*" : ""}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select BHK" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Required for Apartment and Villa properties</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetMin"
                    render={({ field }) => {
                      const inputRef = React.useRef<HTMLInputElement>(null)
                      
                      React.useEffect(() => {
                        if (inputRef.current) {
                          inputRef.current.value = field.value ? String(field.value) : ""
                        }
                      }, [field.value])
                      
                      return (
                        <FormItem>
                          <FormLabel>Budget Min (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000000"
                              ref={inputRef}
                              defaultValue={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "") {
                                  field.onChange(undefined)
                                } else {
                                  const numValue = parseFloat(value)
                                  if (!isNaN(numValue)) {
                                    field.onChange(numValue)
                                  }
                                }
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                            />
                          </FormControl>
                          <FormDescription>Minimum budget in rupees</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="budgetMax"
                    render={({ field }) => {
                      const inputRef = React.useRef<HTMLInputElement>(null)
                      
                      React.useEffect(() => {
                        if (inputRef.current) {
                          inputRef.current.value = field.value ? String(field.value) : ""
                        }
                      }, [field.value])
                      
                      return (
                        <FormItem>
                          <FormLabel>Budget Max (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="8000000"
                              ref={inputRef}
                              defaultValue={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "") {
                                  field.onChange(undefined)
                                } else {
                                  const numValue = parseFloat(value)
                                  if (!isNaN(numValue)) {
                                    field.onChange(numValue)
                                  }
                                }
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                            />
                          </FormControl>
                          <FormDescription>Maximum budget in rupees</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Buy">Buy</SelectItem>
                            <SelectItem value="Rent">Rent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Lead Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lead Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-3m">0-3 months</SelectItem>
                            <SelectItem value="3-6m">3-6 months</SelectItem>
                            <SelectItem value=">6m">6+ months</SelectItem>
                            <SelectItem value="Exploring">Exploring</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                </div>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the buyer..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional notes about the buyer's preferences or requirements</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value || []}
                        onChange={field.onChange}
                        suggestions={tagSuggestions}
                        placeholder="Add tags (e.g., urgent, family, premium)"
                        maxTags={10}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to categorize this buyer. Type to see suggestions or create new tags.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : mode === "create" ? "Create Buyer" : "Update Buyer"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
