"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Loader2, DoorOpen, User, BookCheck, Info } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { assignmentSchema, AssignmentFormValues } from "@/lib/validations/assignment"
import { createAssignment, getAvailableResidents, getAvailableRooms } from "@/lib/actions/assignment-actions"

export function AddAssignmentDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [residents, setResidents] = useState<{ id: string; first_name: string; last_name: string; photo: string | null; username: string }[]>([])
  const [rooms, setRooms] = useState<{ id: number; room_number: string; capacity: number }[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  
  const [openResident, setOpenResident] = useState(false)
  const [openRoom, setOpenRoom] = useState(false)

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      user_id: "",
      room_id: 0,
    },
  })

  const selectedResidentId = watch("user_id")
  const selectedRoomId = watch("room_id")

  const selectedResident = residents.find((r) => r.id === selectedResidentId)
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoadingData(true)
        const [resResidents, resRooms] = await Promise.all([
          getAvailableResidents(),
          getAvailableRooms()
        ])
        
        if (resResidents.success) setResidents((resResidents.residents as any) || [])
        if (resRooms.success) setRooms(resRooms.rooms || [])
        setIsLoadingData(false)
      }
      fetchData()
    }
  }, [open])

  async function onSubmit(data: AssignmentFormValues) {
    setIsSubmitting(true)
    try {
      const result = await createAssignment(data)
      if (result.success) {
        toast.success("Resident assigned successfully")
        setOpen(false)
        reset()
      } else {
        toast.error(result.error || "Failed to create assignment")
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
          Assign Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BookCheck className="h-5 w-5" />
            <DialogTitle>Assign Resident to Room</DialogTitle>
          </div>
          <DialogDescription>
            Select a resident and an available room to create a new assignment.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading availability...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Resident
              </Label>
              <Popover open={openResident} onOpenChange={setOpenResident}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openResident}
                    className="w-full justify-between font-normal bg-background/50 h-10 px-3"
                  >
                    {selectedResident ? (
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="h-6 w-6 shrink-0 border">
                          <AvatarImage src={selectedResident.photo || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {selectedResident.first_name[0]}{selectedResident.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{selectedResident.first_name} {selectedResident.last_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Search resident...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[375px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search resident by name or username..." />
                    <CommandList>
                      <CommandEmpty>No unassigned residents found.</CommandEmpty>
                      <CommandGroup>
                        {residents.map((resident) => (
                          <CommandItem
                            key={resident.id}
                            value={`${resident.first_name} ${resident.last_name} ${resident.username}`}
                            onSelect={() => {
                              setValue("user_id", resident.id, { shouldValidate: true })
                              setOpenResident(false)
                            }}
                            className="flex items-center justify-between py-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border">
                                <AvatarImage src={resident.photo || undefined} />
                                <AvatarFallback className="text-xs">
                                  {resident.first_name[0]}{resident.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{resident.first_name} {resident.last_name}</span>
                                <span className="text-xs text-muted-foreground">@{resident.username}</span>
                              </div>
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedResidentId === resident.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                Room
              </Label>
              <Popover open={openRoom} onOpenChange={setOpenRoom}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openRoom}
                    className="w-full justify-between font-normal bg-background/50 h-10 px-3"
                  >
                    {selectedRoom ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                          <DoorOpen className="h-3.5 w-3.5" />
                        </div>
                        <span>Room {selectedRoom.room_number}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Search room...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[375px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search room number..." />
                    <CommandList>
                      <CommandEmpty>No available rooms found.</CommandEmpty>
                      <CommandGroup>
                        {rooms.map((room) => (
                          <CommandItem
                            key={room.id}
                            value={room.room_number}
                            onSelect={() => {
                              setValue("room_id", room.id, { shouldValidate: true })
                              setOpenRoom(false)
                            }}
                            className="flex items-center justify-between py-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <DoorOpen className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">Room {room.room_number}</span>
                                <span className="text-xs text-muted-foreground">Capacity: {room.capacity} beds</span>
                              </div>
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedRoomId === room.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.room_id && <p className="text-xs text-destructive">{errors.room_id.message}</p>}
            </div>

            <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 flex gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-700 leading-normal">
                Only residents weightout active assignments and rooms with available bed space are shown here. 
                Assignments are marked as "Active" immediately.
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
              <Button type="submit" disabled={isSubmitting || residents.length === 0 || rooms.length === 0} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
