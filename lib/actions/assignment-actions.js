"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { assignmentSchema } from "../validations/assignment"

export async function getAssignments() {
  try {
    const assignments = await prisma.roomAssignment.findMany({
      include: {
        user: true,
        room: true,
      },
      orderBy: {
        assigned_at: "desc",
      },
    })
    return { assignments, success: true }
  } catch (error) {
    console.error("Failed to fetch assignments:", error)
    return { error: "Failed to fetch assignments", success: false }
  }
}

export async function getAvailableResidents() {
  try {
    const residents = await prisma.user.findMany({
      where: {
        role: "Resident",
        room_assignment: {
          none: {
            is_active: true,
          },
        },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        photo: true,
        username: true,
      },
    })
    return { residents, success: true }
  } catch (error) {
    console.error("Failed to fetch available residents:", error)
    return { error: "Failed to fetch available residents", success: false }
  }
}

export async function getAvailableRooms() {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: {
          notIn: ["Maintenance", "Unavailable"],
        },
      },
      include: {
        _count: {
          select: {
            assignments: {
              where: { is_active: true },
            },
          },
        },
      },
    })
    const availableRooms = rooms.filter(
      (room) => room.capacity > room._count.assignments
    )
    return { rooms: availableRooms, success: true }
  } catch (error) {
    console.error("Failed to fetch available rooms:", error)
    return { error: "Failed to fetch available rooms", success: false }
  }
}

export async function createAssignment(data) {
  try {
    const validatedData = assignmentSchema.parse(data)
    const room = await prisma.room.findUnique({
      where: { id: validatedData.room_id },
      include: {
        _count: {
          select: {
            assignments: {
              where: { is_active: true },
            },
          },
        },
      },
    })
    if (!room) return { error: "Room not found", success: false }
    if (room._count.assignments >= room.capacity) {
      return { error: "Room is already full", success: false }
    }
    const assignment = await prisma.roomAssignment.create({
      data: {
        user_id: validatedData.user_id,
        room_id: validatedData.room_id,
        is_active: true,
      },
    })
    const newOccupancy = room._count.assignments + 1
    let newStatus = room.status
    if (newOccupancy >= room.capacity) {
      newStatus = "Full"
    } else if (newOccupancy > 0) {
      newStatus = "Occupied"
    }
    if (newStatus !== room.status) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: newStatus },
      })
    }
    revalidatePath("/admin/room-assignment")
    revalidatePath("/admin/dormitory")
    return { assignment, success: true }
  } catch (error) {
    console.error("Failed to create assignment:", error)
    return { error: "Failed to create assignment", success: false }
  }
}

export async function vacateResident(assignmentId) {
  try {
    const assignment = await prisma.roomAssignment.findUnique({
      where: { id: assignmentId },
      include: { room: true },
    })
    if (!assignment) return { error: "Assignment not found", success: false }
    await prisma.roomAssignment.update({
      where: { id: assignmentId },
      data: {
        is_active: false,
        vacated_at: new Date(),
      },
    })
    const room = await prisma.room.findUnique({
      where: { id: assignment.room_id },
      include: {
        _count: {
          select: {
            assignments: {
              where: { is_active: true },
            },
          },
        },
      },
    })
    if (room) {
      const activeCount = room._count.assignments
      let newStatus = "Available"
      if (activeCount >= room.capacity) {
        newStatus = "Full"
      } else if (activeCount > 0) {
        newStatus = "Occupied"
      }
      await prisma.room.update({
        where: { id: room.id },
        data: { status: newStatus },
      })
    }
    revalidatePath("/admin/room-assignment")
    revalidatePath("/admin/dormitory")
    return { success: true }
  } catch (error) {
    console.error("Failed to vacate resident:", error)
    return { error: "Failed to vacate resident", success: false }
  }
}

export async function deleteAssignment(id) {
  try {
    const assignment = await prisma.roomAssignment.findUnique({
      where: { id },
    })
    if (!assignment) return { error: "Assignment not found", success: false }
    await prisma.roomAssignment.delete({
      where: { id },
    })
    if (assignment.is_active) {
      const room = await prisma.room.findUnique({
        where: { id: assignment.room_id },
        include: {
          _count: {
            select: {
              assignments: {
                where: { is_active: true },
              },
            },
          },
        },
      })
      if (room) {
        const activeCount = room._count.assignments
        let newStatus = "Available"
        if (activeCount >= room.capacity) {
          newStatus = "Full"
        } else if (activeCount > 0) {
          newStatus = "Occupied"
        }
        await prisma.room.update({
          where: { id: room.id },
          data: { status: newStatus },
        })
      }
    }
    revalidatePath("/admin/room-assignment")
    revalidatePath("/admin/dormitory")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete assignment:", error)
    return { error: "Failed to delete assignment", success: false }
  }
}


