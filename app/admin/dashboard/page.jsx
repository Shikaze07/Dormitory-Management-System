import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { getDashboardData } from "@/lib/actions/dashboard-actions"
import { ActivityChart } from "./components/activity-chart"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  BedDouble,
  DoorOpen,
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  UserCheck,
  CalendarClock,
  History,
  UserPlus,
  KeyRound,
  ShieldCheck,
} from "lucide-react"

export const metadata = {
  title: "Dashboard | Admin Portal",
  description: "Overview of dormitory occupancy, gate activity, and visitor requests.",
}

const roomStatusStyles = {
  Available: "bg-emerald-500",
  Occupied: "bg-blue-500",
  Full: "bg-amber-500",
  Maintenance: "bg-orange-500",
  Unavailable: "bg-muted-foreground",
}

const visitStatusStyles = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  Approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
}

function StatCard({ title, value, icon: Icon, iconClass, valueClass, hint }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Icon className={`h-4 w-4 ${iconClass ?? "text-muted-foreground"}`} />
      </div>
      <div className={`text-2xl font-bold ${valueClass ?? ""}`}>{value}</div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function Panel({ title, description, icon: Icon, action, children, className = "" }) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4 p-6 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  )
}

function fullName(person) {
  return person ? `${person.first_name} ${person.last_name}` : "Unknown"
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  if (data.error) {
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-medium">{data.error}</p>
        </div>
      </div>
    )
  }

  const { stats, roomStatus, activity, recentLogs, upcomingVisits } = data

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <LayoutDashboard className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>
          <p className="text-muted-foreground">
            Overview of dormitory occupancy, gate activity, and visitor requests for{" "}
            {format(new Date(), "EEEE, MMMM d, yyyy")}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/user-management"><UserPlus /> Add User</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/room-assignment"><KeyRound /> Assign Room</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/access-logs"><History /> View Logs</Link>
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Residents"
          value={stats.residents}
          icon={Users}
          hint={
            stats.unassignedResidents > 0
              ? `${stats.unassignedResidents} without a room assignment`
              : `All residents assigned · ${stats.guards} guard${stats.guards === 1 ? "" : "s"} on staff`
          }
        />
        <StatCard
          title="Bed Occupancy"
          value={`${stats.occupancyRate}%`}
          icon={BedDouble}
          iconClass="text-blue-500"
          valueClass="text-blue-600"
          hint={`${stats.occupiedBeds} of ${stats.totalCapacity} beds · ${stats.bedsAvailable} open`}
        />
        <StatCard
          title="Residents Inside"
          value={stats.residentsInside}
          icon={UserCheck}
          iconClass="text-emerald-500"
          valueClass="text-emerald-600"
          hint={`${stats.todayCheckIns} check-ins · ${stats.todayCheckOuts} check-outs today`}
        />
        <StatCard
          title="Pending Visitor Requests"
          value={stats.pendingVisits}
          icon={ClipboardList}
          iconClass="text-amber-500"
          valueClass="text-amber-600"
          hint={`${stats.approvedVisits} approved · ${stats.todayVisitors} visitor entries today`}
        />
      </div>

      <div className="grid gap-4 pt-4 lg:grid-cols-7">
        <Panel
          className="lg:col-span-4"
          icon={ShieldCheck}
          title="Gate Activity"
          description="Check-ins, check-outs, and visitor entries over the last 7 days"
        >
          <ActivityChart data={activity} />
        </Panel>

        <Panel
          className="lg:col-span-3"
          icon={DoorOpen}
          title="Room Status"
          description={`${stats.totalRooms} room${stats.totalRooms === 1 ? "" : "s"} · ${stats.totalCapacity} total beds`}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/dormitory">Manage</Link>
            </Button>
          }
        >
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Overall occupancy</span>
                <span className="tabular-nums text-muted-foreground">
                  {stats.occupiedBeds}/{stats.totalCapacity} beds
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
            </div>
            <Separator />
            {roomStatus.map(({ status, count }) => (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${roomStatusStyles[status]}`} />
                    {status}
                  </div>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${roomStatusStyles[status]}`}
                    style={{ width: `${stats.totalRooms ? (count / stats.totalRooms) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Panel
          className="lg:col-span-4"
          icon={History}
          title="Recent Gate Scans"
          description="Latest resident and visitor scans at the entrance"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/access-logs">View all</Link>
            </Button>
          }
        >
          {recentLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No scans recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {recentLogs.map((log) => {
                const person = log.user ?? log.visitor
                const isCheckIn = log.access_type === "CheckIn"
                return (
                  <li key={log.id} className="flex items-center gap-3 py-3">
                    <Avatar className="h-9 w-9">
                      {log.user?.photo && <AvatarImage src={log.user.photo} alt={fullName(person)} />}
                      <AvatarFallback className="text-xs">
                        {person ? `${person.first_name[0]}${person.last_name[0]}` : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{fullName(person)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {log.visitor ? "Visitor" : log.user?.role ?? "User"} · scanned by {fullName(log.scanned_by)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className={
                          isCheckIn
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-600"
                        }
                      >
                        {isCheckIn ? <ArrowDownCircle /> : <ArrowUpCircle />}
                        {isCheckIn ? "Check-in" : "Check-out"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel
          className="lg:col-span-3"
          icon={CalendarClock}
          title="Upcoming Visits"
          description="Pending and approved visitor requests from today onward"
        >
          {upcomingVisits.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No upcoming visits scheduled.</p>
          ) : (
            <ul className="divide-y">
              {upcomingVisits.map((visit) => (
                <li key={visit.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{fullName(visit.visitor)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Visiting {fullName(visit.resident)}
                      {visit.purpose ? ` · ${visit.purpose}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(visit.expected_at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <Badge variant="outline" className={visitStatusStyles[visit.status]}>
                    {visit.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
