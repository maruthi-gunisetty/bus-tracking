import { GPS_CONFIG } from '../config/constants';
import { calculateHaversineDistance } from './haversine';

export interface LocationValidationResult {
  isValid: boolean;
  reason?: string;
  calculatedSpeedKmh?: number;
}

/**
 * Validates coordinate ranges [-90, 90] and [-180, 180].
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validates GPS accuracy against maximum allowed threshold (100m).
 */
export function validateAccuracy(accuracyMeters?: number): boolean {
  if (typeof accuracyMeters !== 'number' || isNaN(accuracyMeters)) return false;
  return accuracyMeters > 0 && accuracyMeters <= GPS_CONFIG.MAX_ACCURACY_THRESHOLD_METERS;
}

/**
 * Validates whether movement from previous coordinate to new coordinate is plausible.
 * Rejects sudden velocity jumps (e.g. GPS teleporting > 120 km/h).
 */
export function validateMovement(
  prevLat: number,
  prevLng: number,
  prevTimestampMs: number,
  newLat: number,
  newLng: number,
  newTimestampMs: number
): LocationValidationResult {
  if (!validateCoordinates(newLat, newLng)) {
    return { isValid: false, reason: 'Invalid coordinate values.' };
  }

  const timeDeltaSeconds = (newTimestampMs - prevTimestampMs) / 1000;
  if (timeDeltaSeconds <= 0) {
    return { isValid: true, calculatedSpeedKmh: 0 };
  }

  const distanceMeters = calculateHaversineDistance(prevLat, prevLng, newLat, newLng);
  const speedMetersPerSecond = distanceMeters / timeDeltaSeconds;
  const speedKmh = speedMetersPerSecond * 3.6;

  if (speedKmh > GPS_CONFIG.MAX_PLAUSIBLE_SPEED_KMH) {
    return {
      isValid: false,
      reason: `Velocity jump detected: ${Math.round(speedKmh)} km/h exceeds limit (${GPS_CONFIG.MAX_PLAUSIBLE_SPEED_KMH} km/h).`,
      calculatedSpeedKmh: speedKmh,
    };
  }

  return {
    isValid: true,
    calculatedSpeedKmh: Math.round(speedKmh * 10) / 10,
  };
}

/**
 * Checks if a location timestamp is older than the stale threshold (60s).
 */
export function isLocationStale(lastUpdateIso?: string | null): boolean {
  if (!lastUpdateIso) return true;
  const updateTimeMs = new Date(lastUpdateIso).getTime();
  if (isNaN(updateTimeMs)) return true;
  return Date.now() - updateTimeMs > GPS_CONFIG.STALE_LOCATION_TIMEOUT_MS;
}

/**
 * Returns the number of seconds since the last location update.
 */
export function getStaleAgeSeconds(lastUpdateIso?: string | null): number {
  if (!lastUpdateIso) return 999;
  const updateTimeMs = new Date(lastUpdateIso).getTime();
  if (isNaN(updateTimeMs)) return 999;
  return Math.max(0, Math.floor((Date.now() - updateTimeMs) / 1000));
}
