import { Metadata } from "next"
import { getRooms } from "@/lib/actions/room-actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { AddRoomDialog } from "./components/add-room-dialog"
import { Separator } from "@/components/ui/separator"
import { DoorOpen, LayoutDashboard, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dormitory Management | Admin",
  description: "Manage dormitory rooms and occupancy.",
}

export default async function DormitoryPage() {
  const { rooms, error } = await getRooms()

  if (error) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <DoorOpen className="h-10 w-10 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-semibold text-destructive">Error Loading Rooms</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {error}
          </p>
          <Button variant="outline">Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <DoorOpen className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Dormitory Management</h2>
          </div>
          <p className="text-muted-foreground">
            Manage your dormitory rooms, capacity, and current occupancy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
          <AddRoomDialog />
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Rooms</h3>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{rooms?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Across all floors
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Available</h3>
            <DoorOpen className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {rooms?.filter(r => r.status === "Available").length || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Ready for assignment
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Maintenance</h3>
            <History className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {rooms?.filter(r => r.status === "Maintenance").length || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Currently unavailable
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Capacity</h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {rooms?.reduce((acc, room) => acc + room.capacity, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Total bed spaces
          </p>
        </div>
      </div>

      <div className="pt-4">
        <DataTable data={rooms || []} columns={columns} />
      </div>
    </div>
  )
}

import { Users } from "lucide-react"
