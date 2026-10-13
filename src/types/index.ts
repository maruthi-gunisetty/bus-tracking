export type UserRole = 'driver' | 'student' | 'admin';

export type TripStatus = 'NOT_STARTED' | 'STARTING' | 'ACTIVE' | 'ARRIVED' | 'COMPLETED';

export type RecoveryState = 
  | 'LOCATION_PERMISSION_DENIED'
  | 'GPS_UNAVAILABLE'
  | 'CONNECTION_LOST'
  | 'LOCATION_STALE';

export interface AppUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBusId?: string | null;
  collegeId?: string;
  active: boolean;
  createdAt?: string;
}

export interface CollegeDestination {
  name: string;
  lat: number;
  lng: number;
  arrivalRadiusMeters: number; // default 150m
}

export interface PickupPoint {
  pickupPointId: string;
  routeId: string;
  name: string;
  lat: number;
  lng: number;
  sequenceNumber: number;
}

export interface BusRoute {
  routeId: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  color?: string;
  active: boolean;
}

export interface Bus {
  busId: string;
  busNumber: string; // e.g. "BUS-04"
  routeId: string;
  assignedDriverId: string;
  assignedDriverName?: string;
  collegeDestination: CollegeDestination;
  status: 'IDLE' | 'ACTIVE';
  currentTripId?: string | null;
}

export interface Trip {
  tripId: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName?: string;
  routeId: string;
  status: TripStatus;
  recoveryState?: RecoveryState | null;
  startTime?: string | null;
  endTime?: string | null;
  latestLatitude?: number;
  latestLongitude?: number;
  latestAccuracyMeters?: number;
  latestSpeedKmh?: number | null;
  latestHeading?: number | null;
  lastLocationUpdate?: string | null; // ISO timestamp
  distanceToCollegeMeters?: number;
}

export interface StudentSubscription {
  studentId: string;
  busId: string;
  pickupPointId: string;
  notificationsEnabled: boolean;
  alertThresholdsKm: number[]; // e.g. [5, 3, 2, 1, 0.2]
  updatedAt?: string;
}

export interface AlertEvent {
  eventId: string; // studentId_tripId_threshold
  studentId: string;
  tripId: string;
  pickupPointId: string;
  thresholdKm: number;
  message: string;
  triggeredAt: string;
}
