"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserSchema, UpdateUserFormValues } from "@/lib/validations/user"
import { updateUser } from "@/lib/actions/user-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Upload, X, Eye, EyeOff } from "lucide-react"
import { User } from "../columns"

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(user.photo || null)
  const [isUploading, setIsUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: user.first_name,
      middle_name: user.middle_name || "",
      last_name: user.last_name,
      dob: new Date(user.dob).toISOString().split("T")[0],
      gender: user.gender,
      username: user.username,
      role: user.role,
      photo: user.photo || "",
      password: "", // Password remains empty unless changed
      confirm_password: "",
    },
  })

  // Reset form when user or open changes
  useEffect(() => {
    if (open) {
      reset({
        first_name: user.first_name,
        middle_name: user.middle_name || "",
        last_name: user.last_name,
        dob: new Date(user.dob).toISOString().split("T")[0],
        gender: user.gender,
        username: user.username,
        role: user.role,
        photo: user.photo || "",
        password: "",
        confirm_password: "",
      })
      setImagePreview(user.photo || null)
    }
  }, [user, open, reset])

  const onSubmit = async (data: UpdateUserFormValues) => {
    setLoading(true)
    try {
      const result = await updateUser(user.id, data)
      if (result.success) {
        toast.success("User updated successfully")
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue("photo", "")
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    try {
      setIsUploading(true)
      const uploadData = new FormData()
      uploadData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })

      const data = await res.json()
      if (res.ok) {
        setValue("photo", data.url)
        toast.success("Image uploaded successfully")
      } else {
        toast.error(data.error || "Image upload failed")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("An error occurred during image upload")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Leave password empty to keep current password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex flex-col gap-4">
              {imagePreview ? (
                <div className="relative h-24 w-24">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full rounded-md object-cover border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed hover:bg-muted/50 transition-colors relative">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.photo && <p className="text-xs text-destructive">{errors.photo.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...register("first_name")} placeholder="John" />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...register("last_name")} placeholder="Doe" />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
              {errors.dob && <p className="text-xs text-destructive">{errors.dob.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue={user.gender} onValueChange={(val) => setValue("gender", val as "Male" | "Female")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} placeholder="johndoe" />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (Optional)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirm_password")}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select defaultValue={user.role} onValueChange={(val) => setValue("role", val as "Admin" | "Guard" | "Resident")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resident">Resident</SelectItem>
                <SelectItem value="Guard">Guard</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || isUploading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
