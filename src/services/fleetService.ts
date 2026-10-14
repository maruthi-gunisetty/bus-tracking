import {
  collection,
  doc,
  setDoc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { Bus, BusRoute, PickupPoint, CollegeDestination } from '../types';
import {
  INITIAL_BUSES,
  INITIAL_ROUTE,
  INITIAL_PICKUP_POINTS,
  INITIAL_COLLEGE,
} from '../config/routeData';

// In-memory fleet storage
let currentBuses: Bus[] = [...INITIAL_BUSES];
let currentRoutes: BusRoute[] = [INITIAL_ROUTE];
let currentStops: PickupPoint[] = [...INITIAL_PICKUP_POINTS];
let currentCollege: CollegeDestination = { ...INITIAL_COLLEGE };

type FleetListener = () => void;
const fleetListeners = new Set<FleetListener>();

function notifyFleet() {
  fleetListeners.forEach((fn) => fn());
}

export function subscribeToFleet(listener: FleetListener): Unsubscribe {
  fleetListeners.add(listener);
  return () => {
    fleetListeners.delete(listener);
  };
}

export async function getFleetBuses(): Promise<Bus[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'buses'));
      if (!snap.empty) {
        currentBuses = snap.docs.map((d) => d.data() as Bus);
      }
    } catch (err) {
      console.warn('[FleetService] Error fetching buses from Firestore:', err);
    }
  }
  return [...currentBuses];
}

export async function addBus(bus: Bus): Promise<void> {
  currentBuses = [bus, ...currentBuses.filter((b) => b.busId !== bus.busId)];
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'buses', bus.busId), bus);
    } catch (err) {
      console.warn('[FleetService] Error adding bus to Firestore:', err);
    }
  }
}

export async function updateBusDriver(busId: string, driverId: string, driverName: string): Promise<void> {
  currentBuses = currentBuses.map((b) =>
    b.busId === busId
      ? { ...b, assignedDriverId: driverId, assignedDriverName: driverName }
      : b
  );
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'buses', busId), { assignedDriverId: driverId, assignedDriverName: driverName }, { merge: true });
    } catch (err) {
      console.warn('[FleetService] Error updating bus driver in Firestore:', err);
    }
  }
}

export function getPickupPoints(): PickupPoint[] {
  return [...currentStops];
}

export async function addPickupPoint(stop: PickupPoint): Promise<void> {
  currentStops = [...currentStops, stop];
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'pickupPoints', stop.pickupPointId), stop);
    } catch (err) {
      console.warn('[FleetService] Error saving pickup point to Firestore:', err);
    }
  }
}

export function getCollegeDestination(): CollegeDestination {
  return { ...currentCollege };
}

export async function updateCollegeRadius(radiusMeters: number): Promise<void> {
  currentCollege = { ...currentCollege, arrivalRadiusMeters: radiusMeters };
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'settings', 'collegeDestination'), currentCollege, { merge: true });
    } catch (err) {
      console.warn('[FleetService] Error saving college destination to Firestore:', err);
    }
  }
}

export function getRoutes(): BusRoute[] {
  return [...currentRoutes];
}
