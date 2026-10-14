import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { Trip, TripStatus, RecoveryState } from '../types';
import { INITIAL_COLLEGE } from '../config/routeData';
import { calculateHaversineDistance } from '../utils/haversine';

// In-memory fallback event listeners for offline & demo modes
type TripListener = (trip: Trip | null) => void;
type MultiTripsListener = (trips: Trip[]) => void;

const tripSubscribers = new Map<string, Set<TripListener>>();
const activeTripsSubscribers = new Set<MultiTripsListener>();

// Initial in-memory active trip for demonstration
let memoryTrips: Map<string, Trip> = new Map([
  [
    'trip_demo_04',
    {
      tripId: 'trip_demo_04',
      busId: 'bus_04',
      busNumber: 'BUS-04',
      driverId: 'driver_ramesh',
      driverName: 'Ramesh K. (Senior Driver)',
      routeId: 'route_07',
      status: 'ACTIVE',
      recoveryState: null,
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      endTime: null,
      latestLatitude: 17.4085,
      latestLongitude: 17.4520,
      latestAccuracyMeters: 12,
      latestSpeedKmh: 38,
      latestHeading: 135,
      lastLocationUpdate: new Date().toISOString(),
      distanceToCollegeMeters: calculateHaversineDistance(
        17.4085,
        17.4520,
        INITIAL_COLLEGE.lat,
        INITIAL_COLLEGE.lng
      ),
    },
  ],
]);

function notifyTripSubscribers(trip: Trip) {
  const subs = tripSubscribers.get(trip.tripId);
  if (subs) {
    subs.forEach((cb) => cb({ ...trip }));
  }
  const allActive = Array.from(memoryTrips.values()).filter(
    (t) => t.status === 'ACTIVE' || t.status === 'STARTING' || t.status === 'ARRIVED'
  );
  activeTripsSubscribers.forEach((cb) => cb([...allActive]));
}

/**
 * Starts a new trip for a bus.
 */
export async function startTrip(params: {
  busId: string;
  busNumber: string;
  driverId: string;
  driverName?: string;
  routeId: string;
  initialLat?: number;
  initialLng?: number;
}): Promise<string> {
  const tripId = `trip_${params.busId}_${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newTrip: Trip = {
    tripId,
    busId: params.busId,
    busNumber: params.busNumber,
    driverId: params.driverId,
    driverName: params.driverName || 'Driver',
    routeId: params.routeId,
    status: 'ACTIVE',
    recoveryState: null,
    startTime: nowIso,
    endTime: null,
    latestLatitude: params.initialLat ?? 17.4385,
    latestLongitude: params.initialLng ?? 78.4420,
    latestAccuracyMeters: 10,
    latestSpeedKmh: 0,
    latestHeading: 0,
    lastLocationUpdate: nowIso,
    distanceToCollegeMeters: calculateHaversineDistance(
      params.initialLat ?? 17.4385,
      params.initialLng ?? 78.4420,
      INITIAL_COLLEGE.lat,
      INITIAL_COLLEGE.lng
    ),
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'trips', tripId), newTrip);
      await updateDoc(doc(db, 'buses', params.busId), {
        status: 'ACTIVE',
        currentTripId: tripId,
      });
    } catch (err) {
      console.warn('[TripService] Firestore startTrip error, using in-memory state:', err);
    }
  }

  memoryTrips.set(tripId, newTrip);
  notifyTripSubscribers(newTrip);
  return tripId;
}

/**
 * Updates the current location and telemetry of an active trip.
 */
export async function updateTripTelemetry(
  tripId: string,
  telemetry: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    speedKmh?: number | null;
    heading?: number | null;
    status?: TripStatus;
    recoveryState?: RecoveryState | null;
  }
): Promise<void> {
  const existing = memoryTrips.get(tripId);
  const nowIso = new Date().toISOString();
  const distanceToCollege = calculateHaversineDistance(
    telemetry.latitude,
    telemetry.longitude,
    INITIAL_COLLEGE.lat,
    INITIAL_COLLEGE.lng
  );

  const updated: Trip = {
    ...(existing || {
      tripId,
      busId: 'bus_04',
      busNumber: 'BUS-04',
      driverId: 'driver',
      routeId: 'route_07',
      startTime: nowIso,
    }),
    latestLatitude: telemetry.latitude,
    latestLongitude: telemetry.longitude,
    latestAccuracyMeters: telemetry.accuracyMeters ?? existing?.latestAccuracyMeters ?? 10,
    latestSpeedKmh: telemetry.speedKmh !== undefined ? telemetry.speedKmh : existing?.latestSpeedKmh ?? 0,
    latestHeading: telemetry.heading !== undefined ? telemetry.heading : existing?.latestHeading ?? 0,
    status: telemetry.status || existing?.status || 'ACTIVE',
    recoveryState: telemetry.recoveryState !== undefined ? telemetry.recoveryState : existing?.recoveryState ?? null,
    lastLocationUpdate: nowIso,
    distanceToCollegeMeters: distanceToCollege,
  };

  memoryTrips.set(tripId, updated);
  notifyTripSubscribers(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        latestLatitude: telemetry.latitude,
        latestLongitude: telemetry.longitude,
        latestAccuracyMeters: updated.latestAccuracyMeters,
        latestSpeedKmh: updated.latestSpeedKmh,
        latestHeading: updated.latestHeading,
        status: updated.status,
        recoveryState: updated.recoveryState,
        lastLocationUpdate: nowIso,
        distanceToCollegeMeters: distanceToCollege,
      });
    } catch (err) {
      console.warn('[TripService] Firestore update error:', err);
    }
  }
}

/**
 * Ends a trip and marks the bus as IDLE.
 */
export async function endTrip(tripId: string, busId?: string): Promise<void> {
  const existing = memoryTrips.get(tripId);
  const nowIso = new Date().toISOString();

  if (existing) {
    existing.status = 'COMPLETED';
    existing.endTime = nowIso;
    existing.recoveryState = null;
    notifyTripSubscribers(existing);
  }

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status: 'COMPLETED',
        endTime: nowIso,
        recoveryState: null,
      });
      if (busId) {
        await updateDoc(doc(db, 'buses', busId), {
          status: 'IDLE',
          currentTripId: null,
        });
      }
    } catch (err) {
      console.warn('[TripService] Firestore endTrip error:', err);
    }
  }
}

/**
 * Subscribes to real-time updates for a specific trip.
 */
export function subscribeToTrip(tripId: string, onUpdate: TripListener): Unsubscribe {
  // Always immediately provide current memory state if present
  if (memoryTrips.has(tripId)) {
    onUpdate({ ...memoryTrips.get(tripId)! });
  }

  if (isFirebaseConfigured() && db) {
    try {
      const tripRef = doc(db, 'trips', tripId);
      return onSnapshot(
        tripRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Trip;
            memoryTrips.set(tripId, data);
            onUpdate(data);
          } else {
            onUpdate(null);
          }
        },
        (error) => {
          console.warn('[TripService] Trip subscription error:', error);
          if (memoryTrips.has(tripId)) {
            onUpdate({ ...memoryTrips.get(tripId)! });
          }
        }
      );
    } catch (err) {
      console.warn('[TripService] Firestore subscription fallback to memory:', err);
    }
  }

  // Fallback memory subscription
  if (!tripSubscribers.has(tripId)) {
    tripSubscribers.set(tripId, new Set());
  }
  const set = tripSubscribers.get(tripId)!;
  set.add(onUpdate);

  return () => {
    set.delete(onUpdate);
  };
}

/**
 * Subscribes to all active trips across the fleet (for Admin view).
 */
export function subscribeToActiveTrips(onUpdate: MultiTripsListener): Unsubscribe {
  const allActive = Array.from(memoryTrips.values()).filter(
    (t) => t.status === 'ACTIVE' || t.status === 'STARTING' || t.status === 'ARRIVED'
  );
  onUpdate(allActive);

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'trips'), where('status', 'in', ['ACTIVE', 'STARTING', 'ARRIVED']));
      return onSnapshot(
        q,
        (snapshot) => {
          const trips: Trip[] = [];
          snapshot.forEach((docSnap) => {
            trips.push(docSnap.data() as Trip);
          });
          trips.forEach((t) => memoryTrips.set(t.tripId, t));
          onUpdate(trips);
        },
        (error) => {
          console.warn('[TripService] Active trips subscription error:', error);
        }
      );
    } catch (err) {
      console.warn('[TripService] Active trips fallback to memory:', err);
    }
  }

  activeTripsSubscribers.add(onUpdate);
  return () => {
    activeTripsSubscribers.delete(onUpdate);
  };
}
