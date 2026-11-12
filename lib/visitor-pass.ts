// Visitor QR passes always expire at 11:59 PM (resident's local time) on the
// expected visit date. The visit duration is derived from that, never entered.

const DEFAULT_TZ_OFFSET_MIN = -480 // Asia/Manila; same sign as Date#getTimezoneOffset()

export function computeVisitWindow(
  dateStr: string,
  tzOffsetMin: number = DEFAULT_TZ_OFFSET_MIN,
  nowMs: number = Date.now()
) {
  const [y, m, d] = String(dateStr).slice(0, 10).split("-").map(Number)
  if (!y || !m || !d) return null
  const offset = Number.isFinite(tzOffsetMin) ? tzOffsetMin : DEFAULT_TZ_OFFSET_MIN
  const dayStart = Date.UTC(y, m - 1, d, 0, 0, 0) + offset * 60000
  const end = Date.UTC(y, m - 1, d, 23, 59, 0) + offset * 60000
  const start = Math.max(nowMs, dayStart)
  const seconds = Math.floor((end - start) / 1000)
  return { expiresAt: new Date(end), seconds }
}

export function formatVisitDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(Math.floor(s / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m ${pad(s % 60)}s`
}
