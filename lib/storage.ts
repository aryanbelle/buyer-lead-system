import type { Buyer, BuyerHistory } from "./types"
import { mockBuyers } from "./mock-data"

// Client-side API calls for data operations
export async function getBuyers(): Promise<Buyer[]> {
  if (typeof window === "undefined") {
    // Server-side: return mock data for SSR
    return mockBuyers
  }

  try {
    const response = await fetch("/api/buyers")
    if (!response.ok) throw new Error("Failed to fetch buyers")
    
    const data = await response.json()
    return data.buyers || []
  } catch (error) {
    console.error("Error fetching buyers:", error)
    // Fallback to localStorage for development
    const stored = localStorage.getItem("buyer-leads")
    return stored ? JSON.parse(stored) : mockBuyers
  }
}

export async function getBuyerById(id: string): Promise<Buyer | null> {
  if (typeof window === "undefined") {
    return mockBuyers.find(b => b.id === id) || null
  }

  try {
    const response = await fetch(`/api/buyers/${id}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to fetch buyer")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching buyer:", error)
    return null
  }
}

export async function getBuyerHistory(buyerId: string): Promise<BuyerHistory[]> {
  if (typeof window === "undefined") return []

  try {
    const response = await fetch(`/api/buyers/${buyerId}/history`)
    if (!response.ok) throw new Error("Failed to fetch buyer history")
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching buyer history:", error)
    return []
  }
}

export async function addBuyer(buyer: Omit<Buyer, "id" | "updatedAt">): Promise<Buyer> {
  if (typeof window === "undefined") {
    throw new Error("Cannot add buyer on server side")
  }

  try {
    const response = await fetch("/api/buyers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buyer),
    })

    if (!response.ok) throw new Error("Failed to create buyer")
    
    return await response.json()
  } catch (error) {
    console.error("Error creating buyer:", error)
    throw error
  }
}

export async function updateBuyer(id: string, updates: Partial<Buyer>, changedBy: string): Promise<Buyer | null> {
  if (typeof window === "undefined") {
    throw new Error("Cannot update buyer on server side")
  }

  try {
    const response = await fetch(`/api/buyers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updates, changedBy }),
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to update buyer")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error updating buyer:", error)
    throw error
  }
}

export async function deleteBuyer(id: string): Promise<boolean> {
  if (typeof window === "undefined") {
    throw new Error("Cannot delete buyer on server side")
  }

  try {
    const response = await fetch(`/api/buyers/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete buyer")
    
    return true
  } catch (error) {
    console.error("Error deleting buyer:", error)
    return false
  }
}
