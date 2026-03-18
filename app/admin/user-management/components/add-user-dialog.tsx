"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema, UserFormValues } from "@/lib/validations/user"
import { createUser } from "@/lib/actions/user-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Loader2, UserPlus, QrCode, Upload, X, Eye, EyeOff } from "lucide-react"
import QRCode from "qrcode"

export function AddUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [newUserName, setNewUserName] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "Resident",
      gender: "Male",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true)
    try {
      const result = await createUser(data)
      if (result.success) {
        toast.success("User created successfully")
        const qrUrl = await QRCode.toDataURL(result.user?.qr_code || "")
        setQrCodeDataUrl(qrUrl)
        setNewUserName(`${data.first_name} ${data.last_name}`)
        reset()
      } else {
        toast.error(result.error || "Failed to create user")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setQrCodeDataUrl(null)
    setImagePreview(null)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {qrCodeDataUrl ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <DialogHeader>
              <DialogTitle>User Created Successfully!</DialogTitle>
              <DialogDescription>
                QR Code for <strong>{newUserName}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-white p-4">
              <img src={qrCodeDataUrl} alt="User QR Code" className="h-48 w-48" />
            </div>
            <p className="text-sm text-muted-foreground">
              Please save or print this QR code for the user.
            </p>
            <Button onClick={handleClose} variant="secondary" className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and generate their unique QR code.
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
                  <Select onValueChange={(val) => setValue("gender", val as "Male" | "Female")}>
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
                <Label htmlFor="password">Password</Label>
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
                <Select onValueChange={(val) => setValue("role", val as "Admin" | "Guard" | "Resident")}>
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
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
