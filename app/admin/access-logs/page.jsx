import { getGuardAccessLogs } from "@/lib/actions/guard-actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, History, ArrowDownCircle, ArrowUpCircle, Users, Activity } from "lucide-react"

export const metadata = {
  title: "Access Logs | Admin Portal",
  description: "Monitor and audit dormitory entrance and exit activity logs with date and type filters.",
}

export default async function AdminAccessLogsPage() {
  const { logs, error } = await getGuardAccessLogs()

  const safeLogs = logs || []
  const checkIns = safeLogs.filter((l) => l.access_type === "CheckIn")
  const checkOuts = safeLogs.filter((l) => l.access_type === "CheckOut")
  const visitorLogs = safeLogs.filter((l) => Boolean(l.visitor))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <History className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Access & Entry Logs</h2>
          </div>
          <p className="text-muted-foreground">
            Monitor real-time resident and visitor check-in / check-out station logs.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* KPI Stats cards matching Room Assignment / User Management structure */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Entries Logged</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{safeLogs.length}</div>
          <p className="text-xs text-muted-foreground">Recent recorded scans</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Check-Ins</h3>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{checkIns.length}</div>
          <p className="text-xs text-muted-foreground">Gate entrances recorded</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Check-Outs</h3>
            <ArrowUpCircle className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{checkOuts.length}</div>
          <p className="text-xs text-muted-foreground">Gate exits recorded</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Visitor Scans</h3>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{visitorLogs.length}</div>
          <p className="text-xs text-muted-foreground">Guest passes scanned</p>
        </div>
      </div>

      <div className="pt-4">
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <DataTable data={safeLogs} columns={columns} />
        )}
      </div>
    </div>
  )
}
