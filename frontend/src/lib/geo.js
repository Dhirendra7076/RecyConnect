// Rough lat/lng for major Indian cities. Used by mock + fallbacks.
const CITY_COORDS = {
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
}

export function cityToCoords(city) {
  const key = String(city || '').trim().toLowerCase()
  return CITY_COORDS[key] || CITY_COORDS.bengaluru
}

// Jitter around a center by ~±0.02 deg (~2 km)
export function jitter(coord, seed = 0) {
  const r1 = Math.sin(seed * 12.9898) * 43758.5453
  const r2 = Math.sin(seed * 78.233) * 12345.6789
  const dx = ((r1 - Math.floor(r1)) - 0.5) * 0.04
  const dy = ((r2 - Math.floor(r2)) - 0.5) * 0.04
  return { lat: coord.lat + dy, lng: coord.lng + dx }
}

// Great-circle distance in km
export function haversineKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function formatKm(km) {
  if (km == null) return '—'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}