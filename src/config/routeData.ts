import type { BusRoute, PickupPoint, CollegeDestination, Bus } from '../types';
import { DEFAULT_COLLEGE } from './constants';

export const INITIAL_COLLEGE: CollegeDestination = {
  ...DEFAULT_COLLEGE,
  name: "Anshary Engineering College Campus",
  lat: 17.385044,
  lng: 78.486671,
  arrivalRadiusMeters: 150,
};

export const INITIAL_ROUTE: BusRoute = {
  routeId: 'route_07',
  routeName: 'Route 7 - Downtown & Central Ring',
  startPoint: 'Central Station Terminal',
  endPoint: 'Anshary Engineering College Campus',
  color: '#0284c7', // Sky 600
  active: true,
};

export const INITIAL_PICKUP_POINTS: PickupPoint[] = [
  {
    pickupPointId: 'stop_01',
    routeId: 'route_07',
    name: 'Stop 1: Central Station Hub',
    lat: 17.4385,
    lng: 78.4420,
    sequenceNumber: 1,
  },
  {
    pickupPointId: 'stop_02',
    routeId: 'route_07',
    name: 'Stop 2: Jubilee Hills Checkpost',
    lat: 17.4230,
    lng: 78.4350,
    sequenceNumber: 2,
  },
  {
    pickupPointId: 'stop_03',
    routeId: 'route_07',
    name: 'Stop 3: Market Junction Circle',
    lat: 17.4050,
    lng: 78.4520,
    sequenceNumber: 3,
  },
  {
    pickupPointId: 'stop_04',
    routeId: 'route_07',
    name: 'Stop 4: Tech Park Crossroads',
    lat: 17.3940,
    lng: 78.4710,
    sequenceNumber: 4,
  },
];

export const INITIAL_BUSES: Bus[] = [
  {
    busId: 'bus_04',
    busNumber: 'BUS-04',
    routeId: 'route_07',
    assignedDriverId: 'driver_ramesh',
    assignedDriverName: 'Ramesh K. (Senior Driver)',
    collegeDestination: INITIAL_COLLEGE,
    status: 'ACTIVE',
    currentTripId: 'trip_demo_04',
  },
  {
    busId: 'bus_01',
    busNumber: 'BUS-01',
    routeId: 'route_01',
    assignedDriverId: 'driver_suresh',
    assignedDriverName: 'Suresh M.',
    collegeDestination: INITIAL_COLLEGE,
    status: 'IDLE',
    currentTripId: null,
  },
  {
    busId: 'bus_08',
    busNumber: 'BUS-08',
    routeId: 'route_03',
    assignedDriverId: 'driver_anand',
    assignedDriverName: 'Anand P.',
    collegeDestination: INITIAL_COLLEGE,
    status: 'IDLE',
    currentTripId: null,
  },
];

/**
 * Detailed waypoints along Route 7 for smooth polyline rendering and simulation navigation.
 */
export const ROUTE_7_WAYPOINTS: [number, number][] = [
  // Starting at Stop 1 (Central Station)
  [17.4385, 78.4420],
  [17.4350, 78.4400],
  [17.4310, 78.4380],
  [17.4270, 78.4365],
  // Stop 2 (Jubilee Hills)
  [17.4230, 78.4350],
  [17.4190, 78.4370],
  [17.4150, 78.4410],
  [17.4100, 78.4460],
  // Stop 3 (Market Junction)
  [17.4050, 78.4520],
  [17.4020, 78.4580],
  [17.3980, 78.4640],
  // Stop 4 (Tech Park Crossroads)
  [17.3940, 78.4710],
  [17.3910, 78.4760],
  [17.3880, 78.4810],
  // Arrival at College Campus
  [17.385044, 78.486671],
];
