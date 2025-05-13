import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import type { LatLng } from '@/types/interfaces/sector'

// Traducciones para Leaflet.draw
L.drawLocal.draw.toolbar.buttons.polygon = 'Dibujar perímetro'
L.drawLocal.draw.toolbar.actions.title = 'Cancelar dibujo'
L.drawLocal.draw.toolbar.actions.text = 'Cancelar'
L.drawLocal.draw.toolbar.finish.title = 'Terminar dibujo'
L.drawLocal.draw.toolbar.finish.text = 'Terminar'
L.drawLocal.draw.toolbar.undo.title = 'Eliminar último punto'
L.drawLocal.draw.toolbar.undo.text = 'Eliminar último punto'
L.drawLocal.edit.toolbar.actions.save.title = 'Guardar cambios'
L.drawLocal.edit.toolbar.actions.save.text = 'Guardar'
L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancelar edición'
L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar'
L.drawLocal.edit.toolbar.actions.clearAll.title = 'Limpiar todo'
L.drawLocal.edit.toolbar.actions.clearAll.text = 'Limpiar todo'
L.drawLocal.edit.toolbar.buttons.edit = 'Editar perímetro'
L.drawLocal.edit.toolbar.buttons.editDisabled = 'No hay perímetro para editar'
L.drawLocal.edit.toolbar.buttons.remove = 'Eliminar perímetro'
L.drawLocal.edit.toolbar.buttons.removeDisabled = 'No hay perímetro para eliminar'

// Coordenadas de San Pedro de Macorís
const SAN_PEDRO_COORDS = {
  lat: 18.4539,
  lng: -69.3053
}

interface PerimeterMapProps {
  perimeter?: LatLng[]
  onChange: (points: LatLng[]) => void
}

const PerimeterMap = ({ perimeter, onChange }: PerimeterMapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)

  useEffect(() => {
    // Inicializar mapa
    const map = L.map('perimeter-map').setView([SAN_PEDRO_COORDS.lat, SAN_PEDRO_COORDS.lng], 14)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Capa para elementos dibujados
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    // Configurar controles de dibujo
    const drawControl = new L.Control.Draw({
      draw: {
        marker: false,
        circlemarker: false,
        circle: false,
        rectangle: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e4e8',
            message: '<strong>¡Error!</strong> No se permiten intersecciones'
          },
          shapeOptions: {
            color: '#0ea5e9'
          }
        }
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    })
    map.addControl(drawControl)

    // Cargar perímetro existente si existe
    if (perimeter && perimeter.length > 0) {
      const polygon = L.polygon(perimeter)
      drawnItems.addLayer(polygon)
    }

    // Eventos de dibujo
    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      const layer = (e as L.DrawEvents.Created).layer as L.Polygon
      drawnItems.addLayer(layer)
      
      // Extraer coordenadas
      const latlngs = layer.getLatLngs()[0] as L.LatLng[]
      const points = latlngs.map((point: L.LatLng) => ({
        lat: point.lat,
        lng: point.lng
      }))
      onChange(points)
    })

    map.on(L.Draw.Event.EDITED, () => {
      const points: LatLng[] = []
      drawnItems.eachLayer((layer: L.Layer) => {
        const coords = (layer as L.Polygon).getLatLngs()[0] as L.LatLng[]
        points.push(...coords.map((point: L.LatLng) => ({
          lat: point.lat,
          lng: point.lng
        })))
      })
      onChange(points)
    })

    map.on(L.Draw.Event.DELETED, () => {
      onChange([])
    })

    mapRef.current = map
    drawnItemsRef.current = drawnItems

    return () => {
      map.remove()
    }
  }, [ perimeter, onChange ])

  return (
    <div className="z-0 relative h-full w-full">
      <div id="perimeter-map" className="h-full w-full" />
      
    </div>
  )
}

export default PerimeterMap 