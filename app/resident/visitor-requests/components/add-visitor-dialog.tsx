"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Loader2, User, Calendar, Info, UserPlus } from "lucide-react"
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

export function AddVisitorDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VisitorRequestFormValues>({
    resolver: zodResolver(visitorRequestSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "Male",
      purpose: "",
      expected_at: new Date().toISOString().split('T')[0],
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
      } else {
        toast.error(result.error || "Failed to register visitor")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          Register Visitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <UserPlus className="h-5 w-5" />
            <DialogTitle>Register New Visitor</DialogTitle>
          </div>
          <DialogDescription>
            Fill in the details below to register a visitor and generate their access QR code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              <Input
                id="middle_name"
                placeholder="Santos"
                {...register("middle_name")}
              />
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
              {...register("expected_at")}
              className={errors.expected_at ? "border-destructive" : ""}
            />
            {errors.expected_at && <p className="text-xs text-destructive">{errors.expected_at.message}</p>}
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

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
