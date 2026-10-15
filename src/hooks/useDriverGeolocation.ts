import { useState, useEffect, useRef, useCallback } from 'react';
import type { TripStatus, RecoveryState, CollegeDestination } from '../types';
import { calculateHaversineDistance, hasBusReachedArrival } from '../utils/haversine';
import { validateCoordinates, validateAccuracy, validateMovement } from '../utils/geoValidation';
import { updateTripTelemetry } from '../services/tripService';
import { playArrivalChime } from '../utils/sound';

interface UseDriverGeolocationProps {
  tripId: string | null;
  busId: string;
  collegeDestination: CollegeDestination;
  isDemo: boolean;
  onArrival?: () => void;
  busNumber?: string;
  driverId?: string;
  driverName?: string;
}

export type TrackingStatus =
  | 'Live'
  | 'Location signal delayed'
  | 'Location Unavailable'
  | 'Standby'
  | 'Paused'
  | 'Completed';

interface GeolocationState {
  isTracking: boolean;
  isPaused: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  speedKmh: number | null;
  heading: number | null;
  distanceToCollege: number | null;
  lastUpdateTimestamp: number | null;
  recoveryState: RecoveryState | null;
  wakeLockActive: boolean;
  tripStatus: TripStatus;
  trackingStatus: TrackingStatus;
  errorMessage: string | null;
}

const GPS_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

const DELAYED_THRESHOLD_MS = 15000;
const STALE_UNAVAILABLE_MS = 45000;

export function useDriverGeolocation({
  tripId,
  busId: _busId,
  collegeDestination,
  isDemo,
  onArrival,
}: UseDriverGeolocationProps) {
  const [state, setState] = useState<GeolocationState>({
    isTracking: false,
    isPaused: false,
    latitude: null,
    longitude: null,
    accuracy: null,
    speedKmh: null,
    heading: null,
    distanceToCollege: null,
    lastUpdateTimestamp: null,
    recoveryState: null,
    wakeLockActive: false,
    tripStatus: 'NOT_STARTED',
    trackingStatus: 'Standby',
    errorMessage: null,
  });

  const lastPublishedLocationRef = useRef<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockSentinelRef = useRef<any>(null);
  const delayedTimerRef = useRef<number | null>(null);
  const staleTimerRef = useRef<number | null>(null);

  // Request Wake Lock to prevent screen sleep during driving
  const acquireWakeLock = useCallback(async () => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen');
        setState((prev) => ({ ...prev, wakeLockActive: true }));
        wakeLockSentinelRef.current.addEventListener('release', () => {
          setState((prev) => ({ ...prev, wakeLockActive: false }));
        });
      } catch (err) {
        console.warn('[WakeLock] Unable to acquire screen wake lock:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockSentinelRef.current) {
      try {
        wakeLockSentinelRef.current.release();
      } catch {
        // ignore
      }
      wakeLockSentinelRef.current = null;
      setState((prev) => ({ ...prev, wakeLockActive: false }));
    }
  }, []);

  // Re-acquire wake lock on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && state.isTracking && !state.isPaused) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isTracking, state.isPaused, acquireWakeLock]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        recoveryState: null,
        trackingStatus: prev.isTracking && !prev.isPaused && prev.latitude !== null ? 'Live' : prev.trackingStatus,
        errorMessage: null,
      }));
    };
    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        recoveryState: 'CONNECTION_LOST',
        trackingStatus: 'Location Unavailable',
        errorMessage: 'Network connection lost. Live tracking paused.',
      }));
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process a real incoming GPS position
  const handlePositionSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed, heading } = position.coords;
      const nowMs = position.timestamp || Date.now();

      // 1. Coordinate range validation
      if (!validateCoordinates(latitude, longitude)) {
        console.warn('[GPS] Invalid coordinates rejected:', latitude, longitude);
        return;
      }

      // 2. Accuracy check (reject poor accuracy > 100m)
      if (!validateAccuracy(accuracy)) {
        console.warn(`[GPS] Accuracy ${accuracy}m rejected (exceeds 100m threshold)`);
        setState((prev) => ({
          ...prev,
          trackingStatus: 'Location signal delayed',
          recoveryState: 'LOCATION_STALE',
          errorMessage: 'GPS accuracy too low. Acquiring clearer satellite fix...',
        }));
        return;
      }

      // 3. Velocity jump rejection if we have a previous fix
      let calculatedSpeed = speed ? speed * 3.6 : 0;
      if (lastPublishedLocationRef.current) {
        const movementResult = validateMovement(
          lastPublishedLocationRef.current.lat,
          lastPublishedLocationRef.current.lng,
          lastPublishedLocationRef.current.timestamp,
          latitude,
          longitude,
          nowMs
        );

        if (!movementResult.isValid) {
          console.warn('[GPS] Velocity filter rejected jump:', movementResult.reason);
          return;
        }

        if (movementResult.calculatedSpeedKmh !== undefined && !speed) {
          calculatedSpeed = movementResult.calculatedSpeedKmh;
        }
      }

      // 4. Calculate distance to College Destination
      const distanceToCollege = calculateHaversineDistance(
        latitude,
        longitude,
        collegeDestination.lat,
        collegeDestination.lng
      );

      // Check arrival geofence
      const arrived = hasBusReachedArrival(
        distanceToCollege,
        collegeDestination.arrivalRadiusMeters
      );

      // 5. Throttling logic (5s min interval OR 10m displacement for real-time smoothness)
      const last = lastPublishedLocationRef.current;
      const timeSinceLastMs = last ? nowMs - last.timestamp : Infinity;
      const displacementMeters = last
        ? calculateHaversineDistance(last.lat, last.lng, latitude, longitude)
        : Infinity;

      const shouldPublish =
        !last ||
        timeSinceLastMs >= 5000 ||
        displacementMeters >= 10 ||
        arrived;

      const newTripStatus: TripStatus = arrived ? 'ARRIVED' : 'ACTIVE';

      setState((prev) => ({
        ...prev,
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        speedKmh: Math.round(calculatedSpeed),
        heading: heading !== null && !isNaN(heading) ? Math.round(heading) : prev.heading,
        distanceToCollege: Math.round(distanceToCollege),
        lastUpdateTimestamp: nowMs,
        recoveryState: null,
        tripStatus: newTripStatus,
        trackingStatus: 'Live',
        errorMessage: null,
      }));

      if (arrived) {
        playArrivalChime();
        if (onArrival) onArrival();
      }

      if (shouldPublish && !isDemo) {
        const targetTripId = tripId || 'trip_demo_04';
        lastPublishedLocationRef.current = { lat: latitude, lng: longitude, timestamp: nowMs };
        updateTripTelemetry(targetTripId, {
          latitude,
          longitude,
          accuracyMeters: Math.round(accuracy),
          speedKmh: Math.round(calculatedSpeed),
          heading: heading !== null && !isNaN(heading) ? Math.round(heading) : null,
          status: newTripStatus,
        });
      }

      // Reset delayed and stale timers
      if (delayedTimerRef.current) window.clearTimeout(delayedTimerRef.current);
      if (staleTimerRef.current) window.clearTimeout(staleTimerRef.current);

      delayedTimerRef.current = window.setTimeout(() => {
        setState((prev) => {
          if (!prev.isTracking || prev.isPaused) return prev;
          return {
            ...prev,
            recoveryState: 'LOCATION_STALE',
            trackingStatus: 'Location signal delayed',
            errorMessage: 'Location signal delayed (>15s). Checking satellite reception...',
          };
        });
      }, DELAYED_THRESHOLD_MS);

      staleTimerRef.current = window.setTimeout(() => {
        setState((prev) => {
          if (!prev.isTracking || prev.isPaused) return prev;
          return {
            ...prev,
            recoveryState: 'LOCATION_STALE',
            trackingStatus: 'Location Unavailable',
            errorMessage: 'Location signal lost. Reconnecting to GPS...',
          };
        });
      }, STALE_UNAVAILABLE_MS);
    },
    [collegeDestination, isDemo, onArrival, tripId]
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    let rec: RecoveryState = 'GPS_UNAVAILABLE';
    let msg = 'Location access is required for real-time tracking. Please enable location permission in your browser settings.';

    if (error.code === error.PERMISSION_DENIED) {
      rec = 'LOCATION_PERMISSION_DENIED';
      msg = 'Location access is required for real-time tracking. Please enable location permission in your browser settings.';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      rec = 'GPS_UNAVAILABLE';
      msg = 'GPS fix unavailable. Please check that device location services are turned on.';
    } else if (error.code === error.TIMEOUT) {
      rec = 'LOCATION_STALE';
      msg = 'Location fix timed out. Waiting for satellite reconnection...';
    }

    setState((prev) => ({
      ...prev,
      recoveryState: rec,
      trackingStatus: 'Location Unavailable',
      errorMessage: msg,
    }));
  }, []);

  // Request browser location permission and start continuous watchPosition
  const requestPermissionAndStart = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser or device.';
      setState((prev) => ({
        ...prev,
        recoveryState: 'GPS_UNAVAILABLE',
        trackingStatus: 'Location Unavailable',
        errorMessage: err,
      }));
      return { success: false, error: err };
    }

    // Check for insecure HTTP deployment context
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const err = 'Website is running in an insecure deployment context (HTTP). Geolocation requires HTTPS in production.';
      setState((prev) => ({
        ...prev,
        recoveryState: 'LOCATION_PERMISSION_DENIED',
        trackingStatus: 'Location Unavailable',
        errorMessage: err,
      }));
      return { success: false, error: err };
    }

    // Check if permission was previously permanently denied
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm.state === 'denied') {
          const err = 'Location permission is blocked in your browser settings. Please click the site settings/lock icon in your address bar and set Location to Allow.';
          setState((prev) => ({
            ...prev,
            recoveryState: 'LOCATION_PERMISSION_DENIED',
            trackingStatus: 'Location Unavailable',
            errorMessage: err,
          }));
          return { success: false, error: err };
        }
      } catch {
        // Permissions API query not supported in this browser, proceed to native prompt
      }
    }

    setState((prev) => ({
      ...prev,
      tripStatus: 'STARTING',
      recoveryState: null,
      errorMessage: null,
    }));

    return new Promise((resolve) => {
      // Step 1: Request initial position to invoke permission prompt
      navigator.geolocation.getCurrentPosition(
        (initialPosition) => {
          // Process first real GPS coordinates
          handlePositionSuccess(initialPosition);
          acquireWakeLock();

          // Step 2: Establish continuous watchPosition
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }

          watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionSuccess,
            handlePositionError,
            GPS_OPTIONS
          );

          setState((prev) => ({
            ...prev,
            isTracking: true,
            isPaused: false,
            tripStatus: 'ACTIVE',
            trackingStatus: 'Live',
            recoveryState: null,
            errorMessage: null,
          }));

          resolve({ success: true });
        },
        (error) => {
          let rec: RecoveryState = 'GPS_UNAVAILABLE';
          let msg =
            'Location access is required for real-time tracking. Please enable location permission in your browser settings.';

          if (error.code === error.PERMISSION_DENIED) {
            rec = 'LOCATION_PERMISSION_DENIED';
            msg =
              'Location access is required for real-time tracking. Please enable location permission in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            rec = 'GPS_UNAVAILABLE';
            msg =
              'GPS location fix is currently unavailable. Please verify device location is enabled.';
          } else if (error.code === error.TIMEOUT) {
            rec = 'LOCATION_STALE';
            msg = 'GPS location request timed out. Please check your connectivity.';
          }

          setState((prev) => ({
            ...prev,
            isTracking: false,
            isPaused: false,
            tripStatus: 'NOT_STARTED',
            trackingStatus: 'Location Unavailable',
            recoveryState: rec,
            errorMessage: msg,
          }));

          resolve({ success: false, error: msg });
        },
        GPS_OPTIONS
      );
    });
  }, [acquireWakeLock, handlePositionError, handlePositionSuccess]);

  // Pause / Stop Trip: Stops sending location updates and clears active watcher
  const pauseTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (delayedTimerRef.current) {
      window.clearTimeout(delayedTimerRef.current);
      delayedTimerRef.current = null;
    }
    if (staleTimerRef.current) {
      window.clearTimeout(staleTimerRef.current);
      staleTimerRef.current = null;
    }
    releaseWakeLock();
    setState((prev) => ({
      ...prev,
      isTracking: false,
      isPaused: true,
      trackingStatus: 'Paused',
    }));
  }, [releaseWakeLock]);

  // Resume tracking after pause
  const resumeTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    acquireWakeLock();
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      GPS_OPTIONS
    );

    setState((prev) => ({
      ...prev,
      isTracking: true,
      isPaused: false,
      trackingStatus: 'Live',
    }));
  }, [acquireWakeLock, handlePositionError, handlePositionSuccess]);

  // End Trip: Marks completed and clears all watchers
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (delayedTimerRef.current) {
      window.clearTimeout(delayedTimerRef.current);
      delayedTimerRef.current = null;
    }
    if (staleTimerRef.current) {
      window.clearTimeout(staleTimerRef.current);
      staleTimerRef.current = null;
    }
    releaseWakeLock();
    lastPublishedLocationRef.current = null;
    setState((prev) => ({
      ...prev,
      isTracking: false,
      isPaused: false,
      tripStatus: 'COMPLETED',
      trackingStatus: 'Completed',
    }));
  }, [releaseWakeLock]);

  const clearErrorMessage = useCallback(() => {
    setState((prev) => ({ ...prev, errorMessage: null }));
  }, []);

  // Cleanup on unmount or driver logout
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (delayedTimerRef.current) {
        window.clearTimeout(delayedTimerRef.current);
      }
      if (staleTimerRef.current) {
        window.clearTimeout(staleTimerRef.current);
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    state,
    startTracking: requestPermissionAndStart,
    requestPermissionAndStart,
    pauseTracking,
    resumeTracking,
    stopTracking,
    clearErrorMessage,
  };
}
