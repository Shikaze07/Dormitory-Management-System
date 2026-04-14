"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { roomSchema } from "@/lib/validations/room"

export async function getRooms() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        _count: {
          select: {
            assignments: {
              where: { is_active: true }
            }
          }
        }
      },
      orderBy: { room_number: "asc" },
    })
    const formattedRooms = rooms.map(room => ({
      ...room,
      occupancy: room._count.assignments
    }))
    return { rooms: formattedRooms }
  } catch (error) {
    console.error("Failed to fetch rooms:", error)
    return { error: "Failed to fetch rooms" }
  }
}

export async function createRoom(data) {
  const validatedFields = roomSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }
  const roomData = validatedFields.data
  try {
    const existingRoom = await prisma.room.findUnique({
      where: { room_number: roomData.room_number },
    })
    if (existingRoom) {
      return { error: "Room number already exists" }
    }
    const room = await prisma.room.create({
      data: {
        room_number: roomData.room_number,
        capacity: roomData.capacity,
        status: roomData.status,
      },
    })
    revalidatePath("/admin/dormitory")
    return { success: true, room }
  } catch (error) {
    console.error("Failed to create room:", error)
    return { error: "Failed to create room. Please try again." }
  }
}

export async function updateRoom(id, data) {
  const validatedFields = roomSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }
  const roomData = validatedFields.data
  try {
    // Get current active assignments for this room
    const activeAssignments = await prisma.roomAssignment.count({
      where: { room_id: id, is_active: true }
    })

    // Determine new status based on new capacity and active assignments
    let newStatus = "Available"
    if (activeAssignments >= roomData.capacity) {
      newStatus = "Full"
    } else if (activeAssignments > 0) {
      newStatus = "Occupied"
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        room_number: roomData.room_number,
        capacity: roomData.capacity,
        status: newStatus,
      },
    })
    revalidatePath("/admin/dormitory")
    return { success: true, room }
  } catch (error) {
    console.error("Failed to update room:", error)
    return { error: "Failed to update room. Please try again." }
  }
}

export async function deleteRoom(id) {
  try {
    const activeAssignments = await prisma.roomAssignment.count({
      where: { room_id: id, is_active: true }
    })
    if (activeAssignments > 0) {
      return { error: "Cannot delete room with active residents. Please vacate them first." }
    }
    await prisma.room.delete({
      where: { id },
    })
    revalidatePath("/admin/dormitory")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete room:", error)
    return { error: "Failed to delete room. Please try again." }
  }
}


