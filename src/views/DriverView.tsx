import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Navigation, 
  Gauge, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Radio, 
  Users, 
  ShieldAlert,
  MapPin,
  RefreshCw
} from 'lucide-react';
import type { TripStatus, RecoveryState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDistance } from '../utils/haversine';

interface DriverViewProps {
  isDemo: boolean;
}

export const DriverView: React.FC<DriverViewProps> = ({ isDemo: _isDemo }) => {
  // Local state for the UI shell (to be wired to TripContext / useGeolocation in Stage 4)
  const [tripStatus, setTripStatus] = useState<TripStatus>('NOT_STARTED');
  const [recoveryState, setRecoveryState] = useState<RecoveryState | null>(null);
  const [mockSpeed] = useState<number>(36);
  const [mockAccuracy] = useState<number>(12);
  const [mockDistanceToCollege] = useState<number>(4200);
  const [lastUpdateSecondsAgo] = useState<number>(4);
  const [studentsSubscribed] = useState<number>(18);

  const assignedBus = {
    busNumber: "BUS-04",
    routeName: "Route 7 - Downtown & Central Ring",
    collegeDestinationName: "Anshary Engineering College Campus",
  };

  const handleStartTrip = () => {
    setTripStatus('ACTIVE');
    setRecoveryState(null);
  };

  const handleEndTrip = () => {
    setTripStatus('COMPLETED');
  };

  const handleResetTrip = () => {
    setTripStatus('NOT_STARTED');
    setRecoveryState(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
              <span>{assignedBus.routeName}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Subscribed</span>
            <div className="flex items-center justify-end space-x-1 text-emerald-400 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>{studentsSubscribed} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Status Indicator Banner */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Lifecycle State</span>
          {tripStatus === 'NOT_STARTED' && (
            <StatusBadge variant="info" text="TRIP NOT STARTED" />
          )}
          {tripStatus === 'STARTING' && (
            <StatusBadge variant="warning" text="ACQUIRING GPS..." pulse />
          )}
          {tripStatus === 'ACTIVE' && (
            <StatusBadge variant="ok" text="TRIP ACTIVE (PUBLISHING)" pulse />
          )}
          {tripStatus === 'ARRIVED' && (
            <StatusBadge variant="ok" text="BUS REACHED COLLEGE" />
          )}
          {tripStatus === 'COMPLETED' && (
            <StatusBadge variant="info" text="TRIP COMPLETED" />
          )}
        </div>

        {/* Warning / Recovery Alert if triggered */}
        {recoveryState && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center space-x-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>State: {recoveryState}. Please verify GPS and keep browser active.</span>
          </div>
        )}

        {/* Large Driver Controls */}
        <div className="pt-2">
          {tripStatus === 'NOT_STARTED' && (
            <button
              onClick={handleStartTrip}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
            >
              <Play className="w-7 h-7 fill-white" />
              <span>START TRIP</span>
            </button>
          )}

          {tripStatus === 'ACTIVE' && (
            <div className="space-y-3">
              <button
                onClick={handleEndTrip}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-lg sm:text-xl shadow-lg shadow-rose-900/30 flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
              >
                <Square className="w-6 h-6 fill-white" />
                <span>END TRIP</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Pressing END TRIP stops GPS publishing and resets student notifications.
              </p>
            </div>
          )}

          {(tripStatus === 'COMPLETED' || tripStatus === 'ARRIVED') && (
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
            {tripStatus === 'ACTIVE' ? `${mockSpeed} km/h` : '--'}
          </div>
        </div>

        {/* GPS Accuracy */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPS Fix</span>
          </div>
          <div className="text-xl font-black text-white">
            {tripStatus === 'ACTIVE' ? `±${mockAccuracy} m` : '--'}
          </div>
        </div>

        {/* Distance Remaining to College */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>To College</span>
          </div>
          <div className="text-xl font-black text-white">
            {tripStatus === 'ACTIVE' ? formatDistance(mockDistanceToCollege) : '--'}
          </div>
        </div>

        {/* Last Location Update */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-center">
          <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Updated</span>
          </div>
          <div className="text-xl font-black text-white">
            {tripStatus === 'ACTIVE' ? `${lastUpdateSecondsAgo}s ago` : '--'}
          </div>
        </div>
      </div>

      {/* Driver Instructions & Emergency */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 flex items-start space-x-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Screen on required: Mobile browsers throttle background GPS. Keep phone mounted on dashboard.
          </span>
        </div>

        <button
          onClick={() => alert('Emergency / Breakdown assistance alert signaled to college transport office.')}
          className="p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center space-x-2 transition"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Report Breakdown / Delay</span>
        </button>
      </div>
    </div>
  );
};
