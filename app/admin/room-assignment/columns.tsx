"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  UserMinus, 
  Trash2, 
  Calendar,
  DoorOpen,
  User as UserIcon,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { format } from "date-fns"
import { vacateResident, deleteAssignment } from "@/lib/actions/assignment-actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

export type Assignment = {
  id: number
  user_id: string
  room_id: number
  assigned_at: Date
  vacated_at: Date | null
  is_active: boolean
  user: {
    first_name: string
    last_name: string
    photo: string | null
  }
  room: {
    room_number: string
  }
}

export const columns: ColumnDef<Assignment>[] = [
  {
    accessorKey: "user",
    header: "Resident",
    filterFn: (row, id, value) => {
      const user = row.original.user
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
      return fullName.includes(value.toLowerCase())
    },
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Avatar className="h-9 w-9 border shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={user.photo || undefined} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{user.first_name} {user.last_name}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center p-4">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="max-h-[70vh] w-full object-contain rounded-lg border shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground py-12">
                    <UserIcon className="h-20 w-20 opacity-20" />
                    <p>No photo available</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {user.first_name} {user.last_name}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Resident
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: "room",
    accessorKey: "room.room_number",
    header: "Room",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DoorOpen className="h-4 w-4" />
        </div>
        <span className="font-semibold">{row.original.room.room_number}</span>
      </div>
    ),
  },
  {
    accessorKey: "assigned_at",
    header: "Assigned Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="text-sm">
          {format(new Date(row.original.assigned_at), "MMM d, yyyy")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "vacated_at",
    header: "Vacated Date",
    cell: ({ row }) => {
      const date = row.original.vacated_at
      if (!date) return <span className="text-xs text-muted-foreground italic">N/A</span>
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {format(new Date(date), "MMM d, yyyy")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <Badge 
          variant={isActive ? "default" : "secondary"}
          className={`gap-1 px-2.5 py-0.5 font-medium shadow-sm transition-all duration-300 ${
            isActive 
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" 
              : "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20"
          }`}
        >
          {isActive ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const assignment = row.original
      const [showVacateDialog, setShowVacateDialog] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const handleVacate = async () => {
        setIsLoading(true)
        const result = await vacateResident(assignment.id)
        setIsLoading(false)
        setShowVacateDialog(false)
        if (result.success) toast.success("Resident vacated successfully")
        else toast.error(result.error || "Failed to vacate resident")
      }

      const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteAssignment(assignment.id)
        setIsLoading(false)
        setShowDeleteDialog(false)
        if (result.success) toast.success("Assignment record deleted")
        else toast.error(result.error || "Failed to delete record")
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {assignment.is_active && (
                <DropdownMenuItem 
                  onClick={() => setShowVacateDialog(true)}
                  className="text-amber-600 focus:text-amber-600 cursor-pointer"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Vacate Resident
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmationDialog
            open={showVacateDialog}
            onOpenChange={setShowVacateDialog}
            onConfirm={handleVacate}
            isLoading={isLoading}
            title="Vacate Resident?"
            description={`Are you sure you want to vacate ${assignment.user.first_name}? This will mark their stay as inactive and free up the bed.`}
            confirmText="Vacate"
            variant="default"
          />

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isLoading}
            title="Delete Assignment?"
            description="Are you sure you want to delete this assignment record? This action is permanent and cannot be undone."
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )
    },
  },
]

