"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/server-auth"

function fmtWhen(d) {
  return new Date(d).toLocaleString("en-PH", { timeZone: "Asia/Manila" })
}

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

      const lastLog = await prisma.accessLog.findFirst({
        where: { user_id: user.id },
        orderBy: { timestamp: "desc" },
      })
      const userName = `${user.first_name} ${user.last_name}`
      if (accessType === "CheckOut" && lastLog?.access_type !== "CheckIn") {
        return { error: lastLog ? `${userName} has already checked out on ${fmtWhen(lastLog.timestamp)}.` : "Cannot check out. Resident has not checked in yet.", alreadyScanned: !!lastLog }
      }
      if (accessType === "CheckIn" && lastLog?.access_type === "CheckIn") {
        return { error: `${userName} is already checked in since ${fmtWhen(lastLog.timestamp)} and has not checked out yet.`, alreadyScanned: true }
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

      const visitorName = `${visitor.first_name} ${visitor.last_name}`
      const lastVisitorLog = await prisma.accessLog.findFirst({
        where: { visitor_id: visitor.id },
        orderBy: { timestamp: "desc" },
      })
      if (accessType === "CheckOut") {
        if (lastVisitorLog?.access_type === "CheckOut") {
          return { error: `${visitorName} has already checked out on ${fmtWhen(lastVisitorLog.timestamp)}. This visitor pass can no longer be used.`, alreadyScanned: true }
        }
        if (!lastVisitorLog) {
          return { error: "Cannot check out. Visitor has not checked in yet." }
        }
      } else if (lastVisitorLog) {
        return {
          error: lastVisitorLog.access_type === "CheckIn"
            ? `${visitorName} is already checked in since ${fmtWhen(lastVisitorLog.timestamp)} and has not checked out yet.`
            : `${visitorName} has already checked out on ${fmtWhen(lastVisitorLog.timestamp)}. This visitor pass can no longer be used.`,
          alreadyScanned: true,
        }
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
          validUntil: visitor.qr_expires_at,
          remainingSeconds: Math.max(0, Math.floor((new Date(visitor.qr_expires_at).getTime() - Date.now()) / 1000)),
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
