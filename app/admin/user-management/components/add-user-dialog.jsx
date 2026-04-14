"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { userSchema } from "@/lib/validations/user"
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
import { Loader2, UserPlus, Upload, X, Eye, EyeOff, Info, User } from "lucide-react"
import QRCode from "qrcode"

export function AddUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null)
  const [newUserName, setNewUserName] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
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
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "Resident",
      gender: "Male",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = async (data) => {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 overflow-hidden">
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
              <div className="flex items-center gap-2 text-primary mb-1">
                <UserPlus className="h-5 w-5" />
                <DialogTitle>Add New User</DialogTitle>
              </div>
              <DialogDescription>
                Create a new user account and generate their unique QR code.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh] -mr-2">
              <form id="add-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                      <Select onValueChange={(val) => setValue("gender", val)}>
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
                    <User className="h-3 w-3" />
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
                      <Select defaultValue="Resident" onValueChange={(val) => setValue("role", val)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Resident" />
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
                    <Label htmlFor="password">Password</Label>
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

            <DialogFooter className="mt-2">
              <Button
                type="submit"
                form="add-user-form"
                disabled={loading || isUploading}
                className="w-full sm:w-auto min-w-[140px] shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User Account"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
