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
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  expected_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
    .refine((val) => val >= todayLocal(), { message: "Expected date cannot be in the past" }),
  tz_offset: z.number().optional(),
})

export type VisitorRequestFormValues = z.infer<typeof visitorRequestSchema>
