"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontal,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { QRCodeCell } from "@/components/shared/qr-code-cell"
import { cancelVisitorRequest } from "@/lib/actions/visitor-actions"
import { toast } from "sonner"
import { useState } from "react"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"

export type VisitorRequest = {
  id: number
  purpose: string | null
  expected_at: Date
  status: "Pending" | "Approved" | "Rejected" | "Completed" | "Cancelled"
  created_at: Date
  visitor: {
    id: string
    first_name: string
    middle_name?: string | null
    last_name: string
    gender: string
    qr_code: string
    qr_expires_at: Date
  }
}

export const columns: ColumnDef<VisitorRequest>[] = [
  {
    accessorFn: (row) => `${row.visitor.first_name} ${row.visitor.last_name}`,
    id: "visitor",
    header: "Visitor Name",
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => {
      const purpose = row.getValue("purpose") as string
      return <div className="max-w-[200px] truncate" title={purpose}>{purpose}</div>
    }
  },
  {
    accessorKey: "expected_at",
    header: "Expected Visit",
    cell: ({ row }) => {
      return format(new Date(row.getValue("expected_at")), "MMM dd, yyyy")
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      const colors: Record<string, string> = {
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Rejected: "bg-destructive/10 text-destructive border-destructive/20",
        Completed: "bg-blue-50 text-blue-700 border-blue-200",
        Cancelled: "bg-slate-50 text-slate-700 border-slate-200",
      }

      return (
        <Badge className={`font-medium ${colors[status] || ""}`} variant="outline">
          {status}
        </Badge>
      )
    }
  },
  {
    id: "qr_code",
    header: "Access Pass",
    cell: ({ row }) => {
      const request = row.original
      const isExpired = new Date() > new Date(request.visitor.qr_expires_at)

      if (request.status === "Cancelled" || request.status === "Rejected") {
        return <span className="text-xs text-muted-foreground italic">Revoked</span>
      }

      if (isExpired) {
        return (
          <Badge variant="outline" className="text-muted-foreground opacity-50 gap-1 border-dashed">
            <Clock className="h-3 w-3" />
            Expired
          </Badge>
        )
      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <QrCode className="h-4 w-4" />
              View Pass
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Visitor Access Pass</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-8 gap-6">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold">{request.visitor.first_name} {request.visitor.last_name}</h3>
              </div>

              <div className="bg-white p-6 rounded-2xl border-4 border-primary/10 shadow-xl">
                <QRCodeCell value={request.visitor.qr_code} size={220} />
              </div>

              <div className="w-full space-y-3 bg-muted/50 p-4 rounded-xl border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="h-4 w-4" />
                    Expires
                  </span>
                  <span className="font-bold text-primary">
                    {format(new Date(request.visitor.qr_expires_at), "MMM dd, hh:mm a")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Status
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">VALID</Badge>
                </div>
              </div>

              <p className="text-[10px] text-center text-muted-foreground leading-tight px-4 italic">
                This QR code is strictly for the use of the registered visitor.
                Misuse may result in disciplinary action against the resident.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original
      const [showCancelDialog, setShowCancelDialog] = useState(false)
      const [showDetailsDialog, setShowDetailsDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const handleCancel = async () => {
        setIsLoading(true)
        const result = await cancelVisitorRequest(request.id)
        setIsLoading(false)
        setShowCancelDialog(false)
        if (result.success) {
          toast.success("Visitor request cancelled")
        } else {
          toast.error(result.error || "Failed to cancel request")
        }
      }

      const fullName = [
        request.visitor.first_name,
        request.visitor.middle_name,
        request.visitor.last_name,
      ]
        .filter(Boolean)
        .join(" ")

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
              <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {request.status === "Pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowCancelDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Visit
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Visitor Request Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-muted/40 border text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Visitor Name</span>
                    <span className="font-semibold text-foreground">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Gender</span>
                    <span className="font-semibold text-foreground">{request.visitor.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Status</span>
                    <Badge variant="outline" className="mt-0.5 font-medium">
                      {request.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Expected Visit</span>
                    <span className="font-semibold text-foreground">
                      {format(new Date(request.expected_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block">Pass Expiration</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(request.visitor.qr_expires_at), "MMM dd, yyyy hh:mm a")}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block">Purpose of Visit</span>
                    <p className="mt-1 text-foreground leading-relaxed">
                      {request.purpose || "No specific purpose provided."}
                    </p>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground pt-1 border-t">
                    Registered on {format(new Date(request.created_at), "MMM dd, yyyy hh:mm a")}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <ConfirmationDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            onConfirm={handleCancel}
            isLoading={isLoading}
            title="Cancel Visit Request?"
            description={`Are you sure you want to cancel the visit request for ${request.visitor.first_name}? This action cannot be undone.`}
            confirmText="Cancel Visit"
            variant="destructive"
          />
        </>
      )
    },
  },
]
