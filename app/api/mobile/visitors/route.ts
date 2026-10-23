import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)

  const requests = await prisma.visitorRequest.findMany({
    where: { resident_id: session.userId },
    include: { visitor: true },
    orderBy: { created_at: "desc" },
  })
  return NextResponse.json({
    requests: requests.map((r) => ({
      id: r.id,
      name: `${r.visitor.first_name} ${r.visitor.last_name}`,
      purpose: r.purpose,
      expected_at: r.expected_at,
      status: r.status,
      qr_code: r.visitor.qr_code,
      qr_expires_at: r.visitor.qr_expires_at,
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)
  if (session.role !== "Resident") return jsonError("Only residents can invite visitors.", 403)

  const b = await req.json().catch(() => ({}))
  const first = String(b.first_name || "").trim()
  const middle = String(b.middle_name || "").trim()
  const last = String(b.last_name || "").trim()
  const gender = b.gender === "Female" ? "Female" : "Male"
  const expected = new Date(b.expected_at)
  if (!first || !last) return jsonError("First and last name are required.")
  if (isNaN(expected.getTime())) return jsonError("Invalid expected date.")

  try {
    await prisma.$transaction(async (tx) => {
      const visitor = await tx.visitor.create({
        data: {
          first_name: first,
          middle_name: middle || null,
          last_name: last,
          gender,
          qr_code: `VISIT-${randomUUID()}`,
          qr_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      await tx.visitorRequest.create({
        data: {
          resident_id: session.userId,
          visitor_id: visitor.id,
          purpose: String(b.purpose || "").trim() || null,
          expected_at: expected,
          status: "Pending",
        },
      })
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Mobile visitor create error:", e)
    return jsonError("Failed to create visitor request.", 500)
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session) return jsonError("Not authenticated", 401)
  const id = Number(req.nextUrl.searchParams.get("id"))
  if (!id) return jsonError("Missing id.")
  try {
    await prisma.visitorRequest.update({
      where: { id, resident_id: session.userId },
      data: { status: "Cancelled" },
    })
    return NextResponse.json({ success: true })
  } catch {
    return jsonError("Failed to cancel request.", 500)
  }
}
