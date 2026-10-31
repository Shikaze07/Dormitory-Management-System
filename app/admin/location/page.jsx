import { getDormLocation } from "@/lib/actions/location-actions"
import { getSession } from "@/lib/server-auth"
import { Separator } from "@/components/ui/separator"
import { MapPin } from "lucide-react"
import { LocationEditor } from "./components/location-editor"

export const metadata = {
  title: "Set Location | Admin Portal",
  description: "Define the dormitory area where guards are allowed to scan.",
}

export default async function LocationPage() {
  const session = await getSession()
  if (!session || session.role !== "Admin") {
    return <div className="p-7 text-muted-foreground">Only admins can access this page.</div>
  }
  const { location } = await getDormLocation()

  return (
    <div className="container mx-auto p-7 space-y-4">
      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          <MapPin className="h-6 w-6" />
          <h2 className="text-3xl font-bold tracking-tight">Set Location</h2>
        </div>
        <p className="text-muted-foreground">
          Pin the dormitory on the map and choose how wide the allowed area is. Guards can only scan
          QR codes while they are inside this area.
        </p>
      </div>
      <Separator className="my-6" />
      <LocationEditor
        initial={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                radius_meters: location.radius_meters,
              }
            : null
        }
      />
    </div>
  )
}
