"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/server-auth"

const ACTIVITY_DAYS = 7

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function dayKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export async function getDashboardData() {
  const session = await getSession()
  if (!session || !session.userId || session.role !== "Admin") {
    return { error: "Not authorized" }
  }

  const today = startOfDay(new Date())
  const activityStart = new Date(today)
  activityStart.setDate(activityStart.getDate() - (ACTIVITY_DAYS - 1))

  try {
    const [
      usersByRole,
      rooms,
      activeAssignments,
      visitStatusCounts,
      activityLogs,
      latestResidentLogs,
      recentLogs,
      upcomingVisits,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ["role"],
        where: { is_active: true },
        _count: { _all: true },
      }),
      prisma.room.findMany({
        select: {
          id: true,
          capacity: true,
          status: true,
          _count: { select: { assignments: { where: { is_active: true } } } },
        },
      }),
      prisma.roomAssignment.count({ where: { is_active: true } }),
      prisma.visitorRequest.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.accessLog.findMany({
        where: { timestamp: { gte: activityStart } },
        select: { access_type: true, timestamp: true, visitor_id: true },
      }),
      // Latest scan per resident tells us who is currently inside the dorm
      prisma.accessLog.findMany({
        where: { user_id: { not: null } },
        orderBy: { timestamp: "desc" },
        distinct: ["user_id"],
        select: { user_id: true, access_type: true },
      }),
      prisma.accessLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 8,
        include: {
          user: { select: { first_name: true, last_name: true, role: true, photo: true } },
          visitor: { select: { first_name: true, last_name: true } },
          scanned_by: { select: { first_name: true, last_name: true } },
        },
      }),
      prisma.visitorRequest.findMany({
        where: { status: { in: ["Pending", "Approved"] }, expected_at: { gte: today } },
        orderBy: { expected_at: "asc" },
        take: 6,
        include: {
          resident: { select: { first_name: true, last_name: true } },
          visitor: { select: { first_name: true, last_name: true } },
        },
      }),
    ])

    const roleCount = (role) => usersByRole.find((r) => r.role === role)?._count._all ?? 0
    const residents = roleCount("Resident")

    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
    const roomStatus = ["Available", "Occupied", "Full", "Maintenance", "Unavailable"].map((status) => ({
      status,
      count: rooms.filter((r) => r.status === status).length,
    }))
    const bedsAvailable = rooms
      .filter((r) => r.status !== "Maintenance" && r.status !== "Unavailable")
      .reduce((sum, r) => sum + Math.max(r.capacity - r._count.assignments, 0), 0)

    const visitCount = (status) => visitStatusCounts.find((v) => v.status === status)?._count._all ?? 0

    const days = Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
      const d = new Date(activityStart)
      d.setDate(d.getDate() + i)
      return { date: dayKey(d), checkIns: 0, checkOuts: 0, visitors: 0 }
    })
    for (const log of activityLogs) {
      const day = days.find((d) => d.date === dayKey(log.timestamp))
      if (!day) continue
      if (log.access_type === "CheckIn") day.checkIns++
      else day.checkOuts++
      if (log.visitor_id && log.access_type === "CheckIn") day.visitors++
    }
    const todayStats = days[days.length - 1]

    return {
      stats: {
        residents,
        guards: roleCount("Guard"),
        unassignedResidents: Math.max(residents - activeAssignments, 0),
        totalRooms: rooms.length,
        totalCapacity,
        occupiedBeds: activeAssignments,
        bedsAvailable,
        occupancyRate: totalCapacity ? Math.round((activeAssignments / totalCapacity) * 100) : 0,
        residentsInside: latestResidentLogs.filter((l) => l.access_type === "CheckIn").length,
        todayCheckIns: todayStats.checkIns,
        todayCheckOuts: todayStats.checkOuts,
        todayVisitors: todayStats.visitors,
        pendingVisits: visitCount("Pending"),
        approvedVisits: visitCount("Approved"),
        completedVisits: visitCount("Completed"),
      },
      roomStatus,
      activity: days,
      recentLogs,
      upcomingVisits,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error)
    return { error: "Failed to load dashboard data" }
  }
}
