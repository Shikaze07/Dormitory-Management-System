import { Metadata } from "next"
import { getVisitorRequests } from "@/lib/actions/visitor-actions"
import { DataTable } from "./components/data-table"
import { AddVisitorDialog } from "./components/add-visitor-dialog"
import { Separator } from "@/components/ui/separator"
import { UserPlus, LayoutDashboard, History, UserCheck, ShieldQuestion } from "lucide-react"
import { columns } from "./columns"

export const metadata: Metadata = {
  title: "Visitor Requests | Resident",
  description: "Register and manage your visitor access requests.",
}

export default async function VisitorRequestsPage() {
  const { requests, error } = await getVisitorRequests()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <UserPlus className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Visitor Requests</h2>
          </div>
          <p className="text-muted-foreground">
            Register visitors and manage their time-bound access QR codes.
          </p>
        </div>
        <AddVisitorDialog />
      </div>
      
      <Separator className="my-6" />
      
      {error ? (
        <div className="p-8 text-center bg-destructive/5 border border-destructive/20 rounded-xl">
           <ShieldQuestion className="mx-auto h-10 w-10 text-destructive/40 mb-4" />
           <h3 className="text-lg font-semibold text-destructive">Unable to Load Requests</h3>
           <p className="text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Total Requests</h3>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{requests?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Registered visits</p>
            </div>
            
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Active Passes</h3>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {requests?.filter(r => r.status === "Approved" || r.status === "Pending").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Currently valid or pending</p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Completed</h3>
                <History className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {requests?.filter(r => r.status === "Completed").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Past visits</p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Rejected/Cancelled</h3>
                <ShieldQuestion className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {requests?.filter(r => r.status === "Cancelled" || r.status === "Rejected").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Inactive requests</p>
            </div>
          </div>

          <div className="pt-4">
            <DataTable 
              data={(requests as any) || []} 
              columns={columns as any} 
            />
          </div>
        </>
      )}
    </div>
  )
}
