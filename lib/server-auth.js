import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { encrypt, decrypt } from "./session"

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function updateSession(request) {
  const session = request.cookies.get("session")?.value
  if (!session) return
  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + 10 * 1000)
  const res = NextResponse.next()
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  })
  return res
}

export { encrypt, decrypt }
