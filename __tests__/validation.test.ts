import { describe, test, expect } from '@jest/globals'
import { buyerSchema } from '@/lib/validation'

describe('Buyer Validation', () => {
  test('should validate budget constraints correctly', () => {
    // Test valid budget range
    const validBuyer = {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      budgetMin: 5000000,
      budgetMax: 8000000,
      timeline: "0-3m",
      source: "Website"
    }

    const result = buyerSchema.safeParse(validBuyer)
    expect(result.success).toBe(true)
  })

  test('should reject when budgetMax is less than budgetMin', () => {
    const invalidBuyer = {
      fullName: "John Doe", 
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      budgetMin: 8000000,
      budgetMax: 5000000, // Invalid: max < min
      timeline: "0-3m",
      source: "Website"
    }

    const result = buyerSchema.safeParse(invalidBuyer)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors.some(e => 
        e.message.includes("Maximum budget must be greater than or equal to minimum budget")
      )).toBe(true)
    }
  })

  test('should require BHK for Apartment property type', () => {
    const invalidBuyer = {
      fullName: "John Doe",
      phone: "9876543210", 
      city: "Chandigarh",
      propertyType: "Apartment",
      // bhk is missing but required for Apartment
      purpose: "Buy",
      budgetMin: 5000000,
      timeline: "0-3m",
      source: "Website"
    }

    const result = buyerSchema.safeParse(invalidBuyer)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors.some(e => 
        e.message.includes("BHK is required for Apartment and Villa properties")
      )).toBe(true)
    }
  })

  test('should not require BHK for Plot property type', () => {
    const validBuyer = {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh", 
      propertyType: "Plot",
      // bhk is not required for Plot
      purpose: "Buy",
      budgetMin: 5000000,
      timeline: "0-3m",
      source: "Website"
    }

    const result = buyerSchema.safeParse(validBuyer)
    expect(result.success).toBe(true)
  })

  test('should validate phone number format', () => {
    // Valid phone number
    const validBuyer = {
      fullName: "John Doe",
      phone: "9876543210", // 10 digits - valid
      city: "Chandigarh",
      propertyType: "Plot",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website"
    }

    const result = buyerSchema.safeParse(validBuyer)
    expect(result.success).toBe(true)

    // Invalid phone number
    const invalidBuyer = {
      ...validBuyer,
      phone: "123" // Too short
    }

    const invalidResult = buyerSchema.safeParse(invalidBuyer)
    expect(invalidResult.success).toBe(false)
    if (!invalidResult.success) {
      expect(invalidResult.error.errors.some(e => 
        e.message.includes("Phone must be 10-15 digits")
      )).toBe(true)
    }
  })
})
