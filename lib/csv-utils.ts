import type { Buyer } from "./types"
import { buyerSchema } from "./validation"
import { z } from "zod"

export interface ImportResult {
  success: boolean
  data?: Buyer[]
  errors?: string[]
  validRows?: number
  totalRows?: number
}

export interface ValidationError {
  row: number
  field: string
  message: string
  value: any
}

// CSV headers mapping
export const CSV_HEADERS = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  city: "City",
  propertyType: "Property Type",
  bhk: "BHK",
  budgetMin: "Budget Min",
  budgetMax: "Budget Max",
  purpose: "Purpose",
  timeline: "Timeline",
  source: "Source",
  notes: "Notes",
} as const

export function exportToCSV(buyers: Buyer[]): string {
  const headers = Object.values(CSV_HEADERS).join(",")

  const rows = buyers.map((buyer) => {
    return [
      `"${buyer.fullName}"`,
      `"${buyer.email || ""}"`,
      `"${buyer.phone}"`,
      `"${buyer.city}"`,
      `"${buyer.propertyType}"`,
      `"${buyer.bhk || ""}"`,
      buyer.budgetMin || "",
      buyer.budgetMax || "",
      `"${buyer.purpose}"`,
      `"${buyer.timeline}"`,
      `"${buyer.source}"`,
      `"${buyer.notes || ""}"`,
    ].join(",")
  })

  return [headers, ...rows].join("\n")
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split("\n").filter((line) => line.trim())
  const result: string[][] = []

  for (const line of lines) {
    const row: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        row.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    row.push(current.trim())
    result.push(row)
  }

  return result
}

export function validateCSVData(rows: string[][]): ImportResult {
  if (rows.length === 0) {
    return {
      success: false,
      errors: ["CSV file is empty"],
    }
  }

  const headers = rows[0]
  const dataRows = rows.slice(1)

  // Validate headers
  const expectedHeaders = Object.values(CSV_HEADERS)
  const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))

  if (missingHeaders.length > 0) {
    return {
      success: false,
      errors: [`Missing required headers: ${missingHeaders.join(", ")}`],
    }
  }

  // Create header mapping
  const headerMap: Record<string, number> = {}
  Object.entries(CSV_HEADERS).forEach(([key, header]) => {
    headerMap[key] = headers.indexOf(header)
  })

  const validBuyers: Buyer[] = []
  const errors: string[] = []

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2 // +2 because we start from row 2 (after header)

    try {
      const buyerData = {
        fullName: row[headerMap.fullName]?.replace(/"/g, "") || "",
        email: row[headerMap.email]?.replace(/"/g, "") || undefined,
        phone: row[headerMap.phone]?.replace(/"/g, "") || "",
        city: row[headerMap.city]?.replace(/"/g, "") || "",
        propertyType: row[headerMap.propertyType]?.replace(/"/g, "") || "",
        bhk: row[headerMap.bhk]?.replace(/"/g, "") || undefined,
        budgetMin: row[headerMap.budgetMin] ? Number.parseInt(row[headerMap.budgetMin]) : undefined,
        budgetMax: row[headerMap.budgetMax] ? Number.parseInt(row[headerMap.budgetMax]) : undefined,
        purpose: row[headerMap.purpose]?.replace(/"/g, "") || "",
        timeline: row[headerMap.timeline]?.replace(/"/g, "") || "",
        source: row[headerMap.source]?.replace(/"/g, "") || "",
        notes: row[headerMap.notes]?.replace(/"/g, "") || undefined,
      }

      // For CSV import, we only validate and return the data
      // The API will handle creating the full buyer object
      validBuyers.push(buyerData as any)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map((err) => `Row ${rowNumber}, ${err.path.join(".")}: ${err.message}`)
        errors.push(...fieldErrors)
      } else {
        errors.push(`Row ${rowNumber}: Invalid data format`)
      }
    }
  })

  return {
    success: errors.length === 0,
    data: validBuyers,
    errors: errors.length > 0 ? errors : undefined,
    validRows: validBuyers.length,
    totalRows: dataRows.length,
  }
}

export function generateSampleCSV(): string {
  const headers = Object.values(CSV_HEADERS).join(",")
  
  const sampleRows = [
    '"John Doe","john.doe@email.com","9876543210","Chandigarh","Apartment","2","4000000","5000000","Buy","0-3m","Website","Looking for a property near IT Park"',
    '"Jane Smith","jane.smith@email.com","9876543211","Mohali","Villa","3","7000000","9000000","Buy","3-6m","Referral","Prefers Phase 7 location"'
  ]
  
  return [headers, ...sampleRows].join("\n")
}
