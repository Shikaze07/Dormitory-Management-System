"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Loader2, Info, UserPlus, Upload, X } from "lucide-react"
import { toast } from "sonner"

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
import { Textarea } from "@/components/ui/textarea"
import { visitorRequestSchema, VisitorRequestFormValues } from "@/lib/validations/visitor"
import { createVisitorRequest } from "@/lib/actions/visitor-actions"

function todayLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function AddVisitorDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VisitorRequestFormValues>({
    resolver: zodResolver(visitorRequestSchema),
    defaultValues: {
      photo: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "Male",
      purpose: "",
      expected_at: todayLocal(),
      visit_hours: 1,
      visit_minutes: 0,
      visit_seconds: 0,
    },
  })

  async function onSubmit(data: VisitorRequestFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createVisitorRequest(data)
      if (result.success) {
        toast.success("Visitor request registered successfully")
        setOpen(false)
        reset()
        setImagePreview(null)
      } else {
        toast.error(result.error || "Failed to register visitor")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
    try {
      setIsUploading(true)
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (res.ok) {
        setValue("photo", json.url, { shouldValidate: true })
        toast.success("Image uploaded successfully")
      } else {
        toast.error(json.error || "Image upload failed")
        setImagePreview(null)
      }
    } catch {
      toast.error("Image upload failed")
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue("photo", "", { shouldValidate: true })
  }

  const durationError =
    errors.visit_hours?.message || errors.visit_minutes?.message || errors.visit_seconds?.message

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Register Visitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <UserPlus className="h-5 w-5" />
            <DialogTitle>Register New Visitor</DialogTitle>
          </div>
          <DialogDescription>
            Fill in the details below to register a visitor and generate their access QR code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-2 pr-2 max-h-[60vh] -mr-2">
        <form id="add-visitor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
              <Upload className="h-3 w-3" />
              Visitor Photo
            </Label>
            {imagePreview ? (
              <div className="relative h-24 w-24 mx-auto sm:mx-0">
                <img src={imagePreview} alt="Preview" className="h-full w-full rounded-xl object-cover border-2 border-muted shadow-sm" />
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
            {errors.photo && <p className="text-xs font-medium text-destructive mt-1">{errors.photo.message}</p>}
          </div>

          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Info className="h-3 w-3" />
            Visitor Information
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                placeholder="Juan"
                {...register("first_name")}
                className={errors.first_name ? "border-destructive" : ""}
              />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                placeholder="Dela Cruz"
                {...register("last_name")}
                className={errors.last_name ? "border-destructive" : ""}
              />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name (Optional)</Label>
              <Input id="middle_name" placeholder="Santos" {...register("middle_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue="Male" onValueChange={(value) => setValue("gender", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_at">Expected Date of Visit</Label>
            <Input
              id="expected_at"
              type="date"
              min={todayLocal()}
              {...register("expected_at")}
              className={errors.expected_at ? "border-destructive" : ""}
            />
            {errors.expected_at && <p className="text-xs text-destructive">{errors.expected_at.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Visit Duration (HH : MM : SS)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Input
                  type="number"
                  min={0}
                  max={24}
                  placeholder="HH"
                  aria-label="Hours"
                  {...register("visit_hours", { valueAsNumber: true })}
                />
                <p className="text-[10px] text-muted-foreground text-center">Hours</p>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  placeholder="MM"
                  aria-label="Minutes"
                  {...register("visit_minutes", { valueAsNumber: true })}
                />
                <p className="text-[10px] text-muted-foreground text-center">Minutes</p>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  placeholder="SS"
                  aria-label="Seconds"
                  {...register("visit_seconds", { valueAsNumber: true })}
                />
                <p className="text-[10px] text-muted-foreground text-center">Seconds</p>
              </div>
            </div>
            {durationError && <p className="text-xs text-destructive">{durationError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Visit</Label>
            <Textarea
              id="purpose"
              placeholder="e.g., Family visit, Delivering items, etc."
              {...register("purpose")}
              className={errors.purpose ? "border-destructive" : ""}
            />
            {errors.purpose && <p className="text-xs text-destructive">{errors.purpose.message}</p>}
          </div>

          <div className="rounded-lg bg-amber-50/50 border border-amber-100 p-3 flex gap-2">
            <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-normal">
              Registered visitors will be granted a QR code valid for 24 hours from the time of registration.
              Residents are responsible for their visitors' conduct within the premises.
            </p>
          </div>

        </form>
        </div>

          <DialogFooter className="p-6 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-visitor-form" disabled={isSubmitting || isUploading} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Visitor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
