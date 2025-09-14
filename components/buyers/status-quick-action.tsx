"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import type { Buyer } from "@/lib/types"

interface StatusQuickActionProps {
  buyer: Buyer
  onStatusChange?: () => void
}

const statusOptions = [
  { value: "New", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "Qualified", label: "Qualified", color: "bg-green-100 text-green-800" },
  { value: "Contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "Visited", label: "Visited", color: "bg-purple-100 text-purple-800" },
  { value: "Negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-800" },
  { value: "Converted", label: "Converted", color: "bg-green-200 text-green-900" },
  { value: "Dropped", label: "Dropped", color: "bg-red-100 text-red-800" },
]

export function StatusQuickAction({ buyer, onStatusChange }: StatusQuickActionProps) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (!user || newStatus === buyer.status) return

    // Check ownership - users can only edit their own buyers unless they're admin
    if (user.role !== "admin" && user.id !== buyer.ownerId) {
      toast.error("You can only edit your own buyers")
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...buyer,
          status: newStatus,
          tags: buyer.tags || [], // Ensure tags are included
          changedBy: user.id,
          currentUserId: user.id,
          currentUserRole: user.role,
          lastUpdated: buyer.updatedAt,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }

      toast.success(`Status updated to ${newStatus}`)
      
      // Call the callback to refresh the list
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  // User can edit if they own the buyer OR if they are admin
  const canEdit = user?.role === "admin" || user?.id === buyer.ownerId

  if (!canEdit) {
    // Show status as read-only badge for non-owners
    const currentStatus = statusOptions.find(s => s.value === buyer.status)
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus?.color || "bg-gray-100 text-gray-800"}`}>
        {buyer.status}
      </span>
    )
  }

  return (
    <Select
      value={buyer.status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[130px] h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem 
            key={status.value} 
            value={status.value}
            className="cursor-pointer"
          >
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
