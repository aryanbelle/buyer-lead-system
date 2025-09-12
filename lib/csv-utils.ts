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
  name: "Name",
  email: "Email",
  phone: "Phone",
  city: "City",
  propertyType: "Property Type",
  bhk: "BHK",
  budget: "Budget",
  purpose: "Purpose",
  timeline: "Timeline",
  source: "Source",
  status: "Status",
  notes: "Notes",
} as const

export function exportToCSV(buyers: Buyer[]): string {
  const headers = Object.values(CSV_HEADERS).join(",")

  const rows = buyers.map((buyer) => {
    return [
      `"${buyer.name}"`,
      `"${buyer.email}"`,
      `"${buyer.phone}"`,
      `"${buyer.city}"`,
      `"${buyer.propertyType}"`,
      `"${buyer.bhk}"`,
      buyer.budget,
      `"${buyer.purpose}"`,
      `"${buyer.timeline}"`,
      `"${buyer.source}"`,
      `"${buyer.status}"`,
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
        name: row[headerMap.name]?.replace(/"/g, "") || "",
        email: row[headerMap.email]?.replace(/"/g, "") || "",
        phone: row[headerMap.phone]?.replace(/"/g, "") || "",
        city: row[headerMap.city]?.replace(/"/g, "") || "",
        propertyType: row[headerMap.propertyType]?.replace(/"/g, "") || "",
        bhk: row[headerMap.bhk]?.replace(/"/g, "") || "",
        budget: Number.parseInt(row[headerMap.budget]) || 0,
        purpose: row[headerMap.purpose]?.replace(/"/g, "") || "",
        timeline: row[headerMap.timeline]?.replace(/"/g, "") || "",
        source: row[headerMap.source]?.replace(/"/g, "") || "",
        status: row[headerMap.status]?.replace(/"/g, "") || "",
        notes: row[headerMap.notes]?.replace(/"/g, "") || "",
      }

      // Validate using Zod schema
      const validatedData = buyerSchema.parse(buyerData)

      // Create full buyer object
      const buyer: Buyer = {
        ...validatedData,
        id: `import-${Date.now()}-${index}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "import",
        updatedBy: "import",
      }

      validBuyers.push(buyer)
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
  const sampleData: Partial<Buyer>[] = [
    {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+91 9876543210",
      city: "Mumbai",
      propertyType: "Apartment",
      bhk: "2BHK",
      budget: 5000000,
      purpose: "Buy",
      timeline: "1-3 months",
      source: "Website",
      status: "New",
      notes: "Looking for a property near the station",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+91 9876543211",
      city: "Delhi",
      propertyType: "Villa",
      bhk: "3BHK",
      budget: 8000000,
      purpose: "Buy",
      timeline: "3-6 months",
      source: "Referral",
      status: "Contacted",
      notes: "Prefers South Delhi location",
    },
  ]

  return exportToCSV(sampleData as Buyer[])
}
