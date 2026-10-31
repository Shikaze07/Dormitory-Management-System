"use client"

import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet"

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Recenter({ position, radius }) {
  const map = useMap()
  useEffect(() => {
    if (!position) return
    const [lat, lng] = position
    const dLat = radius / 111320
    const dLng = radius / (111320 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01))
    const bounds = L.latLngBounds([lat - dLat, lng - dLng], [lat + dLat, lng + dLng])
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 18 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.[0], position?.[1], radius])
  return null
}

export default function LocationMap({ position, radius, onPick }) {
  const center = position ?? [12.8797, 121.774] // Philippines
  return (
    <MapContainer
      center={center}
      zoom={position ? 16 : 6}
      scrollWheelZoom
      style={{ height: "460px", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {position && (
        <>
          <Marker
            position={position}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend(e) {
                const ll = e.target.getLatLng()
                onPick(ll.lat, ll.lng)
              },
            }}
          />
          <Circle center={position} radius={radius} pathOptions={{ color: "#2563eb", fillOpacity: 0.15 }} />
          <Recenter position={position} radius={radius} />
        </>
      )}
    </MapContainer>
  )
}
