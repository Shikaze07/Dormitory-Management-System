"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { userSchema } from "@/lib/validations/user"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import { getSession } from "@/lib/server-auth"

export async function createUser(data) {
  const validatedFields = userSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }
  const { password, confirm_password, ...userData } = validatedFields.data
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    })
    if (existingUser) {
      return { error: "Username already taken" }
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const qrCodeToken = `USER-${randomUUID()}`
    const user = await prisma.user.create({
      data: {
        first_name: userData.first_name,
        middle_name: userData.middle_name || null,
        last_name: userData.last_name,
        dob: new Date(userData.dob),
        gender: userData.gender,
        username: userData.username,
        password: hashedPassword,
        qr_code: qrCodeToken,
        role: userData.role,
        photo: userData.photo || null,
      },
    })
    revalidatePath("/admin/user-management")
    return { success: true, user }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { error: "Failed to create user. Please try again." }
  }
}

export async function updateUser(id, data) {
  try {
    const { password, confirm_password, ...userData } = data
    const updateData = {
      first_name: userData.first_name,
      middle_name: userData.middle_name || null,
      last_name: userData.last_name,
      dob: new Date(userData.dob),
      gender: userData.gender,
      username: userData.username,
      role: userData.role,
      photo: userData.photo || null,
    }
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })
    revalidatePath("/admin/user-management")
    return { success: true, user }
  } catch (error) {
    console.error("Failed to update user:", error)
    return { error: "Failed to update user. Please try again." }
  }
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({
      where: { id },
    })
    revalidatePath("/admin/user-management")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { error: "Failed to delete user. Please try again." }
  }
}

export async function toggleUserStatus(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { is_active: true }
    })
    if (!user) {
      return { error: "User not found" }
    }
    await prisma.user.update({
      where: { id },
      data: { is_active: !user.is_active }
    })
    revalidatePath("/admin/user-management")
    return { success: true }
  } catch (error) {
    console.error("Failed to toggle user status:", error)
    return { error: "Failed to update user status" }
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
    })
    return { users }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return { error: "Failed to fetch users" }
  }
}

export async function getResidentProfile() {
  try {
    const session = await getSession()
    if (!session || !session.userId) {
      return { error: "Not authenticated" }
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        room_assignment: {
          where: { is_active: true },
          include: { room: true }
        },
        visitor_requests: {
          take: 5,
          orderBy: { created_at: "desc" },
          include: { visitor: true }
        }
      }
    })
    if (!user) {
      return { error: "Resident not found" }
    }
    return { user }
  } catch (error) {
    console.error("Failed to fetch resident profile:", error)
    return { error: "Failed to fetch resident profile" }
  }
}


