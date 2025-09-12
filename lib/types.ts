// Database schema types for the buyer lead intake system
export type City = "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other"

export type PropertyType = "Apartment" | "Villa" | "Plot" | "Office" | "Retail"

export type BHK = "1" | "2" | "3" | "4" | "Studio"

export type Purpose = "Buy" | "Rent"

export type Timeline = "0-3m" | "3-6m" | ">6m" | "Exploring"

export type Source = "Website" | "Referral" | "Walk-in" | "Call" | "Other"

export type Status = "New" | "Qualified" | "Contacted" | "Visited" | "Negotiation" | "Converted" | "Dropped"

export interface Buyer {
  id: string
  fullName: string
  email?: string
  phone: string
  city: City
  propertyType: PropertyType
  bhk?: BHK
  purpose: Purpose
  budgetMin?: number
  budgetMax?: number
  timeline: Timeline
  source: Source
  status: Status
  notes?: string
  tags?: string[]
  ownerId: string
  updatedAt: Date
}

export interface BuyerHistory {
  id: string
  buyerId: string
  changedBy: string
  changedAt: Date
  diff: Record<string, { old: any; new: any }>
}

export interface BuyerFilters {
  search?: string
  city?: City
  propertyType?: PropertyType
  bhk?: BHK
  purpose?: Purpose
  timeline?: Timeline
  source?: Source
  status?: Status
  budgetMin?: number
  budgetMax?: number
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: keyof Buyer
  sortOrder?: "asc" | "desc"
}
