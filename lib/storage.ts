import type { Buyer, BuyerHistory } from "./types"
import { mockBuyers } from "./mock-data"

// Local storage utilities for persisting data (in production, this would be database operations)
const BUYERS_KEY = "buyer-leads"
const HISTORY_KEY = "buyer-history"

export function getBuyers(): Buyer[] {
  if (typeof window === "undefined") return mockBuyers

  const stored = localStorage.getItem(BUYERS_KEY)
  return stored ? JSON.parse(stored) : mockBuyers
}

export function saveBuyers(buyers: Buyer[]): void {
  if (typeof window === "undefined") return

  localStorage.setItem(BUYERS_KEY, JSON.stringify(buyers))
}

export function getBuyerHistory(): BuyerHistory[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(HISTORY_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveBuyerHistory(history: BuyerHistory[]): void {
  if (typeof window === "undefined") return

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function addBuyer(buyer: Omit<Buyer, "id" | "updatedAt">): Buyer {
  const buyers = getBuyers()
  const newBuyer: Buyer = {
    ...buyer,
    id: Date.now().toString(),
    updatedAt: new Date(),
  }

  buyers.push(newBuyer)
  saveBuyers(buyers)

  // Add to history
  const history = getBuyerHistory()
  history.push({
    id: Date.now().toString() + Math.random(),
    buyerId: newBuyer.id,
    changedBy: buyer.ownerId,
    changedAt: new Date(),
    diff: { created: { old: null, new: "Buyer created" } }
  })
  saveBuyerHistory(history)

  return newBuyer
}

export function updateBuyer(id: string, updates: Partial<Buyer>, changedBy: string): Buyer | null {
  const buyers = getBuyers()
  const index = buyers.findIndex((b) => b.id === id)

  if (index === -1) return null

  const oldBuyer = buyers[index]
  const updatedBuyer = {
    ...oldBuyer,
    ...updates,
    updatedAt: new Date(),
  }

  buyers[index] = updatedBuyer
  saveBuyers(buyers)

  // Track changes in history
  const history = getBuyerHistory()
  const diff: Record<string, { old: any; new: any }> = {}
  
  Object.keys(updates).forEach((field) => {
    if (field !== "updatedAt" && oldBuyer[field as keyof Buyer] !== updates[field as keyof Buyer]) {
      diff[field] = {
        old: oldBuyer[field as keyof Buyer],
        new: updates[field as keyof Buyer]
      }
    }
  })

  if (Object.keys(diff).length > 0) {
    history.push({
      id: Date.now().toString() + Math.random(),
      buyerId: id,
      changedBy,
      changedAt: new Date(),
      diff
    })
    saveBuyerHistory(history)
  }

  return updatedBuyer
}

export function deleteBuyer(id: string): boolean {
  const buyers = getBuyers()
  const index = buyers.findIndex((b) => b.id === id)

  if (index === -1) return false

  buyers.splice(index, 1)
  saveBuyers(buyers)

  return true
}
