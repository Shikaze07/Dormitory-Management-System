import { z } from "zod"

export const roomSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  status: z.enum(["Available", "Occupied", "Full", "Unavailable", "Maintenance"]),
})

export type RoomFormValues = z.infer<typeof roomSchema>
