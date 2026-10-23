import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)

  let where: any = {}
  if (session.role === "Resident") {
    where = { user_id: session.userId }
  } else if (session.role === "Guard") {
    // Guards only see logs for today (from midnight onward)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    where = {
      timestamp: {
        gte: startOfToday,
      },
    }
  }

  const logs = await prisma.accessLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 100,
    include: {
      user: { select: { first_name: true, last_name: true, role: true } },
      visitor: { select: { first_name: true, last_name: true } },
    },
  })

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      access_type: l.access_type,
      timestamp: l.timestamp,
      person: l.user
        ? `${l.user.first_name} ${l.user.last_name}`
        : l.visitor
        ? `${l.visitor.first_name} ${l.visitor.last_name}`
        : "Unknown",
      category: l.user ? l.user.role : "Visitor",
    })),
  })
}
