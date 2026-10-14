import { useState, useEffect, useRef, useCallback } from 'react';
import type { TripStatus, RecoveryState, CollegeDestination } from '../types';
import { GPS_CONFIG } from '../config/constants';
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
}

interface GeolocationState {
  isTracking: boolean;
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
}

export function useDriverGeolocation({
  tripId,
  busId: _busId,
  collegeDestination,
  isDemo,
  onArrival,
}: UseDriverGeolocationProps) {
  const [state, setState] = useState<GeolocationState>({
    isTracking: false,
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
  });

  const lastPublishedLocationRef = useRef<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockSentinelRef = useRef<any>(null);
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
      if (document.visibilityState === 'visible' && state.isTracking) {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isTracking, acquireWakeLock]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, recoveryState: null }));
    };
    const handleOffline = () => {
      setState((prev) => ({ ...prev, recoveryState: 'CONNECTION_LOST' }));
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

      // 1. Basic coordinate validation
      if (!validateCoordinates(latitude, longitude)) {
        console.warn('[GPS] Invalid coordinates rejected:', latitude, longitude);
        return;
      }

      // 2. Accuracy check (reject poor accuracy > 100m)
      if (!validateAccuracy(accuracy)) {
        console.warn(`[GPS] Accuracy ${accuracy}m rejected (exceeds ${GPS_CONFIG.MAX_ACCURACY_THRESHOLD_METERS}m limit)`);
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
      const arrived = hasBusReachedArrival(distanceToCollege, collegeDestination.arrivalRadiusMeters);

      // 5. Throttling logic (8s min interval OR 20m displacement)
      const last = lastPublishedLocationRef.current;
      const timeSinceLastMs = last ? nowMs - last.timestamp : Infinity;
      const displacementMeters = last
        ? calculateHaversineDistance(last.lat, last.lng, latitude, longitude)
        : Infinity;

      const shouldPublish =
        !last ||
        timeSinceLastMs >= GPS_CONFIG.MIN_PUBLISH_INTERVAL_MS ||
        displacementMeters >= GPS_CONFIG.MIN_DISPLACEMENT_METERS ||
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
      }));

      if (arrived) {
        playArrivalChime();
        if (onArrival) onArrival();
      }

      if (shouldPublish && tripId && !isDemo) {
        lastPublishedLocationRef.current = { lat: latitude, lng: longitude, timestamp: nowMs };
        updateTripTelemetry(tripId, {
          latitude,
          longitude,
          accuracyMeters: Math.round(accuracy),
          speedKmh: Math.round(calculatedSpeed),
          heading: heading !== null && !isNaN(heading) ? Math.round(heading) : null,
          status: newTripStatus,
        });
      }

      // Reset stale location timer
      if (staleTimerRef.current) window.clearTimeout(staleTimerRef.current);
      staleTimerRef.current = window.setTimeout(() => {
        setState((prev) => ({ ...prev, recoveryState: 'LOCATION_STALE' }));
      }, GPS_CONFIG.STALE_LOCATION_TIMEOUT_MS);
    },
    [collegeDestination, isDemo, onArrival, tripId]
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    let rec: RecoveryState = 'GPS_UNAVAILABLE';
    if (error.code === error.PERMISSION_DENIED) {
      rec = 'LOCATION_PERMISSION_DENIED';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      rec = 'GPS_UNAVAILABLE';
    } else if (error.code === error.TIMEOUT) {
      rec = 'LOCATION_STALE';
    }
    setState((prev) => ({ ...prev, recoveryState: rec }));
  }, []);

  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState((prev) => ({ ...prev, recoveryState: 'GPS_UNAVAILABLE' }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isTracking: true,
      tripStatus: 'STARTING',
      recoveryState: null,
    }));

    acquireWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: GPS_CONFIG.WATCH_POSITION_TIMEOUT_MS,
        maximumAge: GPS_CONFIG.WATCH_POSITION_MAX_AGE_MS,
      }
    );
  }, [acquireWakeLock, handlePositionError, handlePositionSuccess]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
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
      tripStatus: 'COMPLETED',
    }));
  }, [releaseWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (staleTimerRef.current) {
        window.clearTimeout(staleTimerRef.current);
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    state,
    startTracking,
    stopTracking,
  };
}
