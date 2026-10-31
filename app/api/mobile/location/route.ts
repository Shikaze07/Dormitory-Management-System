import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"

/** Returns the allowed scanning area (or null when unrestricted). */
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)
  const loc = await prisma.dormLocation.findUnique({ where: { id: 1 } })
  return NextResponse.json({
    location: loc
      ? { latitude: loc.latitude, longitude: loc.longitude, radius_meters: loc.radius_meters }
      : null,
  })
}
