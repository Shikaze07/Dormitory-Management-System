import { z } from "zod"

export const visitorRequestSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["Male", "Female"]),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  expected_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
})

export type VisitorRequestFormValues = z.infer<typeof visitorRequestSchema>
