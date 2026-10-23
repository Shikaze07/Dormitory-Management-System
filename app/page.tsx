import { redirect } from "next/navigation"
import { getSession } from "@/lib/server-auth"

export default async function Page() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (session.role === "Admin") {
    redirect("/admin/user-management")
  } else if (session.role === "Resident") {
    redirect("/resident/profile")
  }

  redirect("/login")
}

