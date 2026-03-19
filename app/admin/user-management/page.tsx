import { columns, User } from "./columns"
import { DataTable } from "./data-table"
import { AddUserDialog } from "./components/add-user-dialog"
import { getUsers } from "@/lib/actions/user-actions"
import { Separator } from "@/components/ui/separator"
import { DoorOpen } from "lucide-react"
export default async function UserManagementPage() {
  const { users, error } = await getUsers()

  return (
    <div className="container mx-auto  p-7 space-y-4">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-primary mb-1">
            <DoorOpen className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          </div>
          <p className="text-muted-foreground">
            Manage dormitory residents, security guards, and administrators.
          </p>
        </div>

        <AddUserDialog />
      </div>
      <Separator className="my-6" />
      {error ? (
        <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      ) : (
        <DataTable columns={columns} data={(users || []) as User[]} />
      )}
    </div>
  )
}