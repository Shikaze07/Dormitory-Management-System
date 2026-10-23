"use server"

import { cookies } from "next/headers"
import { encrypt } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { toast } from "sonner"

export async function login(formData) {
  const username = formData.get("username")
  const password = formData.get("password")
  if (!username || !password) {
    return { error: "Username and password are required" }
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    })
    if (!user) {
      return { error: "Invalid credentials" }
    }
    if (!user.is_active) {
      return { error: "Account is deactivated. Please contact administrator." }
    }
    if (user.role === "Guard") {
      return { error: "Guard accounts must use the mobile application." }
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { error: "Invalid credentials" }
    }
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000)
    const session = await encrypt({ 
      userId: user.id, 
      role: user.role, 
      username: user.username,
      expires 
    })
    const cookieStore = await cookies()
    cookieStore.set("session", session, { expires, httpOnly: true })
    let redirectTo = "/dashboard"
    if (user.role === "Admin") {
      redirectTo = "/admin/user-management"
    } else if (user.role === "Resident") {
      redirectTo = "/resident/profile"
    } else if (user.role === "Guard") {
      redirectTo = "/guard/scan"
    }
    return { success: true, redirectTo }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}


