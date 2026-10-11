// Haversine distance in kilometers between two [lng, lat] points
export function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371; // Earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isValidCoordinates(lng, lat) {
  return (
    typeof lng === "number" && typeof lat === "number" &&
    lng >= -180 && lng <= 180 &&
    lat >= -90 && lat <= 90
  );
}