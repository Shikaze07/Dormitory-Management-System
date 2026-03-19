"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  UserCircle,
  UserCheck,
  UserX,
  BadgeCheck,
  ShieldAlert
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toggleUserStatus } from "@/lib/actions/user-actions"
import { toast } from "sonner"
import { EditUserDialog } from "./components/edit-user-dialog"
import { Badge } from "@/components/ui/badge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  dob: Date
  gender: "Male" | "Female"
  username: string
  role: "Admin" | "Guard" | "Resident"
  qr_code: string
  photo?: string | null
  created_at: Date
  is_active: boolean
}

const QRCodeCell = ({ value, size = 40 }: { value: string, size?: number }) => {
  const [src, setSrc] = useState<string>("")

  useEffect(() => {
    QRCode.toDataURL(value, { width: size * 4 }).then(setSrc)
  }, [value, size])

  return src ? (
    <img src={src} alt="QR Code" className="border rounded" style={{ width: size, height: size }} />
  ) : (
    <div className="animate-pulse bg-muted rounded" style={{ width: size, height: size }} />
  )
}
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "photo",
    header: "Photo",
    cell: ({ row }) => {
      const user = row.original
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={user.photo || undefined} alt={user.first_name} />
              <AvatarFallback>
                {user.first_name[0]}
                {user.last_name[0]}
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
                  alt={user.first_name}
                  className="max-h-[70vh] w-full object-contain rounded-lg border"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground py-12">
                  <UserCircle className="h-20 w-20 opacity-20" />
                  <p>No photo available</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )
    },
  },
  {
    id: "name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: "Name",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "qr_code",
    header: "QR Code",
    cell: ({ row }) => {
      const user = row.original
      const qrValue = row.getValue("qr_code") as string

      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer hover:opacity-80 transition-opacity flex">
              <QRCodeCell value={qrValue} />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code: {user.first_name} {user.last_name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <QRCodeCell value={qrValue} size={250} />
              </div>
              {/* <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
                {qrValue}
              </p> */}
            </div>
          </DialogContent>
        </Dialog>
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
          className={`gap-1.5 px-2.5 py-0.5 font-medium shadow-sm transition-all duration-300 ${
            isActive
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-500/20"
          }`}
        >
          {isActive ? (
            <BadgeCheck className="h-3.5 w-3.5" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5" />
          )}
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const [editOpen, setEditOpen] = useState(false)
      const [showToggleStatusDialog, setShowToggleStatusDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)


      const handleToggleStatus = async () => {
        setIsLoading(true)
        const result = await toggleUserStatus(user.id)
        setIsLoading(false)
        setShowToggleStatusDialog(false)
        if (result.success) {
          toast.success(`User ${user.is_active ? "deactivated" : "activated"} successfully`)
        } else {
          toast.error(result.error || "Failed to update user status")
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
              <DropdownMenuItem onClick={() => setShowToggleStatusDialog(true)}>
                {user.is_active ? (
                  <div className="flex items-center text-amber-600">
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </div>
                ) : (
                  <div className="flex items-center text-emerald-600">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </div>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditUserDialog
            user={user}
            open={editOpen}
            onOpenChange={setEditOpen}
          />


          <ConfirmationDialog
            open={showToggleStatusDialog}
            onOpenChange={setShowToggleStatusDialog}
            onConfirm={handleToggleStatus}
            isLoading={isLoading}
            title={user.is_active ? "Deactivate User?" : "Activate User?"}
            description={
              user.is_active
                ? `Are you sure you want to deactivate ${user.first_name} ${user.last_name}? They will no longer be able to log in or use their QR code for access.`
                : `Are you sure you want to activate ${user.first_name} ${user.last_name}? This will restore their system access.`
            }
            confirmText={user.is_active ? "Deactivate" : "Activate"}
            variant={user.is_active ? "default" : "default"}
          />
        </>
      )
    },
  },
]