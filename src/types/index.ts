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

export interface StudentRecord {
  id: string;
  studentId: string;
  fullName: string;
  regNumber: string;
  loginIdentifier: string;
  assignedBusId: string;
  assignedBusNumber: string;
  assignedRouteId: string;
  pickupPointId: string;
  pickupPointName: string;
  accountStatus: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
}

export interface DriverRecord {
  id: string;
  driverId: string;
  fullName: string;
  loginIdentifier: string;
  phone: string;
  licenseNumber: string;
  assignedBusId: string;
  assignedBusNumber: string;
  assignedRouteId: string;
  accountStatus: 'ACTIVE' | 'DEACTIVATED';
  currentTripStatus: TripStatus;
  createdAt: string;
}

export interface AuditLogEvent {
  eventId: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  affectedRecord: string;
  details: string;
  timestamp: string;
}

export interface AdminSettings {
  collegeName: string;
  destinationLat: number;
  destinationLng: number;
  arrivalRadiusMeters: number;
  defaultThresholdsKm: number[];
  allowBackgroundGpsNote: boolean;
  operationalStatus: 'ACTIVE' | 'MAINTENANCE';
}

export interface AuthState {
  user: AppUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
}

