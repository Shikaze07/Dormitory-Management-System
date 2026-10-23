"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowDownCircle, ArrowUpCircle, Shield, User, Clock } from "lucide-react"
import { format } from "date-fns"

export const columns = [
  {
    accessorKey: "access_type",
    header: "Type",
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true
      return row.getValue(id) === value
    },
    cell: ({ row }) => {
      const type = row.getValue("access_type")
      const isCheckIn = type === "CheckIn"

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isCheckIn
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
          }`}
        >
          {isCheckIn ? (
            <ArrowDownCircle className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpCircle className="h-3.5 w-3.5" />
          )}
          {type === "CheckIn" ? "Check-In" : "Check-Out"}
        </span>
      )
    },
  },
  {
    id: "person",
    accessorFn: (row) => {
      if (row.user) return `${row.user.first_name} ${row.user.last_name}`
      if (row.visitor) return `${row.visitor.first_name} ${row.visitor.last_name}`
      return "Unknown"
    },
    header: "Person",
    filterFn: (row, id, value) => {
      const person = String(row.getValue(id) || "").toLowerCase()
      return person.includes(String(value).toLowerCase())
    },
    cell: ({ row }) => {
      const personName = row.getValue("person")
      const log = row.original
      const username = log.user?.username

      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{personName}</span>
          {username ? (
            <span className="text-xs text-muted-foreground">@{username}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Visitor Pass</span>
          )}
        </div>
      )
    },
  },
  {
    id: "category",
    accessorFn: (row) => {
      if (row.user) return row.user.role
      return "Visitor"
    },
    header: "Category",
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true
      return row.getValue(id) === value
    },
    cell: ({ row }) => {
      const category = row.getValue("category")
      const isResident = category === "Resident"
      const isGuard = category === "Guard"
      const isAdmin = category === "Admin"

      return (
        <Badge
          variant="outline"
          className={
            isResident
              ? "bg-secondary text-secondary-foreground"
              : isGuard
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
              : isAdmin
              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400"
              : "bg-muted text-muted-foreground"
          }
        >
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    filterFn: (row, id, value) => {
      if (!value) return true
      const date = new Date(row.getValue(id))
      const [year, month, day] = value.split("-").map(Number)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"))
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{format(date, "MMM dd, yyyy · hh:mm a")}</span>
        </div>
      )
    },
  },
  {
    id: "scanned_by",
    accessorFn: (row) => {
      if (row.scanned_by) {
        return `${row.scanned_by.first_name} ${row.scanned_by.last_name}`
      }
      return "System"
    },
    header: "Station / Guard",
    cell: ({ row }) => {
      const scanner = row.getValue("scanned_by")
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>{scanner}</span>
        </div>
      )
    },
  },
]
