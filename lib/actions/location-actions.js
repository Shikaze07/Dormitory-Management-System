"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/server-auth"

export async function getDormLocation() {
  try {
    const location = await prisma.dormLocation.findUnique({ where: { id: 1 } })
    return { location }
  } catch (error) {
    console.error("Failed to fetch dorm location:", error)
    return { error: "Failed to fetch dorm location" }
  }
}

export async function saveDormLocation({ latitude, longitude, radius_meters }) {
  const session = await getSession()
  if (!session || session.role !== "Admin") {
    return { error: "Only admins can set the dorm location." }
  }
  const lat = Number(latitude)
  const lng = Number(longitude)
  const radius = Math.round(Number(radius_meters))
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { error: "Invalid latitude." }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return { error: "Invalid longitude." }
  if (!Number.isFinite(radius) || radius < 10 || radius > 50000) {
    return { error: "Radius must be between 10 m and 50 km." }
  }
  try {
    const location = await prisma.dormLocation.upsert({
      where: { id: 1 },
      update: { latitude: lat, longitude: lng, radius_meters: radius },
      create: { id: 1, latitude: lat, longitude: lng, radius_meters: radius },
    })
    revalidatePath("/admin/location")
    return { success: true, location }
  } catch (error) {
    console.error("Failed to save dorm location:", error)
    return { error: "Failed to save dorm location. Please try again." }
  }
}

export async function clearDormLocation() {
  const session = await getSession()
  if (!session || session.role !== "Admin") {
    return { error: "Only admins can change the dorm location." }
  }
  try {
    await prisma.dormLocation.deleteMany({ where: { id: 1 } })
    revalidatePath("/admin/location")
    return { success: true }
  } catch (error) {
    console.error("Failed to clear dorm location:", error)
    return { error: "Failed to remove dorm location." }
  }
}
