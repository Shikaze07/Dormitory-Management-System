"use client"

import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { 
  MoreHorizontal, 
  Pencil, 
  Trash,
  Users,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hammer
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteRoom } from "@/lib/actions/room-actions"
import { toast } from "sonner"
import { EditRoomDialog } from "./components/edit-room-dialog"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

const statusConfig = {
  Available: {
    label: "Available",
    icon: CheckCircle2,
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  Occupied: {
    label: "Occupied",
    icon: Users,
    className: "bg-blue-500/15 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
  },
  Full: {
    label: "Full",
    icon: XCircle,
    className: "bg-rose-500/15 text-rose-600 border-rose-500/20 hover:bg-rose-500/20",
  },
  Maintenance: {
    label: "Maintenance",
    icon: Hammer,
    className: "bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  },
  Unavailable: {
    label: "Unavailable",
    icon: AlertTriangle,
    className: "bg-slate-500/15 text-slate-600 border-slate-500/20 hover:bg-slate-500/20",
  },
}

export const columns = [
  {
    accessorKey: "room_number",
    header: "Room Number",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <DoorOpen className="h-4 w-4 text-muted-foreground" />
        {row.getValue("room_number")}
      </div>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        {row.getValue("capacity")} beds
      </div>
    ),
  },
  {
    accessorKey: "occupancy",
    header: "Occupancy",
    cell: ({ row }) => {
      const occupancy = row.original.occupancy
      const capacity = row.original.capacity
      const percent = (occupancy / capacity) * 100
      
      return (
        <div className="flex flex-col gap-1.5 w-[100px]">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span>{occupancy}/{capacity}</span>
            <span>{Math.round(percent)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border">
            <div 
              className={`h-full transition-all ${
                percent >= 100 ? "bg-rose-500" : percent >= 75 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status")
      const config = statusConfig[status]
      const Icon = config.icon

      return (
        <Badge 
          variant="outline" 
          className={`gap-1.5 font-medium px-2 py-0.5 ${config.className}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const room = row.original
      const [editOpen, setEditOpen] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteRoom(room.id)
        setIsLoading(false)
        setShowDeleteDialog(false)
        if (result.success) {
          toast.success("Room deleted successfully")
        } else {
          toast.error(result.error || "Failed to delete room")
        }
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditRoomDialog 
            room={room} 
            open={editOpen} 
            onOpenChange={setEditOpen} 
          />

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isLoading}
            title="Delete Room?"
            description={`Are you sure you want to delete Room ${room.room_number}? This action is permanent and cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )
    },
  },
]
