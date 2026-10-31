import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)

  const where: any = {}
  if (session.role === "Resident") {
    where.user_id = session.userId
  }

  // Optional date range (ISO timestamps) so guards can look back at any day.
  const from = req.nextUrl.searchParams.get("from")
  const to = req.nextUrl.searchParams.get("to")
  const range: any = {}
  if (from && !isNaN(Date.parse(from))) range.gte = new Date(from)
  if (to && !isNaN(Date.parse(to))) range.lte = new Date(to)
  if (Object.keys(range).length) where.timestamp = range

  const logs = await prisma.accessLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 500,
    include: {
      user: { select: { first_name: true, last_name: true, role: true, photo: true } },
      visitor: {
        select: {
          first_name: true,
          last_name: true,
          photo: true,
          visit_duration_seconds: true,
          visit_request: {
            select: {
              purpose: true,
              resident: { select: { first_name: true, last_name: true } },
            },
          },
        },
      },
    },
  })

  return NextResponse.json({
    logs: logs.map((l) => {
      const host = l.visitor?.visit_request?.resident
      return {
        id: l.id,
        access_type: l.access_type,
        timestamp: l.timestamp,
        person: l.user
          ? `${l.user.first_name} ${l.user.last_name}`
          : l.visitor
          ? `${l.visitor.first_name} ${l.visitor.last_name}`
          : "Unknown",
        category: l.user ? l.user.role : "Visitor",
        photo: l.user?.photo ?? l.visitor?.photo ?? null,
        visiting: host ? `${host.first_name} ${host.last_name}` : null,
        purpose: l.visitor?.visit_request?.purpose ?? null,
        visit_duration_seconds: l.visitor?.visit_duration_seconds ?? null,
      }
    }),
  })
}
