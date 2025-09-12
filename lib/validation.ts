import { z } from "zod"

// Validation schemas using Zod
export const citySchema = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"])

export const propertyTypeSchema = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"])

export const bhkSchema = z.enum(["1", "2", "3", "4", "Studio"])

export const purposeSchema = z.enum(["Buy", "Rent"])

export const timelineSchema = z.enum(["0-3m", "3-6m", ">6m", "Exploring"])

export const sourceSchema = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"])

export const statusSchema = z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"])

export const buyerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(80, "Full name must be less than 80 characters"),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Invalid email address"
  }),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
  city: citySchema,
  propertyType: propertyTypeSchema,
  bhk: bhkSchema.optional(),
  purpose: purposeSchema,
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  timeline: timelineSchema,
  source: sourceSchema,
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  // BHK required for Apartment/Villa
  if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: "BHK is required for Apartment and Villa properties",
  path: ["bhk"]
}).refine((data) => {
  // budgetMax >= budgetMin when both present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"]
})

export const buyerFiltersSchema = z.object({
  search: z.string().optional(),
  city: citySchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  bhk: bhkSchema.optional(),
  purpose: purposeSchema.optional(),
  timeline: timelineSchema.optional(),
  source: sourceSchema.optional(),
  status: statusSchema.optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
})

// Schema for API that includes server-side fields
export const buyerApiSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(80, "Full name must be less than 80 characters"),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Invalid email address"
  }),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
  city: citySchema,
  propertyType: propertyTypeSchema,
  bhk: bhkSchema.optional(),
  purpose: purposeSchema,
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  timeline: timelineSchema,
  source: sourceSchema,
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
  status: statusSchema.default("New"),
}).refine((data) => {
  // BHK required for Apartment/Villa
  if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: "BHK is required for Apartment and Villa properties",
  path: ["bhk"]
}).refine((data) => {
  // budgetMax >= budgetMin when both present
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to minimum budget",
  path: ["budgetMax"]
})

export type BuyerFormData = z.infer<typeof buyerSchema>
export type BuyerApiData = z.infer<typeof buyerApiSchema>
export type BuyerFiltersData = z.infer<typeof buyerFiltersSchema>
