import React, { useState } from 'react';
import { 
  Bus as BusIcon, 
  MapPin, 
  Bell, 
  BellOff, 
  Navigation2, 
  Clock, 
  Volume2, 
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDistance } from '../utils/haversine';
import { playAlertChime } from '../utils/sound';
import { useTripContext } from '../context/useTripContext';
import { useProximityAlerts } from '../hooks/useProximityAlerts';
import { LiveMap } from '../components/map/LiveMap';
import { DemoSimulatorControls } from '../components/common/DemoSimulatorControls';

interface StudentViewProps {
  isDemo: boolean;
}

export const StudentView: React.FC<StudentViewProps> = ({ isDemo }) => {
  const {
    buses,
    pickupPoints,
    selectedBusId,
    setSelectedBusId,
    selectedStopId,
    setSelectedStopId,
    currentTrip,
    collegeDestination,
    route7Waypoints,
  } = useTripContext();

  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [allowStudentLocation, setAllowStudentLocation] = useState<boolean>(false);
  const [testChimePlayed, setTestChimePlayed] = useState<boolean>(false);

  const selectedStop = pickupPoints.find((p) => p.pickupPointId === selectedStopId) || pickupPoints[0];
  const selectedBus = buses.find((b) => b.busId === selectedBusId) || buses[0];

  const busLat = currentTrip?.latestLatitude ?? 17.4085;
  const busLng = currentTrip?.latestLongitude ?? 78.4520;
  const busSpeed = currentTrip?.latestSpeedKmh ?? 38;
  const busHeading = currentTrip?.latestHeading ?? 135;

  // Proximity alerts engine
  const {
    distanceMeters,
    isApproaching,
    activeAlert,
    dismissActiveAlert,
  } = useProximityAlerts({
    busLat,
    busLng,
    pickupPoint: selectedStop,
    alertsEnabled,
    busStatus: currentTrip?.status,
  });

  // Calculate dynamic ETA
  const calculateEtaMinutes = (): string => {
    if (!distanceMeters) return '--';
    const effectiveSpeed = Math.max(15, busSpeed); // assume at least 15 km/h in city traffic
    const hours = (distanceMeters / 1000) / effectiveSpeed;
    const mins = Math.max(1, Math.round(hours * 60));
    return `~${mins} min${mins > 1 ? 's' : ''}`;
  };

  const handleTestAudio = () => {
    playAlertChime();
    setTestChimePlayed(true);
    setTimeout(() => setTestChimePlayed(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Demo Controls Header if in simulation mode */}
      <DemoSimulatorControls isDemo={isDemo} />

      {/* Top Selection Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 sm:p-5 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Select Bus */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
            <BusIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Select College Bus</span>
          </label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {buses.map((bus) => (
              <option key={bus.busId} value={bus.busId}>
                {bus.busNumber} ({bus.status}) - {bus.assignedDriverName}
              </option>
            ))}
          </select>
        </div>

        {/* Select Pickup Stop */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your Pickup Point</span>
          </label>
          <select
            value={selectedStopId}
            onChange={(e) => setSelectedStopId(e.target.value)}
            className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {pickupPoints.map((stop) => (
              <option key={stop.pickupPointId} value={stop.pickupPointId}>
                {stop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Threshold Alert Banner */}
      {activeAlert && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 block">
                Proximity Alert Triggered ({activeAlert.thresholdKm} km milestone)
              </span>
              <p className="font-extrabold text-sm sm:text-base">{activeAlert.message}</p>
            </div>
          </div>
          <button
            onClick={dismissActiveAlert}
            className="p-1.5 rounded-lg hover:bg-white/20 transition text-emerald-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Primary Status & Proximity Card */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Status</span>
              {currentTrip?.status === 'ACTIVE' && (
                <StatusBadge variant="ok" text="BUS IS ON THE WAY" pulse />
              )}
              {currentTrip?.status === 'ARRIVED' && (
                <StatusBadge variant="ok" text="BUS REACHED CAMPUS" />
              )}
              {currentTrip?.status === 'COMPLETED' && (
                <StatusBadge variant="info" text="TRIP COMPLETED" />
              )}
              {(!currentTrip || currentTrip?.status === 'NOT_STARTED') && (
                <StatusBadge variant="info" text="WAITING FOR DRIVER DEPARTURE" />
              )}
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              {selectedBus?.busNumber || 'BUS-04'} {isApproaching ? 'approaching your stop' : 'moving along route'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                alertsEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-navy-800 border-navy-750 text-slate-400'
              }`}
            >
              {alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>{alertsEnabled ? 'Alerts ON' : 'Alerts Muted'}</span>
            </button>

            <button
              onClick={handleTestAudio}
              className="p-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-300 hover:text-white transition"
              title="Test Alert Chime"
            >
              <Volume2 className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Proximity Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Distance to Stop</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {formatDistance(distanceMeters)}
            </div>
            <span className="text-[10px] text-emerald-500 flex items-center space-x-1 mt-0.5 font-medium">
              <Navigation2 className={`w-3 h-3 ${isApproaching ? 'rotate-45' : 'rotate-180 text-amber-400'}`} />
              <span>{isApproaching ? 'Approaching stop' : 'Past stop'}</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Estimated Time</span>
            <div className="text-2xl font-black text-white mt-0.5">
              {calculateEtaMinutes()}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Based on {busSpeed} km/h telemetry
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Target Stop</span>
            <div className="text-sm font-bold text-slate-200 mt-1 truncate">
              {selectedStop?.name || 'Central Station'}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Stop #{selectedStop?.sequenceNumber} of {pickupPoints.length}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Live Telemetry</span>
            <div className="text-sm font-bold text-sky-400 mt-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{busSpeed} km/h</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Fix: ±{currentTrip?.latestAccuracyMeters || 12} m
            </span>
          </div>
        </div>

        {testChimePlayed && (
          <div className="mt-3 py-1 px-3 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold animate-pulse">
            Chime sound synthesized via Web Audio! Browser audio context active.
          </div>
        )}
      </div>

      {/* Live Map Area: Placed directly below the Live Interactive Map indicator */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-5 space-y-4">
        {/* Header Point: Live Interactive Map */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800/80 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="font-extrabold text-white text-base tracking-tight">Live Interactive Map</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                Route 7 Corridor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time OpenStreetMap rendering · Driver smartphone GPS broadcast
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
              🚌 {selectedBus?.busNumber || 'BUS-04'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              📍 Stop #{selectedStop?.sequenceNumber} (Your Stop)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold">
              🎓 College Campus
            </span>
          </div>
        </div>

        {/* The Live Interactive Map (Below the point Live Interactive Map) */}
        <div className="rounded-xl overflow-hidden border border-navy-750 shadow-inner">
          <LiveMap
            busPosition={{
              lat: busLat,
              lng: busLng,
              heading: busHeading,
              busNumber: selectedBus?.busNumber || 'BUS-04',
              speedKmh: busSpeed,
            }}
            pickupPoints={pickupPoints}
            selectedStopId={selectedStopId}
            collegeDestination={collegeDestination}
            routePolyline={route7Waypoints}
            onSelectStop={(stopId) => setSelectedStopId(stopId)}
            className="h-[460px] w-full"
          />
        </div>

        {/* Route Stops Sequence Progression */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Route 7 Stop Progression</span>
            <span>Tap any stop to change your target</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {pickupPoints.map((stop) => {
              const isSelected = stop.pickupPointId === selectedStopId;
              return (
                <button
                  key={stop.pickupPointId}
                  onClick={() => setSelectedStopId(stop.pickupPointId)}
                  className={`p-2.5 rounded-xl text-left border transition text-xs ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-navy-850 hover:bg-navy-800 border-navy-750 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-0.5">
                    <span className="text-[10px] text-sky-400">Stop #{stop.sequenceNumber}</span>
                    {isSelected && <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black">YOUR STOP</span>}
                  </div>
                  <div className="font-semibold text-white truncate text-[11px]">{stop.name.replace(/^Stop \d+: /, '')}</div>
                </button>
              );
            })}
            <div className="p-2.5 rounded-xl text-left border bg-purple-500/10 border-purple-500/30 text-purple-300 text-xs">
              <div className="font-bold text-[10px] text-purple-400 mb-0.5">Destination</div>
              <div className="font-semibold text-white truncate text-[11px]">College Campus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Opt-in: Student Location Default False */}
      <div className="p-4 rounded-xl bg-navy-900/70 border border-navy-800 flex items-start justify-between gap-4 text-xs">
        <div className="flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Student Location Privacy</span>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              We never track your phone&apos;s location without explicit opt-in. Proximity alerts are calculated strictly from the bus to your chosen pickup stop.
            </p>
          </div>
        </div>
        <button
          onClick={() => setAllowStudentLocation(!allowStudentLocation)}
          className={`shrink-0 px-3 py-1.5 rounded-lg font-semibold text-xs border transition ${
            allowStudentLocation
              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
              : 'bg-navy-800 border-navy-750 text-slate-400 hover:text-slate-200'
          }`}
        >
          {allowStudentLocation ? 'Show My Position' : 'Privacy Mode (Default)'}
        </button>
      </div>

      {/* Milestone Threshold Guide */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-xs space-y-2">
        <span className="font-bold text-slate-300 flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Configured Audio Alert Thresholds</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1">
          {[
            { km: '5 km', label: 'Get Ready Chime' },
            { km: '3 km', label: 'Start Preparing' },
            { km: '2 km', label: 'Walk to Stop' },
            { km: '1 km', label: 'Immediate Approach' },
            { km: '200 m', label: 'Stop Arrival Alarm' },
          ].map((item, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-navy-850 border border-navy-750">
              <span className="font-extrabold text-sky-400 block">{item.km}</span>
              <span className="text-[10px] text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
