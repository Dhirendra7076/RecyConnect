import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getMaterial } from '../../lib/constants'
import { formatKm } from '../../lib/geo'

// --- Leaflet default icon fix for Vite ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Custom household marker (green pin)
const householdIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px;
    background: #10b981; border: 3px solid #fff;
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,.35);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

export default function MapView({
  center,
  zoom = 12,
  household,
  recyclers = [],
  height = 380,
  onSelectRecycler,
}) {
  if (!center) return null

  return (
    <div
      className="rounded-2xl overflow-hidden border border-base-300 shadow-sm"
      style={{ height }}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {household && (
          <Marker
            position={[household.lat, household.lng]}
            icon={householdIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Pickup location</strong>
                <br />
                {household.address?.line1}
                <br />
                {household.address?.city}
              </div>
            </Popup>
          </Marker>
        )}

        {recyclers.map((m) => {
          const r = m.recycler
          return (
            <Marker key={r.id} position={[r.lat, r.lng]}>
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <strong>{r.displayName}</strong>
                  <div className="text-xs opacity-70 mt-0.5">
                    ⭐ {r.rating} · {r.pickupsCompleted} pickups
                  </div>
                  <div className="text-xs mt-1">
                    📍 {formatKm(m.distanceKm)} · {m.estimatedPickupIn}
                  </div>
                  <div className="text-xs mt-1">
                    {r.materials
                      .map((code) => getMaterial(code).emoji)
                      .join(' ')}
                  </div>
                  {onSelectRecycler && (
                    <button
                      type="button"
                      className="btn btn-primary btn-xs mt-2 w-full"
                      onClick={() => onSelectRecycler(r)}
                    >
                      Choose
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}