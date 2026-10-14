import { createContext } from 'react';
import type { Trip, Bus, PickupPoint, CollegeDestination } from '../types';

export interface TripContextType {
  buses: Bus[];
  pickupPoints: PickupPoint[];
  collegeDestination: CollegeDestination;
  activeTrips: Trip[];
  currentTrip: Trip | null;
  selectedBusId: string;
  setSelectedBusId: (busId: string) => void;
  selectedStopId: string;
  setSelectedStopId: (stopId: string) => void;
  startDriverTrip: (busId: string, driverId: string, driverName?: string) => Promise<string>;
  endDriverTrip: (tripId: string, busId?: string) => Promise<void>;
  updateDriverTelemetry: (
    tripId: string,
    telemetry: {
      latitude: number;
      longitude: number;
      accuracyMeters?: number;
      speedKmh?: number | null;
      heading?: number | null;
    }
  ) => Promise<void>;
  route7Waypoints: [number, number][];
}

export const TripContext = createContext<TripContextType | undefined>(undefined);
