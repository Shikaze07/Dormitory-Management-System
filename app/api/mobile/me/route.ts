import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        room_assignment: {
          where: { is_active: true },
          include: { room: true },
        },
      },
    })

    if (!user) return jsonError("User not found", 404)

    const roomNumber = user.room_assignment[0]?.room?.room_number ?? null

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        username: user.username,
        role: user.role,
        qr_code: user.qr_code,
        room: roomNumber,
      },
    })
  } catch (error) {
    console.error("Failed to fetch mobile profile:", error)
    return jsonError("Failed to fetch profile", 500)
  }
}
