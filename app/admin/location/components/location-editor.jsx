"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { Loader2, LocateFixed, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveDormLocation, clearDormLocation } from "@/lib/actions/location-actions"

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <div className="h-[460px] rounded-xl border bg-muted/30 animate-pulse" />,
})

function toMeters(value, unit) {
  const v = Number(value)
  if (!Number.isFinite(v) || v <= 0) return 0
  if (unit === "km") return v * 1000
  if (unit === "sqm") return Math.sqrt(v / Math.PI) // area of a circle -> radius
  return v
}

export function LocationEditor({ initial }) {
  const [position, setPosition] = useState(initial ? [initial.latitude, initial.longitude] : null)
  const [unit, setUnit] = useState("m")
  const [value, setValue] = useState(initial ? String(initial.radius_meters) : "500")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(initial)

  const radius = useMemo(() => Math.round(toMeters(value, unit)), [value, unit])
  const areaSqm = Math.round(Math.PI * radius * radius)

  const pick = (lat, lng) => setPosition([Number(lat.toFixed(6)), Number(lng.toFixed(6))])

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation is not supported by this browser.")
    navigator.geolocation.getCurrentPosition(
      (p) => pick(p.coords.latitude, p.coords.longitude),
      () => toast.error("Could not get your location. Allow location access or click the map."),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const save = async () => {
    if (!position) return toast.error("Click the map to choose the dorm location.")
    if (radius < 10) return toast.error("Radius must be at least 10 meters.")
    setSaving(true)
    const res = await saveDormLocation({ latitude: position[0], longitude: position[1], radius_meters: radius })
    setSaving(false)
    if (res.success) {
      setSaved({ latitude: position[0], longitude: position[1], radius_meters: radius })
      toast.success("Dorm location saved. Guards can now only scan inside this area.")
    } else {
      toast.error(res.error || "Failed to save location")
    }
  }

  const clear = async () => {
    setSaving(true)
    const res = await clearDormLocation()
    setSaving(false)
    if (res.success) {
      setSaved(null)
      toast.success("Location restriction removed. Guards can scan anywhere.")
    } else {
      toast.error(res.error || "Failed to remove location")
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-2">
        <LocationMap position={position} radius={radius} onPick={pick} />
        <p className="text-xs text-muted-foreground">Click anywhere on the map to place the dormitory pin.</p>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm h-fit">
        <div className="space-y-2">
          <Label>Allowed area size</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" min={1} value={value} onChange={(e) => setValue(e.target.value)} />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="m">Radius (meters)</SelectItem>
                <SelectItem value="km">Radius (km)</SelectItem>
                <SelectItem value="sqm">Area (sq. meters)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Radius: <strong>{radius.toLocaleString()} m</strong> · Area: <strong>{areaSqm.toLocaleString()} sqm</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Latitude</Label>
            <Input value={position?.[0] ?? ""} readOnly placeholder="—" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Longitude</Label>
            <Input value={position?.[1] ?? ""} readOnly placeholder="—" />
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full gap-2" onClick={useMyLocation}>
          <LocateFixed className="h-4 w-4" /> Use my current location
        </Button>

        <Button type="button" className="w-full gap-2" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Location
        </Button>

        {saved && (
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-2">
            <p>
              <strong>Active:</strong> {saved.latitude}, {saved.longitude} · {saved.radius_meters.toLocaleString()} m radius
            </p>
            <Button type="button" variant="ghost" size="sm" className="text-destructive gap-2 px-0" onClick={clear} disabled={saving}>
              <Trash2 className="h-3.5 w-3.5" /> Remove restriction
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
