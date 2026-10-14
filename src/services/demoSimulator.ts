import { ROUTE_7_WAYPOINTS, INITIAL_COLLEGE, INITIAL_PICKUP_POINTS } from '../config/routeData';
import { updateTripTelemetry, endTrip, startTrip } from './tripService';
import { calculateHaversineDistance, toRadians } from '../utils/haversine';
import type { TripStatus } from '../types';

export interface SimulatorState {
  isRunning: boolean;
  currentIndex: number;
  speedMultiplier: number;
  totalWaypoints: number;
  currentLat: number;
  currentLng: number;
  speedKmh: number;
  heading: number;
  distanceToCollege: number;
  tripStatus: TripStatus;
}

type SimulatorListener = (state: SimulatorState) => void;

class DemoSimulator {
  private timerId: number | null = null;
  private waypoints = ROUTE_7_WAYPOINTS;
  private currentIndex = 0;
  private isRunning = false;
  private speedMultiplier = 1;
  private currentTripId = 'trip_demo_04';
  private listeners = new Set<SimulatorListener>();

  constructor() {
    this.currentIndex = 4; // Start near Stop 2 by default
  }

  public subscribe(listener: SimulatorListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState(): SimulatorState {
    const point = this.waypoints[this.currentIndex] || this.waypoints[0];
    const nextPoint = this.waypoints[Math.min(this.currentIndex + 1, this.waypoints.length - 1)];
    const heading = this.calculateBearing(point[0], point[1], nextPoint[0], nextPoint[1]);
    const distanceToCollege = calculateHaversineDistance(
      point[0],
      point[1],
      INITIAL_COLLEGE.lat,
      INITIAL_COLLEGE.lng
    );

    let status: TripStatus = 'ACTIVE';
    if (this.currentIndex >= this.waypoints.length - 1) {
      status = 'ARRIVED';
    } else if (this.currentIndex === 0 && !this.isRunning) {
      status = 'NOT_STARTED';
    }

    return {
      isRunning: this.isRunning,
      currentIndex: this.currentIndex,
      speedMultiplier: this.speedMultiplier,
      totalWaypoints: this.waypoints.length,
      currentLat: point[0],
      currentLng: point[1],
      speedKmh: this.isRunning ? Math.round(35 + Math.sin(this.currentIndex) * 8) : 0,
      heading,
      distanceToCollege,
      tripStatus: status,
    };
  }

  private calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const y = Math.sin(toRadians(lon2 - lon1)) * Math.cos(toRadians(lat2));
    const x =
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(toRadians(lon2 - lon1));
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;

    if (this.currentIndex >= this.waypoints.length - 1) {
      this.currentIndex = 0;
    }

    this.isRunning = true;
    this.currentTripId = await startTrip({
      busId: 'bus_04',
      busNumber: 'BUS-04',
      driverId: 'driver_ramesh',
      driverName: 'Ramesh K.',
      routeId: 'route_07',
      initialLat: this.waypoints[this.currentIndex][0],
      initialLng: this.waypoints[this.currentIndex][1],
    });

    this.scheduleNextStep();
    this.notify();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify();
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
    if (this.isRunning) {
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
      }
      this.scheduleNextStep();
    }
    this.notify();
  }

  public jumpToStop(stopSeq: number): void {
    const stop = INITIAL_PICKUP_POINTS.find((s) => s.sequenceNumber === stopSeq);
    if (!stop) return;

    // Find nearest waypoint index
    let closestIdx = 0;
    let minDistance = Infinity;
    this.waypoints.forEach(([lat, lng], idx) => {
      const d = calculateHaversineDistance(lat, lng, stop.lat, stop.lng);
      if (d < minDistance) {
        minDistance = d;
        closestIdx = idx;
      }
    });

    this.currentIndex = closestIdx;
    this.publishCurrentPoint();
    this.notify();
  }

  public reset(): void {
    this.pause();
    this.currentIndex = 0;
    endTrip(this.currentTripId, 'bus_04');
    this.publishCurrentPoint();
    this.notify();
  }

  private scheduleNextStep(): void {
    if (!this.isRunning) return;
    const baseIntervalMs = 2500;
    const interval = Math.max(300, Math.floor(baseIntervalMs / this.speedMultiplier));

    this.timerId = window.setTimeout(() => {
      this.step();
    }, interval);
  }

  private step(): void {
    if (!this.isRunning) return;

    if (this.currentIndex < this.waypoints.length - 1) {
      this.currentIndex += 1;
      this.publishCurrentPoint();
      this.notify();

      if (this.currentIndex < this.waypoints.length - 1) {
        this.scheduleNextStep();
      } else {
        // Reached College Campus
        this.isRunning = false;
        this.notify();
      }
    } else {
      this.isRunning = false;
      this.notify();
    }
  }

  private publishCurrentPoint(): void {
    const state = this.getState();
    updateTripTelemetry(this.currentTripId, {
      latitude: state.currentLat,
      longitude: state.currentLng,
      speedKmh: state.speedKmh,
      heading: state.heading,
      accuracyMeters: 8 + Math.floor(Math.random() * 8),
      status: state.tripStatus,
    });
  }
}

export const demoSimulator = new DemoSimulator();
