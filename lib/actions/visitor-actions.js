"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/server-auth"
import { visitorRequestSchema } from "@/lib/validations/visitor"
import { randomUUID } from "crypto"

export async function createVisitorRequest(data) {
  const session = await getSession()
  if (!session || !session.userId) {
    return { error: "Not authenticated" }
  }
  const validatedFields = visitorRequestSchema.safeParse(data)
  if (!validatedFields.success) {
    return { 
      error: "Invalid fields", 
      details: validatedFields.error.flatten().fieldErrors 
    }
  }
  const { first_name, middle_name, last_name, gender, purpose, expected_at } = validatedFields.data
  try {
    const qrCodeToken = `VISIT-${randomUUID()}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const result = await prisma.$transaction(async (tx) => {
      const visitor = await tx.visitor.create({
        data: {
          first_name,
          middle_name: middle_name || null,
          last_name,
          gender,
          qr_code: qrCodeToken,
          qr_expires_at: expiresAt,
        }
      })
      const request = await tx.visitorRequest.create({
        data: {
          resident_id: session.userId,
          visitor_id: visitor.id,
          purpose,
          expected_at: new Date(expected_at),
          status: "Pending",
        }
      })
      return { visitor, request }
    })
    revalidatePath("/resident/visitor-requests")
    return { success: true, result }
  } catch (error) {
    console.error("Failed to create visitor request:", error)
    return { error: "Failed to create visitor request. Please try again." }
  }
}

export async function getVisitorRequests() {
  const session = await getSession()
  if (!session || !session.userId) {
    return { error: "Not authenticated" }
  }
  try {
    const requests = await prisma.visitorRequest.findMany({
      where: { resident_id: session.userId },
      include: { visitor: true },
      orderBy: { created_at: "desc" },
    })
    return { requests }
  } catch (error) {
    console.error("Failed to fetch visitor requests:", error)
    return { error: "Failed to fetch visitor requests" }
  }
}

export async function cancelVisitorRequest(requestId) {
  const session = await getSession()
  if (!session || !session.userId) {
    return { error: "Not authenticated" }
  }
  try {
    const request = await prisma.visitorRequest.update({
      where: { 
        id: requestId,
        resident_id: session.userId
      },
      data: { status: "Cancelled" },
    })
    revalidatePath("/resident/visitor-requests")
    return { success: true, request }
  } catch (error) {
    console.error("Failed to cancel visitor request:", error)
    return { error: "Failed to cancel visitor request" }
  }
}


