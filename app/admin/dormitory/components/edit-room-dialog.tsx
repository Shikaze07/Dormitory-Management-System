"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, DoorOpen, Users, Info, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { roomSchema, RoomFormValues } from "@/lib/validations/room"
import { updateRoom } from "@/lib/actions/room-actions"
import { Room } from "../columns"

interface EditRoomDialogProps {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRoomDialog({ room, open, onOpenChange }: EditRoomDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: room.room_number,
      capacity: room.capacity,
      status: room.status,
    },
  })

  const currentStatus = watch("status")

  // Reset form when room changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        room_number: room.room_number,
        capacity: room.capacity,
        status: room.status,
      })
    }
  }, [open, room, reset])

  async function onSubmit(data: RoomFormValues) {
    setIsSubmitting(true)
    try {
      const result = await updateRoom(room.id, data)
      if (result.success) {
        toast.success("Room updated successfully")
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to update room")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <DoorOpen className="h-5 w-5" />
            <DialogTitle>Edit Room: {room.room_number}</DialogTitle>
          </div>
          <DialogDescription>
            Update the room details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit_room_number" className="flex items-center gap-1.5">
              <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
              Room Number
            </Label>
            <Input 
              id="edit_room_number" 
              placeholder="e.g. 101, B-2" 
              {...register("room_number")} 
            />
            {errors.room_number && (
              <p className="text-xs text-destructive">{errors.room_number.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_capacity" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Capacity
              </Label>
              <Input 
                id="edit_capacity" 
                type="number" 
                min="1" 
                {...register("capacity", { valueAsNumber: true })} 
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                Status
              </Label>
              <Select 
                onValueChange={(value) => setValue("status", value as any)} 
                value={currentStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

