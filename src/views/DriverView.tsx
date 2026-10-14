import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Navigation, 
  Gauge, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Users, 
  ShieldAlert,
  MapPin,
  RefreshCw,
  Sun
} from 'lucide-react';
import type { RecoveryState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDistance } from '../utils/haversine';
import { useTripContext } from '../context/useTripContext';
import { useDriverGeolocation } from '../hooks/useDriverGeolocation';
import { demoSimulator, type SimulatorState } from '../services/demoSimulator';
import { DemoSimulatorControls } from '../components/common/DemoSimulatorControls';

interface DriverViewProps {
  isDemo: boolean;
}

export const DriverView: React.FC<DriverViewProps> = ({ isDemo }) => {
  const { buses, collegeDestination, startDriverTrip, endDriverTrip, currentTrip } = useTripContext();
  const assignedBus = buses.find((b) => b.busId === 'bus_04') || {
    busId: 'bus_04',
    busNumber: 'BUS-04',
    routeId: 'route_07',
    assignedDriverName: 'Ramesh K. (Senior Driver)',
  };

  const [activeTripId, setActiveTripId] = useState<string | null>(assignedBus.busId ? 'trip_demo_04' : null);
  const [simState, setSimState] = useState<SimulatorState>(demoSimulator.getState());

  // Subscribe to demo simulator if isDemo is active
  useEffect(() => {
    if (!isDemo) return;
    const unsub = demoSimulator.subscribe((s) => {
      setSimState(s);
    });
    return unsub;
  }, [isDemo]);

  // Real smartphone GPS hook
  const {
    state: geoState,
    startTracking,
    stopTracking,
  } = useDriverGeolocation({
    tripId: activeTripId,
    busId: assignedBus.busId,
    collegeDestination,
    isDemo,
    onArrival: () => {
      console.log('Driver reached college arrival geofence!');
    },
  });

  // Effective status, speed, accuracy, and distance based on demo vs real GPS
  const effectiveStatus = isDemo
    ? simState.tripStatus
    : currentTrip?.status || geoState.tripStatus;

  const effectiveSpeed = isDemo
    ? simState.speedKmh
    : geoState.speedKmh ?? currentTrip?.latestSpeedKmh ?? 0;

  const effectiveAccuracy = isDemo
    ? 10
    : geoState.accuracy ?? currentTrip?.latestAccuracyMeters ?? null;

  const effectiveDistanceToCollege = isDemo
    ? simState.distanceToCollege
    : geoState.distanceToCollege ?? currentTrip?.distanceToCollegeMeters ?? null;

  const effectiveRecoveryState: RecoveryState | null = isDemo
    ? null
    : geoState.recoveryState || currentTrip?.recoveryState || null;

  const handleStartTrip = async () => {
    const tripId = await startDriverTrip(
      assignedBus.busId,
      'driver_ramesh',
      assignedBus.assignedDriverName
    );
    setActiveTripId(tripId);

    if (isDemo) {
      await demoSimulator.start();
    } else {
      startTracking();
    }
  };

  const handleEndTrip = async () => {
    if (activeTripId) {
      await endDriverTrip(activeTripId, assignedBus.busId);
    }
    if (isDemo) {
      demoSimulator.pause();
    } else {
      stopTracking();
    }
  };

  const handleResetTrip = () => {
    if (isDemo) {
      demoSimulator.reset();
    } else {
      stopTracking();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Demo Controls Header if in simulation mode */}
      <DemoSimulatorControls isDemo={isDemo} />

      {/* Assigned Bus Banner */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Vehicle</span>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{assignedBus.busNumber}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                ACTIVE SHIFT
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Route 7 - Downtown & Central Ring</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Subscribed</span>
            <div className="flex items-center justify-end space-x-1 text-emerald-400 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>18 students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Status Indicator Banner */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Lifecycle State</span>
          {effectiveStatus === 'NOT_STARTED' && (
            <StatusBadge variant="info" text="TRIP NOT STARTED" />
          )}
          {effectiveStatus === 'STARTING' && (
            <StatusBadge variant="warning" text="ACQUIRING GPS..." pulse />
          )}
          {effectiveStatus === 'ACTIVE' && (
            <StatusBadge variant="ok" text="TRIP ACTIVE (PUBLISHING)" pulse />
          )}
          {effectiveStatus === 'ARRIVED' && (
            <StatusBadge variant="ok" text="BUS REACHED COLLEGE" />
          )}
          {effectiveStatus === 'COMPLETED' && (
            <StatusBadge variant="info" text="TRIP COMPLETED" />
          )}
        </div>

        {/* Warning / Recovery Alert if triggered */}
        {effectiveRecoveryState && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center space-x-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>State: {effectiveRecoveryState}.</strong> Please keep screen on and grant location permissions.
            </span>
          </div>
        )}

        {/* Large Driver Controls */}
        <div className="pt-2">
          {effectiveStatus === 'NOT_STARTED' && (
            <button
              onClick={handleStartTrip}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
            >
              <Play className="w-7 h-7 fill-white" />
              <span>START TRIP</span>
            </button>
          )}

          {effectiveStatus === 'ACTIVE' && (
            <div className="space-y-3">
              <button
                onClick={handleEndTrip}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-rose-900/30 flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
              >
                <Square className="w-6 h-6 fill-white" />
                <span>END TRIP</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Pressing END TRIP stops GPS publishing and notifies all subscribed students.
              </p>
            </div>
          )}

          {(effectiveStatus === 'COMPLETED' || effectiveStatus === 'ARRIVED') && (
            <button
              onClick={handleResetTrip}
              className="w-full py-4 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 border border-navy-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ready for Next Shift / Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Driver Real-Time Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Speed */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span>Speed</span>
          </div>
          <div className="text-xl font-black text-white">
            {effectiveStatus === 'ACTIVE' ? `${effectiveSpeed} km/h` : '--'}
          </div>
        </div>

        {/* GPS Accuracy */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPS Fix</span>
          </div>
          <div className="text-xl font-black text-white">
            {effectiveStatus === 'ACTIVE' && effectiveAccuracy !== null ? `±${effectiveAccuracy} m` : '--'}
          </div>
        </div>

        {/* Distance Remaining to College */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>To Campus</span>
          </div>
          <div className="text-xl font-black text-white">
            {effectiveStatus === 'ACTIVE' || effectiveStatus === 'ARRIVED'
              ? formatDistance(effectiveDistanceToCollege)
              : '--'}
          </div>
        </div>

        {/* Last Location Update / WakeLock */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Screen Wake</span>
          </div>
          <div className="text-xs font-bold mt-1.5 flex items-center justify-center space-x-1">
            {geoState.wakeLockActive ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <Sun className="w-3 h-3 animate-spin" />
                <span>Locked ON</span>
              </span>
            ) : (
              <span className="text-slate-400">Standby</span>
            )}
          </div>
        </div>
      </div>

      {/* Driver Instructions & Emergency */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 flex items-start space-x-3">
          <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Screen Wake Lock active: Keeps mobile browser screen alive and preserves GPS precision without battery throttling.
          </span>
        </div>

        <button
          onClick={() => alert('Emergency / Breakdown assistance alert signaled to college transport control room.')}
          className="p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Report Breakdown / Delay</span>
        </button>
      </div>
    </div>
  );
};
