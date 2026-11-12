import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import prisma from "@/lib/prisma"
import { getMobileSession, jsonError } from "@/lib/mobile-auth"
import { computeVisitWindow } from "@/lib/visitor-pass"

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
      name: [r.visitor.first_name, r.visitor.middle_name, r.visitor.last_name].filter(Boolean).join(" "),
      purpose: r.purpose,
      expected_at: r.expected_at,
      status: r.status,
      qr_code: r.visitor.qr_code,
      qr_expires_at: r.visitor.qr_expires_at,
      photo: r.visitor.photo,
      visit_duration_seconds: r.visitor.visit_duration_seconds,
      gender: r.visitor.gender,
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
  if (first.length < 2) return jsonError("First name must be at least 2 characters.")
  if (last.length < 2) return jsonError("Last name must be at least 2 characters.")
  if (isNaN(expected.getTime())) return jsonError("Invalid expected date.")
  const win = computeVisitWindow(String(b.expected_at), Number(b.tz_offset))
  if (!win || win.seconds <= 0) return jsonError("Today's visit window has already ended (passes expire at 11:59 PM). Please set the Expected Date of Visit to tomorrow or a later date.")
  const secs = win.seconds

  const purposeText = String(b.purpose || "").trim()
  if (purposeText.length < 5) return jsonError("Purpose must be at least 5 characters.")
  const photo = String(b.photo || "").trim()
  if (!photo) return jsonError("Visitor photo is required.")

  try {
    await prisma.$transaction(async (tx) => {
      const visitor = await tx.visitor.create({
        data: {
          first_name: first,
          middle_name: middle || null,
          last_name: last,
          gender,
          photo,
          visit_duration_seconds: secs,
          qr_code: `VISIT-${randomUUID()}`,
          qr_expires_at: win.expiresAt,
        },
      })
      await tx.visitorRequest.create({
        data: {
          resident_id: session.userId,
          visitor_id: visitor.id,
          purpose: purposeText,
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
