import { z } from "zod"

export const userSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),
  gender: z.enum(["Male", "Female"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string(),
  role: z.enum(["Admin", "Guard", "Resident"]),
  photo: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export const updateUserSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),
  gender: z.enum(["Male", "Female"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional()
    .or(z.literal("")),
  confirm_password: z.string().optional().or(z.literal("")),
  role: z.enum(["Admin", "Guard", "Resident"]),
  photo: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export type UserFormValues = z.infer<typeof userSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>


