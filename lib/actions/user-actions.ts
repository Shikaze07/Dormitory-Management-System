"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { userSchema, UserFormValues, UpdateUserFormValues } from "@/lib/validations/user"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

export async function createUser(data: UserFormValues) {
  const validatedFields = userSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password, confirm_password, ...userData } = validatedFields.data

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    })

    if (existingUser) {
      return { error: "Username already taken" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique QR code token
    const qrCodeToken = `USER-${randomUUID()}`

    // Create user in database
    const user = await prisma.user.create({
      data: {
        first_name: userData.first_name,
        middle_name: userData.middle_name || null,
        last_name: userData.last_name,
        dob: new Date(userData.dob),
        gender: userData.gender as any,
        username: userData.username,
        password: hashedPassword,
        qr_code: qrCodeToken,
        role: userData.role as any,
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

export async function updateUser(id: string, data: UpdateUserFormValues) {
  try {
    const { password, confirm_password, ...userData } = data

    // Prepare update data
    const updateData: any = {
      first_name: userData.first_name,
      middle_name: userData.middle_name || null,
      last_name: userData.last_name,
      dob: new Date(userData.dob),
      gender: userData.gender as any,
      username: userData.username,
      role: userData.role as any,
      photo: userData.photo || null,
    }

    // If password is provided, hash it
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

export async function deleteUser(id: string) {
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
