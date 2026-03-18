import { columns, User } from "./columns"
import { DataTable } from "./data-table"
import { AddUserDialog } from "./components/add-user-dialog"
import { getUsers } from "@/lib/actions/user-actions"
import { Separator } from "@/components/ui/separator"

export default async function UserManagementPage() {
  const { users, error } = await getUsers()

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
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