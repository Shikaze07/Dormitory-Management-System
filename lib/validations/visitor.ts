import { z } from "zod"

function todayLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const visitorRequestSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["Male", "Female"]),
  photo: z.string().min(1, "Visitor photo is required"),
  visit_hours: z.number({ message: "Hours is required" }).int().min(0, "Hours must be 0-24").max(24, "Hours must be 0-24"),
  visit_minutes: z.number({ message: "Minutes is required" }).int().min(0, "Minutes must be 0-59").max(59, "Minutes must be 0-59"),
  visit_seconds: z.number({ message: "Seconds is required" }).int().min(0, "Seconds must be 0-59").max(59, "Seconds must be 0-59"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  expected_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
    .refine((val) => val >= todayLocal(), { message: "Expected date cannot be in the past" }),
}).refine((d) => d.visit_hours * 3600 + d.visit_minutes * 60 + d.visit_seconds > 0, {
  message: "Visit duration must be greater than 0",
  path: ["visit_hours"],
}).refine((d) => d.visit_hours * 3600 + d.visit_minutes * 60 + d.visit_seconds <= 86400, {
  message: "Visit duration cannot exceed 24 hours",
  path: ["visit_hours"],
})

export type VisitorRequestFormValues = z.infer<typeof visitorRequestSchema>
