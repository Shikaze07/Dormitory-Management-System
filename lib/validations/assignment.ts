import { z } from "zod"

export const assignmentSchema = z.object({
  user_id: z.string().min(1, "Resident is required"),
  room_id: z.number().min(1, "Room is required"),
})

export type AssignmentFormValues = z.infer<typeof assignmentSchema>
