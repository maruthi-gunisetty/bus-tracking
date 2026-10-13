/**
 * Haversine formula to calculate the great-circle distance between two points
 * on the Earth given their latitude and longitude in decimal degrees.
 */
const EARTH_RADIUS_METERS = 6371000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Returns the distance between two coordinates in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Returns distance in kilometers (rounded to 2 decimal places).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const meters = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  return Math.round((meters / 1000) * 100) / 100;
}

/**
 * Formats distance into a human-readable string.
 */
export function formatDistance(meters?: number | null): string {
  if (meters === undefined || meters === null || isNaN(meters)) {
    return '--';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Determines whether the bus is currently approaching or moving away
 * relative to a previous distance reading.
 */
export function isBusApproaching(
  prevDistanceMeters: number | null,
  currentDistanceMeters: number
): boolean {
  if (prevDistanceMeters === null) return true;
  return currentDistanceMeters <= prevDistanceMeters;
}

/**
 * Checks if the bus has reached within the arrival geofence radius.
 */
export function hasBusReachedArrival(
  distanceMeters: number,
  radiusMeters: number
): boolean {
  return distanceMeters <= radiusMeters;
}
