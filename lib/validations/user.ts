import { z } from "zod"

const dobSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" })
  .refine((val) => new Date(val) <= new Date(), { message: "Date of birth cannot be in the future" })
  .refine((val) => new Date(val).getFullYear() >= 1900, { message: "Date of birth is too far in the past" })

export const userSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  dob: dobSchema,
  gender: z.enum(["Male", "Female"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email (e.g. name@gmail.com)"),
  phone: z.string().min(1, "Phone is required").regex(/^09[0-9]{9}$/, "Phone must be 11 digits and start with 09 (e.g. 09123456789)"),
  address: z.string().min(5, "Address is required (min 5 characters)"),
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
  dob: dobSchema,
  gender: z.enum(["Male", "Female"]),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email (e.g. name@gmail.com)"),
  phone: z.string().min(1, "Phone is required").regex(/^09[0-9]{9}$/, "Phone must be 11 digits and start with 09 (e.g. 09123456789)"),
  address: z.string().min(5, "Address is required (min 5 characters)"),
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


