"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserSchema } from "@/lib/validations/user"
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
import { Loader2, Upload, X, Eye, EyeOff, Info, User as UserIcon } from "lucide-react"

export function EditUserDialog({ user, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(user.photo || null)
  const [isUploading, setIsUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
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

  const onSubmit = async (data) => {
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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
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
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <UserIcon className="h-5 w-5" />
            <DialogTitle>Edit User Profile</DialogTitle>
          </div>
          <DialogDescription>
            Update user information and account settings. Leave password empty to keep current.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-0 max-h-[60vh]">
          <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Upload className="h-3 w-3" />
                Profile Photo
              </Label>
              <div className="flex flex-col gap-4">
                {imagePreview ? (
                   <div className="relative h-24 w-24 mx-auto sm:mx-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full rounded-xl object-cover border-2 border-muted shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-transform hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all relative group mx-auto sm:mx-0">
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.photo && <p className="text-xs font-medium text-destructive mt-1">{errors.photo.message}</p>}
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <Info className="h-3 w-3" />
                Personal Information
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" {...register("first_name")} placeholder="John" className="bg-background/50" />
                  {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" {...register("last_name")} placeholder="Doe" className="bg-background/50" />
                  {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" {...register("dob")} className="bg-background/50" />
                  {errors.dob && <p className="text-xs text-destructive">{errors.dob.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select defaultValue={user.gender} onValueChange={(val) => setValue("gender", val)}>
                    <SelectTrigger className="bg-background/50">
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
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <UserIcon className="h-3 w-3" />
                Account Settings
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...register("username")} placeholder="johndoe" className="bg-background/50" />
                  {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={user.role} onValueChange={(val) => setValue("role", val)}>
                    <SelectTrigger className="bg-background/50">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button
            type="submit"
            form="edit-user-form"
            disabled={loading || isUploading}
            className="w-full sm:w-auto min-w-[140px] shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update User Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
