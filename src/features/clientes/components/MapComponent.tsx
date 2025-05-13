import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { icon } from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

interface MapComponentProps {
  center: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
  draggable?: boolean
}

const MARKER_ICON = icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

export default function MapComponent({ center, onLocationSelect, draggable }: MapComponentProps) {
  function LocationMarker() {

    return (
      <Marker 
        position={center} 
        icon={MARKER_ICON}
        draggable={draggable}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target
            const position = marker.getLatLng()
            onLocationSelect(position.lat, position.lng)
          },
        }}
      />
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  )
} 