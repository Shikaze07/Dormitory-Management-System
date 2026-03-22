"use server"

import { cookies } from "next/headers"
import { encrypt } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username },
    })


    if (!user) {
      return { error: "Invalid credentials" }
    }

    if (!user.is_active) {
      return { error: "Account is deactivated. Please contact administrator." }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: "Invalid credentials" }
    }

    // Create session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    const session = await encrypt({ 
      userId: user.id, 
      role: user.role, 
      username: user.username,
      expires 
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("session", session, { expires, httpOnly: true })

    // Return success and redirect path
    let redirectTo = "/dashboard"
    if (user.role === "Admin") {
      redirectTo = "/admin/user-management"
    } else if (user.role === "Resident") {
      redirectTo = "/resident/profile"
    }
    
    return { success: true, redirectTo }
  } catch (error: any) {
    console.error("Login error:", error)
    return { error: "Something went wrong. Please try again." }
  }

}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}
