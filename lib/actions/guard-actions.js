"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/server-auth"

export async function getGuardAccessLogs() {
  const session = await getSession()
  if (!session || !session.userId || (session.role !== "Guard" && session.role !== "Admin")) {
    return { error: "Not authorized" }
  }

  try {
    const logs = await prisma.accessLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 500,
      include: {
        user: true,
        visitor: true,
        scanned_by: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
          },
        },
      },
    })
    return { logs }
  } catch (error) {
    console.error("Failed to fetch access logs:", error)
    return { error: "Failed to fetch access logs" }
  }
}

export async function scanQRCode(qrToken, accessType = "CheckIn") {
  const session = await getSession()
  if (!session || !session.userId || (session.role !== "Guard" && session.role !== "Admin")) {
    return { error: "Not authorized" }
  }

  const cleanToken = (qrToken || "").trim()
  if (!cleanToken) {
    return { error: "QR code or ID token is required." }
  }

  try {
    // 1. Try finding a Resident / User by QR code
    const user = await prisma.user.findUnique({
      where: { qr_code: cleanToken },
      include: {
        room_assignment: {
          where: { is_active: true },
          include: { room: true },
        },
      },
    })

    if (user) {
      if (!user.is_active) {
        return { error: "User account is deactivated." }
      }

      const log = await prisma.accessLog.create({
        data: {
          user_id: user.id,
          access_type: accessType,
          scanned_by_id: session.userId,
        },
        include: {
          user: true,
          scanned_by: true,
        },
      })

      revalidatePath("/guard/scan")
      revalidatePath("/guard/access-logs")
      return {
        success: true,
        type: "Resident",
        entity: {
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          username: user.username,
          room: user.room_assignment[0]?.room?.room_number || "Unassigned",
          photo: user.photo,
        },
        accessType,
        timestamp: log.timestamp,
      }
    }

    // 2. Try finding a Visitor by QR code
    const visitor = await prisma.visitor.findUnique({
      where: { qr_code: cleanToken },
      include: {
        visit_request: {
          include: {
            resident: true,
          },
        },
      },
    })

    if (visitor) {
      // Check QR expiration
      if (new Date() > new Date(visitor.qr_expires_at)) {
        return { error: "Visitor pass has expired." }
      }

      const log = await prisma.accessLog.create({
        data: {
          visitor_id: visitor.id,
          access_type: accessType,
          scanned_by_id: session.userId,
        },
        include: {
          visitor: true,
          scanned_by: true,
        },
      })

      // If approved or pending, update visit request status to Approved / Completed when checking in
      if (visitor.visit_request && visitor.visit_request.status === "Pending") {
        await prisma.visitorRequest.update({
          where: { id: visitor.visit_request.id },
          data: { status: "Approved" },
        })
      }

      revalidatePath("/guard/scan")
      revalidatePath("/guard/access-logs")
      return {
        success: true,
        type: "Visitor",
        entity: {
          name: `${visitor.first_name} ${visitor.last_name}`,
          gender: visitor.gender,
          purpose: visitor.visit_request?.purpose || "Personal Visit",
          hostResident: visitor.visit_request?.resident
            ? `${visitor.visit_request.resident.first_name} ${visitor.visit_request.resident.last_name}`
            : "N/A",
        },
        accessType,
        timestamp: log.timestamp,
      }
    }

    return { error: "Invalid QR code: No matching resident or visitor record found." }
  } catch (error) {
    console.error("Scan error:", error)
    return { error: "Failed to record access log. Please try again." }
  }
}
