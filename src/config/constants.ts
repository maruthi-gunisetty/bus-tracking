import type { CollegeDestination } from '../types';

export const GPS_CONFIG = {
  MIN_PUBLISH_INTERVAL_MS: 8000, // Publish at most once every 8s (preserves Firestore writes)
  MIN_DISPLACEMENT_METERS: 20, // Or after moving at least 20m
  MAX_ACCURACY_THRESHOLD_METERS: 100, // Reject GPS fixes worse than 100m accuracy
  MAX_PLAUSIBLE_SPEED_KMH: 120, // Velocity jump rejection filter (120 km/h)
  STALE_LOCATION_TIMEOUT_MS: 60000, // Mark location STALE after 60s without updates
  WATCH_POSITION_MAX_AGE_MS: 5000,
  WATCH_POSITION_TIMEOUT_MS: 10000,
};

export const DEFAULT_COLLEGE: CollegeDestination = {
  name: "Gothami College Campus",
  lat: 17.385044,
  lng: 78.486671,
  arrivalRadiusMeters: 150, // 150 meters arrival geofence
};

export const ALERT_THRESHOLDS = [
  { km: 5.0, label: "5 km away", message: "Your college bus is approximately 5 km away. Please get ready!" },
  { km: 3.0, label: "3 km away", message: "Your bus is approaching. Start preparing to leave." },
  { km: 2.0, label: "2 km away", message: "Your bus is 2 km away from your pickup point." },
  { km: 1.0, label: "1 km away", message: "Your bus is very close. Please reach your pickup point." },
  { km: 0.2, label: "Arrived at Stop", message: "Your college bus has arrived at your pickup point!" },
];

export const HYSTERESIS_BUFFER_METERS = 80; // 80m buffer to prevent jitter flapping
