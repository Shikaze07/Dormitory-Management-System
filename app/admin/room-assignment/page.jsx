import { getAssignments } from "@/lib/actions/assignment-actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { AddAssignmentDialog } from "./components/add-assignment-dialog"
import { Separator } from "@/components/ui/separator"
import { BookCheck, LayoutDashboard, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Room Assignments | Admin",
  description: "Manage resident room assignments and occupancy.",
}

export default async function RoomAssignmentPage() {
  const { assignments, error } = await getAssignments()

  if (error) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <BookCheck className="h-10 w-10 text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-semibold text-destructive">Error Loading Assignments</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {error}
          </p>
          <Button variant="outline">Try again</Button>
        </div>
      </div>
    )
  }

  const activeAssignments = assignments?.filter(a => a.is_active) || []
  const inactiveAssignments = assignments?.filter(a => !a.is_active) || []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BookCheck className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Room Assignments</h2>
          </div>
          <p className="text-muted-foreground">
            Monitor and manage resident room allocations and history.
          </p>
        </div>
        <div className="flex items-center gap-2">
         
          <AddAssignmentDialog />
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Assignments</h3>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{assignments?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            All-time records
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Residents</h3>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {activeAssignments.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Currently in dormitory
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Vacated Recently</h3>
            <UserX className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {inactiveAssignments.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Historical records
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Completion Rate</h3>
            <BookCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {assignments && assignments.length > 0 
              ? Math.round((inactiveAssignments.length / assignments.length) * 100) 
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Stay completion
          </p>
        </div>
      </div>

      <div className="pt-4">
        <DataTable data={assignments || []} columns={columns} />
      </div>
    </div>
  )
}
