import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"
import { distanceMeters } from "@/lib/geo"

function alreadyScanned(
  visitor: { first_name: string; last_name: string; photo?: string | null },
  previousType: string,
  at: Date
) {
  const when = new Date(at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })
  const action = previousType === "CheckOut" ? "checked out" : "checked in"
  return NextResponse.json(
    {
      error: `ALREADY SCANNED: ${visitor.first_name} ${visitor.last_name} was already ${action} on ${when}.`,
      alreadyScanned: true,
      name: `${visitor.first_name} ${visitor.last_name}`,
      photo: visitor.photo ?? null,
      previousType,
      scannedAt: at,
    },
    { status: 409 }
  )
}

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)
  if (session.role !== "Guard" && session.role !== "Admin") return jsonError("Not authorized", 403)

  const body = await req.json().catch(() => ({}))
  const token = String(body.token || "").trim()
  const accessType = body.accessType === "CheckOut" ? "CheckOut" : "CheckIn"
  const mode = body.mode === "preview" ? "preview" : body.mode === "reject" ? "reject" : "record"
  if (!token) return jsonError("QR code is required.")

  // Guards may only scan inside the dorm area configured by the admin.
  if (session.role === "Guard") {
    const area = await prisma.dormLocation.findUnique({ where: { id: 1 } })
    if (area) {
      const lat = Number(body.latitude)
      const lng = Number(body.longitude)
      if (body.latitude == null || body.longitude == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return jsonError("Location unavailable. Turn on GPS and allow location access to scan.", 403)
      }
      const dist = Math.round(distanceMeters(lat, lng, area.latitude, area.longitude))
      // Allow for GPS error, but never more than 50 m of slack.
      const acc = Number(body.accuracy)
      const slack = Number.isFinite(acc) && acc > 0 ? Math.min(acc, 50) : 0
      if (dist - slack > area.radius_meters) {
        return jsonError(
          `You are outside the dorm area (${dist.toLocaleString()} m away, allowed ${area.radius_meters.toLocaleString()} m). Move inside the area to scan.`,
          403
        )
      }
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { qr_code: token },
      include: { room_assignment: { where: { is_active: true }, include: { room: true } } },
    })
    if (user) {
      if (!user.is_active) return jsonError("User account is deactivated.")

      if (accessType === "CheckOut") {
        const lastLog = await prisma.accessLog.findFirst({
          where: { user_id: user.id },
          orderBy: { timestamp: "desc" },
        })
        if (!lastLog || lastLog.access_type !== "CheckIn") {
          return jsonError("Cannot check out. Resident has not checked in yet.", 400)
        }
      }

      const log = await prisma.accessLog.create({
        data: { user_id: user.id, access_type: accessType, scanned_by_id: session.userId },
      })
      return NextResponse.json({
        success: true,
        type: "Resident",
        photo: user.photo ?? null,
        name: `${user.first_name} ${user.last_name}`,
        detail: `Room ${user.room_assignment[0]?.room?.room_number ?? "Unassigned"}`,
        accessType,
        timestamp: log.timestamp,
      })
    }

    const visitor = await prisma.visitor.findUnique({
      where: { qr_code: token },
      include: { visit_request: { include: { resident: true } } },
    })
    if (visitor) {
      if (new Date() > new Date(visitor.qr_expires_at)) return jsonError("Visitor pass has expired.")
      const status = visitor.visit_request?.status
      if (status === "Rejected" || status === "Cancelled") return jsonError(`Visit request was ${status.toLowerCase()}.`)

      const host = visitor.visit_request?.resident
      const hostAssignment = host
        ? await prisma.roomAssignment.findFirst({
            where: { user_id: host.id, is_active: true },
            include: { room: true },
          })
        : null
      const hostRoom = hostAssignment?.room?.room_number ?? null

      if (mode === "reject") {
        if (visitor.visit_request) {
          await prisma.visitorRequest.update({
            where: { id: visitor.visit_request.id },
            data: { status: "Rejected" },
          })
        }
        return NextResponse.json({
          success: true,
          rejected: true,
          type: "Visitor",
          name: `${visitor.first_name} ${visitor.last_name}`,
        })
      }

      const lastVisitorLog = await prisma.accessLog.findFirst({
        where: { visitor_id: visitor.id },
        orderBy: { timestamp: "desc" },
      })

      if (accessType === "CheckOut") {
        if (!lastVisitorLog || lastVisitorLog.access_type !== "CheckIn") {
          if (lastVisitorLog?.access_type === "CheckOut") {
            return alreadyScanned(visitor, "CheckOut", lastVisitorLog.timestamp)
          }
          return jsonError("Cannot check out. Visitor has not checked in yet.", 400)
        }
      } else if (lastVisitorLog) {
        // Pass already used to check in (and possibly out) - do not allow another entry.
        return alreadyScanned(visitor, lastVisitorLog.access_type, lastVisitorLog.timestamp)
      }

      if (mode === "preview") {
        return NextResponse.json({
          success: true,
          preview: true,
          type: "Visitor",
          name: `${visitor.first_name} ${visitor.last_name}`,
          photo: visitor.photo ?? null,
          visiting: host ? `${host.first_name} ${host.last_name}` : null,
          host_room: hostRoom,
          purpose: visitor.visit_request?.purpose ?? null,
          visit_duration_seconds: visitor.visit_duration_seconds ?? null,
          expected_at: visitor.visit_request?.expected_at ?? null,
          accessType,
        })
      }

      const log = await prisma.accessLog.create({
        data: { visitor_id: visitor.id, access_type: accessType, scanned_by_id: session.userId },
      })
      if (visitor.visit_request && status === "Pending") {
        await prisma.visitorRequest.update({
          where: { id: visitor.visit_request.id },
          data: { status: "Approved" },
        })
      }
      return NextResponse.json({
        success: true,
        type: "Visitor",
        photo: visitor.photo ?? null,
        visiting: host ? `${host.first_name} ${host.last_name}` : null,
        host_room: hostRoom,
        purpose: visitor.visit_request?.purpose ?? null,
        visit_duration_seconds: visitor.visit_duration_seconds ?? null,
        name: `${visitor.first_name} ${visitor.last_name}`,
        detail: `Visiting ${host ? `${host.first_name} ${host.last_name}` : "N/A"} • ${
          visitor.visit_request?.purpose || "Personal Visit"
        }`,
        accessType,
        timestamp: log.timestamp,
      })
    }

    return jsonError("Invalid QR code: no matching resident or visitor.", 404)
  } catch (e) {
    console.error("Mobile scan error:", e)
    return jsonError("Failed to record access log.", 500)
  }
}
