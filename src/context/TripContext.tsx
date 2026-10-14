import React, { useState, useEffect } from 'react';
import type { Trip, Bus, PickupPoint, CollegeDestination } from '../types';
import { subscribeToTrip, subscribeToActiveTrips, startTrip, endTrip, updateTripTelemetry } from '../services/tripService';
import { getFleetBuses, getPickupPoints, getCollegeDestination, subscribeToFleet } from '../services/fleetService';
import { ROUTE_7_WAYPOINTS } from '../config/routeData';
import { TripContext } from './tripContextDef';

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [collegeDestination, setCollegeDestination] = useState<CollegeDestination>(getCollegeDestination());
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('bus_04');
  const [selectedStopId, setSelectedStopId] = useState<string>('stop_03');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Load initial fleet and listen for updates
  useEffect(() => {
    const refreshFleet = async () => {
      const busList = await getFleetBuses();
      setBuses(busList);
      setPickupPoints(getPickupPoints());
      setCollegeDestination(getCollegeDestination());
    };

    refreshFleet();
    const unsubFleet = subscribeToFleet(refreshFleet);
    return unsubFleet;
  }, []);

  // Listen to active trips
  useEffect(() => {
    const unsub = subscribeToActiveTrips((trips) => {
      setActiveTrips(trips);
    });
    return unsub;
  }, []);

  // Subscribe to current selected bus trip
  useEffect(() => {
    const selectedBus = buses.find((b) => b.busId === selectedBusId);
    const targetTripId = selectedBus?.currentTripId || 'trip_demo_04';

    const unsub = subscribeToTrip(targetTripId, (trip) => {
      setCurrentTrip(trip);
    });

    return unsub;
  }, [selectedBusId, buses]);

  const handleStartDriverTrip = async (busId: string, driverId: string, driverName?: string) => {
    const bus = buses.find((b) => b.busId === busId);
    const tripId = await startTrip({
      busId,
      busNumber: bus?.busNumber || 'BUS-04',
      driverId,
      driverName: driverName || bus?.assignedDriverName || 'Driver',
      routeId: bus?.routeId || 'route_07',
    });
    return tripId;
  };

  const handleEndDriverTrip = async (tripId: string, busId?: string) => {
    await endTrip(tripId, busId);
  };

  const handleUpdateDriverTelemetry = async (
    tripId: string,
    telemetry: {
      latitude: number;
      longitude: number;
      accuracyMeters?: number;
      speedKmh?: number | null;
      heading?: number | null;
    }
  ) => {
    await updateTripTelemetry(tripId, telemetry);
  };

  return (
    <TripContext.Provider
      value={{
        buses,
        pickupPoints,
        collegeDestination,
        activeTrips,
        currentTrip,
        selectedBusId,
        setSelectedBusId,
        selectedStopId,
        setSelectedStopId,
        startDriverTrip: handleStartDriverTrip,
        endDriverTrip: handleEndDriverTrip,
        updateDriverTelemetry: handleUpdateDriverTelemetry,
        route7Waypoints: ROUTE_7_WAYPOINTS,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
