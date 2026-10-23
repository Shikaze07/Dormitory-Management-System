import { SignJWT, jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

const secret = process.env.BETTER_AUTH_SECRET || "dormitory-management-system-secret-key-fallback-2026"
const key = new TextEncoder().encode(secret)

export type MobileSession = { userId: string; role: string; username: string }

export async function signMobileToken(payload: MobileSession) {
  return await new SignJWT({ ...payload, mobile: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)
}

/** Reads and verifies the `Authorization: Bearer <token>` header. */
export async function getMobileSession(req: NextRequest): Promise<MobileSession | null> {
  const header = req.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] })
    if (!payload.userId || !payload.role) return null
    return payload as unknown as MobileSession
  } catch {
    return null
  }
}

export const jsonError = (error: string, status = 400) =>
  NextResponse.json({ error }, { status })
