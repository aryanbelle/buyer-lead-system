"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface BuyerRowActionsProps {
  buyerId: string
  ownerId: string
}

export function BuyerRowActions({ buyerId, ownerId }: BuyerRowActionsProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = () => {
    router.push(`/buyers/${buyerId}`)
  }

  const handleEdit = () => {
    router.push(`/buyers/${buyerId}/edit`)
  }

  const handleDelete = async () => {
    if (!user) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/buyers/${buyerId}?currentUserId=${user.id}&currentUserRole=${user.role}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete buyer')
      }

      toast.success('Buyer deleted successfully')
      
      // Refresh the page to update the list
      router.refresh()
    } catch (error) {
      console.error('Error deleting buyer:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete buyer')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // User can edit/delete if they own the buyer OR if they are admin
  const canEdit = user?.role === 'admin' || user?.id === ownerId

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="z-[9999]"
        >
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {canEdit && (
            <>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Buyer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this buyer? This action cannot be undone and will permanently remove all buyer data and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
