import {
  collection,
  doc,
  setDoc,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type {
  Bus,
  BusRoute,
  PickupPoint,
  CollegeDestination,
  StudentRecord,
  DriverRecord,
  AuditLogEvent,
  AdminSettings,
} from '../types';
import {
  INITIAL_BUSES,
  INITIAL_ROUTE,
  INITIAL_PICKUP_POINTS,
  INITIAL_COLLEGE,
} from '../config/routeData';

const STORAGE_KEYS = {
  BUSES: 'anshary_buses',
  ROUTES: 'anshary_routes',
  STOPS: 'anshary_stops',
  COLLEGE: 'anshary_college',
  STUDENTS: 'anshary_students',
  DRIVERS: 'anshary_drivers',
  AUDIT: 'anshary_audit',
  SETTINGS: 'anshary_settings',
  PROVISIONED_USERS: 'anshary_provisioned_users',
};

// Seed sample students
const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'std_01',
    studentId: 'STU-2024-001',
    fullName: 'Priya Sharma',
    regNumber: '21CS042',
    loginIdentifier: 'student@123',
    assignedBusId: 'bus_04',
    assignedBusNumber: 'BUS-04',
    assignedRouteId: 'route_07',
    pickupPointId: 'stop_03',
    pickupPointName: 'Stop 3: Market Junction Circle',
    accountStatus: 'ACTIVE',
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'std_02',
    studentId: 'STU-2024-015',
    fullName: 'Ananya Reddy',
    regNumber: '22EC018',
    loginIdentifier: 'ananya.reddy@anshary.edu',
    assignedBusId: 'bus_04',
    assignedBusNumber: 'BUS-04',
    assignedRouteId: 'route_07',
    pickupPointId: 'stop_02',
    pickupPointName: 'Stop 2: Jubilee Hills Checkpost',
    accountStatus: 'ACTIVE',
    createdAt: '2026-09-02T10:15:00.000Z',
  },
  {
    id: 'std_03',
    studentId: 'STU-2024-032',
    fullName: 'Sneha Patel',
    regNumber: '23IT009',
    loginIdentifier: 'sneha.patel@anshary.edu',
    assignedBusId: 'bus_01',
    assignedBusNumber: 'BUS-01',
    assignedRouteId: 'route_01',
    pickupPointId: 'stop_01',
    pickupPointName: 'Stop 1: Central Station Hub',
    accountStatus: 'ACTIVE',
    createdAt: '2026-09-05T11:45:00.000Z',
  },
];

// Seed sample drivers
const INITIAL_DRIVERS: DriverRecord[] = [
  {
    id: 'drv_01',
    driverId: 'DRV-101',
    fullName: 'Ramesh K.',
    loginIdentifier: 'driver@123',
    phone: '+91 98765 43210',
    licenseNumber: 'AP-09-2015-8849',
    assignedBusId: 'bus_04',
    assignedBusNumber: 'BUS-04',
    assignedRouteId: 'route_07',
    accountStatus: 'ACTIVE',
    currentTripStatus: 'ACTIVE',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'drv_02',
    driverId: 'DRV-102',
    fullName: 'Suresh M.',
    loginIdentifier: 'suresh.m@anshary.edu',
    phone: '+91 98765 43211',
    licenseNumber: 'TS-10-2017-1092',
    assignedBusId: 'bus_01',
    assignedBusNumber: 'BUS-01',
    assignedRouteId: 'route_01',
    accountStatus: 'ACTIVE',
    currentTripStatus: 'NOT_STARTED',
    createdAt: '2026-08-20T14:20:00.000Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEvent[] = [
  {
    eventId: 'aud_01',
    actor: 'admin@123',
    actorRole: 'admin',
    action: 'SYSTEM_INITIALIZED',
    affectedRecord: 'SYSTEM',
    details: 'ANSHARY Bus Tracker fleet system deployed with standard college route parameters.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    eventId: 'aud_02',
    actor: 'admin@123',
    actorRole: 'admin',
    action: 'BUS_ASSIGNED',
    affectedRecord: 'BUS-04',
    details: 'Assigned Driver Ramesh K. to BUS-04 on Route 7 Downtown & Central Ring.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore
  }
}

// In-memory initialized from storage or defaults
let currentBuses: Bus[] = loadFromStorage(STORAGE_KEYS.BUSES, [...INITIAL_BUSES]);
let currentRoutes: BusRoute[] = loadFromStorage(STORAGE_KEYS.ROUTES, [INITIAL_ROUTE]);
let currentStops: PickupPoint[] = loadFromStorage(STORAGE_KEYS.STOPS, [...INITIAL_PICKUP_POINTS]);
let currentCollege: CollegeDestination = loadFromStorage(STORAGE_KEYS.COLLEGE, { ...INITIAL_COLLEGE });
let currentStudents: StudentRecord[] = loadFromStorage(STORAGE_KEYS.STUDENTS, [...INITIAL_STUDENTS]);
let currentDrivers: DriverRecord[] = loadFromStorage(STORAGE_KEYS.DRIVERS, [...INITIAL_DRIVERS]);
let currentAuditLogs: AuditLogEvent[] = loadFromStorage(STORAGE_KEYS.AUDIT, [...INITIAL_AUDIT_LOGS]);
let currentSettings: AdminSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, {
  collegeName: 'Anshary College Campus',
  destinationLat: INITIAL_COLLEGE.lat,
  destinationLng: INITIAL_COLLEGE.lng,
  arrivalRadiusMeters: INITIAL_COLLEGE.arrivalRadiusMeters,
  defaultThresholdsKm: [5, 3, 2, 1, 0.2],
  allowBackgroundGpsNote: true,
  operationalStatus: 'ACTIVE',
});

// Sync provisioned users so authService can validate logins
function syncProvisionedUsers() {
  const users = [
    ...currentStudents.map((s) => ({
      ...s,
      role: 'student',
    })),
    ...currentDrivers.map((d) => ({
      ...d,
      role: 'driver',
    })),
  ];
  saveToStorage(STORAGE_KEYS.PROVISIONED_USERS, users);
}
syncProvisionedUsers();

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

// --- BUS MANAGEMENT ---
export async function getFleetBuses(): Promise<Bus[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'buses'));
      if (!snap.empty) {
        currentBuses = snap.docs.map((d) => d.data() as Bus);
        saveToStorage(STORAGE_KEYS.BUSES, currentBuses);
      }
    } catch (err) {
      console.warn('[FleetService] Firestore fetch error:', err);
    }
  }
  return [...currentBuses];
}

export async function addBus(bus: Bus): Promise<void> {
  currentBuses = [bus, ...currentBuses.filter((b) => b.busId !== bus.busId)];
  saveToStorage(STORAGE_KEYS.BUSES, currentBuses);
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'BUS_CREATED',
    affectedRecord: bus.busNumber,
    details: `Created bus ${bus.busNumber} assigned to route ${bus.routeId}`,
  });
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'buses', bus.busId), bus);
    } catch (err) {
      console.warn('[FleetService] Error saving bus to Firestore:', err);
    }
  }
}

export async function updateBusDriver(busId: string, driverId: string, driverName: string): Promise<void> {
  currentBuses = currentBuses.map((b) =>
    b.busId === busId
      ? { ...b, assignedDriverId: driverId, assignedDriverName: driverName }
      : b
  );
  saveToStorage(STORAGE_KEYS.BUSES, currentBuses);
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'BUS_DRIVER_UPDATED',
    affectedRecord: busId,
    details: `Updated driver for ${busId} to ${driverName}`,
  });
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'buses', busId), { assignedDriverId: driverId, assignedDriverName: driverName }, { merge: true });
    } catch (err) {
      console.warn('[FleetService] Firestore update error:', err);
    }
  }
}

export async function toggleBusStatus(busId: string): Promise<void> {
  currentBuses = currentBuses.map((b) =>
    b.busId === busId
      ? { ...b, status: b.status === 'ACTIVE' ? 'IDLE' : 'ACTIVE' }
      : b
  );
  saveToStorage(STORAGE_KEYS.BUSES, currentBuses);
  notifyFleet();
}

// --- ROUTES & STOPS ---
export function getRoutes(): BusRoute[] {
  return [...currentRoutes];
}

export async function addRoute(route: BusRoute): Promise<void> {
  currentRoutes = [route, ...currentRoutes.filter((r) => r.routeId !== route.routeId)];
  saveToStorage(STORAGE_KEYS.ROUTES, currentRoutes);
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'ROUTE_CREATED',
    affectedRecord: route.routeName,
    details: `Added new route: ${route.routeName} (${route.startPoint} -> ${route.endPoint})`,
  });
  notifyFleet();
}

export function getPickupPoints(): PickupPoint[] {
  return [...currentStops];
}

export async function addPickupPoint(stop: PickupPoint): Promise<void> {
  currentStops = [...currentStops.filter((s) => s.pickupPointId !== stop.pickupPointId), stop];
  saveToStorage(STORAGE_KEYS.STOPS, currentStops);
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'STOP_CREATED',
    affectedRecord: stop.name,
    details: `Created pickup stop: ${stop.name} on ${stop.routeId} at [${stop.lat}, ${stop.lng}]`,
  });
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'pickupPoints', stop.pickupPointId), stop);
    } catch (err) {
      console.warn('[FleetService] Firestore stop save error:', err);
    }
  }
}

export async function deletePickupPoint(stopId: string): Promise<void> {
  currentStops = currentStops.filter((s) => s.pickupPointId !== stopId);
  saveToStorage(STORAGE_KEYS.STOPS, currentStops);
  notifyFleet();
}

// --- STUDENT MANAGEMENT ---
export function getStudents(): StudentRecord[] {
  return [...currentStudents];
}

export async function addStudent(student: Omit<StudentRecord, 'id' | 'createdAt'>): Promise<StudentRecord> {
  const newStudent: StudentRecord = {
    ...student,
    id: `std_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  currentStudents = [newStudent, ...currentStudents];
  saveToStorage(STORAGE_KEYS.STUDENTS, currentStudents);
  syncProvisionedUsers();

  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'STUDENT_PROVISIONED',
    affectedRecord: newStudent.studentId,
    details: `Created student account for ${newStudent.fullName} (${newStudent.regNumber}) assigned to ${newStudent.assignedBusNumber}`,
  });

  notifyFleet();
  return newStudent;
}

export async function toggleStudentStatus(studentId: string): Promise<void> {
  currentStudents = currentStudents.map((s) =>
    s.id === studentId || s.studentId === studentId
      ? { ...s, accountStatus: s.accountStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE' }
      : s
  );
  saveToStorage(STORAGE_KEYS.STUDENTS, currentStudents);
  syncProvisionedUsers();
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'STUDENT_STATUS_TOGGLED',
    affectedRecord: studentId,
    details: `Toggled status for student ${studentId}`,
  });
  notifyFleet();
}

export async function deleteStudent(studentId: string): Promise<void> {
  currentStudents = currentStudents.filter((s) => s.id !== studentId && s.studentId !== studentId);
  saveToStorage(STORAGE_KEYS.STUDENTS, currentStudents);
  syncProvisionedUsers();
  notifyFleet();
}

// --- DRIVER MANAGEMENT ---
export function getDrivers(): DriverRecord[] {
  return [...currentDrivers];
}

export async function addDriver(driver: Omit<DriverRecord, 'id' | 'createdAt'>): Promise<DriverRecord> {
  const newDriver: DriverRecord = {
    ...driver,
    id: `drv_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  currentDrivers = [newDriver, ...currentDrivers];
  saveToStorage(STORAGE_KEYS.DRIVERS, currentDrivers);
  syncProvisionedUsers();

  // If assigned a bus, reflect in buses list
  if (driver.assignedBusId) {
    currentBuses = currentBuses.map((b) =>
      b.busId === driver.assignedBusId
        ? { ...b, assignedDriverId: newDriver.driverId, assignedDriverName: newDriver.fullName }
        : b
    );
    saveToStorage(STORAGE_KEYS.BUSES, currentBuses);
  }

  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'DRIVER_PROVISIONED',
    affectedRecord: newDriver.driverId,
    details: `Created driver account for ${newDriver.fullName} (${newDriver.licenseNumber}) assigned to ${newDriver.assignedBusNumber}`,
  });

  notifyFleet();
  return newDriver;
}

export async function toggleDriverStatus(driverId: string): Promise<void> {
  currentDrivers = currentDrivers.map((d) =>
    d.id === driverId || d.driverId === driverId
      ? { ...d, accountStatus: d.accountStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE' }
      : d
  );
  saveToStorage(STORAGE_KEYS.DRIVERS, currentDrivers);
  syncProvisionedUsers();
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'DRIVER_STATUS_TOGGLED',
    affectedRecord: driverId,
    details: `Toggled status for driver ${driverId}`,
  });
  notifyFleet();
}

// --- AUDIT LOGS ---
export function getAuditLogs(): AuditLogEvent[] {
  return [...currentAuditLogs];
}

export function addAuditLog(event: Omit<AuditLogEvent, 'eventId' | 'timestamp'>): void {
  const newEvent: AuditLogEvent = {
    ...event,
    eventId: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  currentAuditLogs = [newEvent, ...currentAuditLogs.slice(0, 49)];
  saveToStorage(STORAGE_KEYS.AUDIT, currentAuditLogs);
  notifyFleet();
}

// --- COLLEGE & SETTINGS ---
export function getCollegeDestination(): CollegeDestination {
  return { ...currentCollege };
}

export async function updateCollegeRadius(radiusMeters: number): Promise<void> {
  currentCollege = { ...currentCollege, arrivalRadiusMeters: radiusMeters };
  currentSettings.arrivalRadiusMeters = radiusMeters;
  saveToStorage(STORAGE_KEYS.COLLEGE, currentCollege);
  saveToStorage(STORAGE_KEYS.SETTINGS, currentSettings);
  notifyFleet();

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'settings', 'collegeDestination'), currentCollege, { merge: true });
    } catch (err) {
      console.warn('[FleetService] Firestore radius save error:', err);
    }
  }
}

export function getAdminSettings(): AdminSettings {
  return { ...currentSettings };
}

export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
  currentSettings = { ...currentSettings, ...settings };
  if (settings.arrivalRadiusMeters) {
    currentCollege.arrivalRadiusMeters = settings.arrivalRadiusMeters;
  }
  if (settings.destinationLat && settings.destinationLng) {
    currentCollege.lat = settings.destinationLat;
    currentCollege.lng = settings.destinationLng;
  }
  if (settings.collegeName) {
    currentCollege.name = settings.collegeName;
  }
  saveToStorage(STORAGE_KEYS.SETTINGS, currentSettings);
  saveToStorage(STORAGE_KEYS.COLLEGE, currentCollege);
  addAuditLog({
    actor: 'admin',
    actorRole: 'admin',
    action: 'SETTINGS_UPDATED',
    affectedRecord: 'SYSTEM_SETTINGS',
    details: 'Administrator updated system settings and arrival radius.',
  });
  notifyFleet();
}
