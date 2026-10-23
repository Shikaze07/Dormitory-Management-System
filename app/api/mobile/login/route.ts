import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signMobileToken, jsonError } from "@/lib/mobile-auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const username = String(body.username || "").trim()
  const password = String(body.password || "")
  if (!username || !password) return jsonError("Username and password are required")

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { room_assignment: { where: { is_active: true }, include: { room: true } } },
    })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return jsonError("Incorrect username or password", 401)
    }
    if (!user.is_active) return jsonError("Account is deactivated. Contact the administrator.", 403)
    if (user.role === "Admin") return jsonError("Admins must use the web portal.", 403)

    const token = await signMobileToken({ userId: user.id, role: user.role, username: user.username })
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        username: user.username,
        role: user.role,
        qr_code: user.qr_code,
        room: user.room_assignment[0]?.room?.room_number ?? null,
      },
    })
  } catch (e) {
    console.error("Mobile login error:", e)
    return jsonError("Something went wrong. Please try again.", 500)
  }
}
