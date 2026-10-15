import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Navigation,
  Gauge,
  AlertTriangle,
  Clock,
  Radio,
  MapPin,
  RefreshCw,
  Sun,
  Smartphone,
  ChevronDown,
  Signal,
  ShieldAlert,
  Database,
} from 'lucide-react';
import type { RecoveryState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDistance } from '../utils/haversine';
import { useTripContext } from '../context/useTripContext';
import { useDriverGeolocation } from '../hooks/useDriverGeolocation';
import { demoSimulator, type SimulatorState } from '../services/demoSimulator';
import { DemoSimulatorControls } from '../components/common/DemoSimulatorControls';
import { LocationPermissionModal } from '../components/driver/LocationPermissionModal';
import { LiveMap } from '../components/map/LiveMap';
import type { MapLayerType } from '../components/map/mapLayers';
import { isSupabaseConfigured } from '../supabase/config';
import { getAuthState } from '../services/authService';

interface DriverViewProps {
  isDemo: boolean;
}

export const DriverView: React.FC<DriverViewProps> = ({ isDemo }) => {
  const {
    buses,
    pickupPoints,
    collegeDestination,
    route7Waypoints,
    selectedBusId,
    setSelectedBusId,
    startDriverTrip,
    endDriverTrip,
    currentTrip,
  } = useTripContext();

  const assignedBus =
    buses.find((b) => b.busId === selectedBusId) ||
    buses[0] || {
      busId: 'bus_04',
      busNumber: 'BUS-04',
      routeId: 'route_07',
      assignedDriverName: 'Ramesh K. (Lead Driver)',
    };

  const [activeTripId, setActiveTripId] = useState<string | null>(
    assignedBus.busId ? 'trip_demo_04' : null
  );
  const [simState, setSimState] = useState<SimulatorState>(demoSimulator.getState());
  const [driverMapLayer, setDriverMapLayer] = useState<MapLayerType>('osm_standard');

  // Location Permission Modal State
  const [permissionModalOpen, setPermissionModalOpen] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [permissionDeniedAlert, setPermissionDeniedAlert] = useState<string | null>(null);

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
    requestPermissionAndStart,
    pauseTracking,
    resumeTracking,
    stopTracking,
    clearErrorMessage,
  } = useDriverGeolocation({
    tripId: activeTripId,
    busId: assignedBus.busId,
    collegeDestination,
    isDemo,
    onArrival: () => {
      console.log('[DriverView] Driver reached campus arrival geofence!');
    },
  });

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

  const driverLat = geoState.latitude ?? currentTrip?.latestLatitude ?? 17.4085;
  const driverLng = geoState.longitude ?? currentTrip?.latestLongitude ?? 78.452;
  const driverHeading = geoState.heading ?? currentTrip?.latestHeading ?? 0;

  // Driver initiates Start Trip
  const handleInitiateStartTrip = () => {
    if (isDemo) {
      void demoSimulator.start();
      return;
    }
    // Open explicit location permission popup
    setPermissionDeniedAlert(null);
    clearErrorMessage();
    setPermissionModalOpen(true);
  };

  // Driver clicks "Allow Location" in the permission popup
  const handleConfirmAllowLocation = async () => {
    setIsRequestingPermission(true);
    setPermissionDeniedAlert(null);

    const result = await requestPermissionAndStart();
    setIsRequestingPermission(false);

    if (result.success) {
      setPermissionModalOpen(false);
      const auth = getAuthState();
      const sessionDriverId = auth.isAuthenticated && auth.user?.userId ? auth.user.userId : 'driver_ramesh';
      const sessionDriverName = auth.isAuthenticated && auth.user?.name ? auth.user.name : assignedBus.assignedDriverName || 'Driver';

      const tripId = await startDriverTrip(
        assignedBus.busId,
        sessionDriverId,
        sessionDriverName
      );
      setActiveTripId(tripId);
    } else {
      setPermissionModalOpen(false);
      setPermissionDeniedAlert(
        result.error ||
          'Location access is required for real-time tracking. Please enable location permission in your browser settings.'
      );
    }
  };

  // Driver clicks "Cancel" or "Not Now" in permission popup
  const handleDismissPermission = () => {
    setPermissionModalOpen(false);
    setIsRequestingPermission(false);
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
    setPermissionDeniedAlert(null);
  };

  const handleResetTrip = () => {
    if (isDemo) {
      demoSimulator.reset();
    } else {
      stopTracking();
    }
    setPermissionDeniedAlert(null);
  };

  const renderTrackingBadge = () => {
    if (effectiveStatus !== 'ACTIVE') {
      return (
        <span className="text-xs px-2.5 py-1 rounded-btn bg-bg-main text-text-primary font-bold border border-border">
          READY FOR TRIP
        </span>
      );
    }
    if (geoState.isPaused) {
      return <StatusBadge variant="warning" text="Paused" />;
    }
    if (geoState.trackingStatus === 'Live') {
      return <StatusBadge variant="ok" text="Live" pulse />;
    }
    if (geoState.trackingStatus === 'Location signal delayed') {
      return <StatusBadge variant="warning" text="Location signal delayed" />;
    }
    return <StatusBadge variant="error" text="Location Unavailable" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-6">
      {/* Simulation Controls Header if in demo mode */}
      <DemoSimulatorControls isDemo={isDemo} />

      {/* Permission Denied Alert Banner */}
      {(permissionDeniedAlert || geoState.recoveryState === 'LOCATION_PERMISSION_DENIED') && (
        <div className="p-4 sm:p-5 rounded-modal bg-status-error/10 border border-status-error/30 text-status-error space-y-2 animate-in fade-in">
          <div className="flex items-center space-x-2.5 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-status-error" />
            <span>Permission Denied</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed">
            Location access is required for real-time tracking. Please enable location permission in
            your browser settings.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleInitiateStartTrip}
              className="btn-danger !py-1.5 !px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Location Access</span>
            </button>
            <span className="text-[11px] text-text-muted">
              Tap the lock or site settings icon in your browser address bar and set Location to
              Allow.
            </span>
          </div>
        </div>
      )}

      {/* Explanatory Banner: Real Smartphone GPS Architecture */}
      <div className="saas-card p-5 sm:p-6 space-y-3 bg-white border border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-btn bg-primary-navy text-white flex items-center justify-center shadow-subtle shrink-0">
            <Smartphone className="w-5 h-5 text-accent-teal" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-teal">
                Driver Smartphone Telemetry Console
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-bg-main text-text-secondary border border-border">
                Zero Hardware Required
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-primary-navy tracking-tight">
              Broadcasting Live Vehicle GPS to Waiting Students
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          When you start an authorized shift trip, this application requests your smartphone's built-in
          GPS coordinates and continuously updates the interactive OpenStreetMap tiles via Supabase Realtime.
          Keep this browser tab active on your dashboard mount.
        </p>

        {/* Backend & Realtime Status Pill */}
        <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-accent-teal" />
            <span className="font-semibold text-primary-navy">
              Backend Realtime:
            </span>
            <span className="text-text-secondary">
              {isSupabaseConfigured() ? 'Supabase Realtime Cloud (Free Tier Active)' : 'Local Free-Tier Reactive Mode (Supabase Ready)'}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-bg-main border border-border text-text-secondary">
            {isSupabaseConfigured() ? 'Connected' : 'Free Tier Local Bus'}
          </span>
        </div>
      </div>

      {/* Vehicle & Shift Selection Card */}
      <div className="saas-card p-6 sm:p-7 space-y-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Vehicle & Route Assignment
            </span>
            <div className="flex items-center space-x-2.5 mt-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight">
                {assignedBus.busNumber}
              </h1>
              {renderTrackingBadge()}
            </div>
            <p className="text-xs text-text-secondary mt-1 flex items-center space-x-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-accent-teal" strokeWidth={2} />
              <span>Route 7 — Downtown Express & College Campus Hub</span>
            </p>
          </div>

          {/* Bus Switcher */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Select Operating Vehicle
            </span>
            <div className="relative">
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="saas-input !py-1.5 !px-3 font-semibold text-xs pr-8 cursor-pointer"
              >
                {buses.map((b) => (
                  <option key={b.busId} value={b.busId}>
                    {b.busNumber} ({b.assignedDriverName || 'Driver'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Start / Pause / Stop Broadcast Lifecycle Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-navy flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-accent-teal" strokeWidth={2} />
              <span>Trip Broadcast Lifecycle:</span>
            </span>
            {effectiveStatus === 'ACTIVE' && (
              <span className="text-xs font-semibold flex items-center gap-1 bg-bg-main px-2.5 py-0.5 rounded border border-border">
                <span
                  className={`w-2 h-2 rounded-full ${
                    geoState.trackingStatus === 'Live' ? 'bg-status-success animate-pulse' : 'bg-status-warning'
                  }`}
                />
                <span className="text-text-primary">
                  Status: {geoState.isPaused ? 'Paused' : geoState.trackingStatus}
                </span>
              </span>
            )}
          </div>

          {/* Active Broadcast Notification Card */}
          {effectiveStatus === 'ACTIVE' && (
            <div className="p-4 rounded-card bg-status-success/10 border border-status-success/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-primary-navy">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-status-success animate-ping shrink-0" />
                <div>
                  <span className="font-bold text-status-success block">
                    {geoState.isPaused
                      ? 'GPS Broadcast Paused'
                      : geoState.trackingStatus === 'Live'
                      ? 'Live GPS Broadcasting to Supabase Realtime'
                      : geoState.trackingStatus}
                  </span>
                  <span className="text-[11px] text-text-secondary font-mono">
                    Latitude: {driverLat.toFixed(5)}° N · Longitude: {driverLng.toFixed(5)}° E · Speed:{' '}
                    {Math.round(effectiveSpeed)} km/h
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-primary-navy border border-border self-start sm:self-auto shrink-0">
                {geoState.isPaused ? 'Paused' : 'Streaming Active'}
              </span>
            </div>
          )}

          {/* Warning / Recovery Alert if triggered */}
          {effectiveRecoveryState && effectiveRecoveryState !== 'LOCATION_PERMISSION_DENIED' && (
            <div className="p-4 rounded-card bg-status-warning/10 border border-status-warning/20 flex items-center space-x-3 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-status-warning" strokeWidth={2} />
              <span className="text-text-primary">
                <strong>Status: {effectiveRecoveryState}.</strong> Tracking will resume automatically
                when satellite fix or connection is restored.
              </span>
            </div>
          )}

          {/* Primary Action Buttons: Start Trip, Pause/Stop Trip, End Trip */}
          <div>
            {effectiveStatus === 'NOT_STARTED' && (
              <div className="space-y-2.5">
                <button
                  onClick={handleInitiateStartTrip}
                  className="w-full py-4 rounded-btn bg-accent-teal hover:bg-accent-hover text-white font-bold text-base sm:text-lg shadow-card flex items-center justify-center space-x-3 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>START TRIP & BROADCAST LOCATION</span>
                </button>
                <p className="text-center text-[11px] text-text-muted">
                  A location permission popup will appear to allow browser GPS streaming.
                </p>
              </div>
            )}

            {effectiveStatus === 'STARTING' && (
              <div className="w-full py-4 rounded-btn bg-status-warning text-white font-bold text-base flex items-center justify-center space-x-2 animate-pulse">
                <Radio className="w-5 h-5 text-white" />
                <span>ACQUIRING PHONE GPS SATELLITE FIX...</span>
              </div>
            )}

            {effectiveStatus === 'ACTIVE' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {geoState.isPaused ? (
                    <button
                      onClick={resumeTracking}
                      className="py-3.5 px-4 rounded-btn bg-status-success hover:opacity-95 text-white font-bold text-sm shadow-card flex items-center justify-center space-x-2 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>RESUME LIVE TRACKING</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTracking}
                      className="py-3.5 px-4 rounded-btn bg-status-warning hover:opacity-95 text-white font-bold text-sm shadow-card flex items-center justify-center space-x-2 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <Pause className="w-4 h-4 fill-white" />
                      <span>PAUSE / STOP TRACKING</span>
                    </button>
                  )}

                  <button
                    onClick={handleEndTrip}
                    className="py-3.5 px-4 rounded-btn bg-primary-navy hover:bg-secondary-navy text-white font-bold text-sm shadow-card flex items-center justify-center space-x-2 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>END TRIP</span>
                  </button>
                </div>
                <p className="text-center text-[11px] text-text-muted">
                  {geoState.isPaused
                    ? 'Tracking paused. Your phone GPS is not streaming. Click Resume to re-enable.'
                    : 'Halts GPS location tracking, releases screen wake lock, and marks route completed.'}
                </p>
              </div>
            )}

            {(effectiveStatus === 'COMPLETED' || effectiveStatus === 'ARRIVED') && (
              <button
                onClick={handleResetTrip}
                className="w-full py-3 btn-secondary font-semibold text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ready for Next Shift / Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Driver Real-Time Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Speed */}
        <div className="saas-card p-4 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-text-muted text-xs mb-1">
            <Gauge className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight">
            {effectiveStatus === 'ACTIVE' && !geoState.isPaused ? `${Math.round(effectiveSpeed)}` : '0'}
            <span className="text-xs font-semibold text-text-muted ml-1">km/h</span>
          </div>
          <span className="text-[10px] text-text-muted block mt-1">Driving Speed</span>
        </div>

        {/* GPS Fix */}
        <div className="saas-card p-4 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-text-muted text-xs mb-1">
            <Radio className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Tracking Status</span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-primary-navy tracking-tight truncate">
            {effectiveStatus === 'ACTIVE'
              ? geoState.isPaused
                ? 'Paused'
                : geoState.trackingStatus
              : 'Standby'}
          </div>
          <span className="text-[10px] text-status-success font-medium block mt-1">
            {effectiveAccuracy !== null ? `Accuracy ±${effectiveAccuracy}m` : 'Satellite Fix'}
          </span>
        </div>

        {/* Distance Remaining */}
        <div className="saas-card p-4 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-text-muted text-xs mb-1">
            <Navigation className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">To Campus</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight">
            {effectiveStatus === 'ACTIVE' || effectiveStatus === 'ARRIVED'
              ? formatDistance(effectiveDistanceToCollege)
              : '--'}
          </div>
          <span className="text-[10px] text-text-muted block mt-1">Campus Destination</span>
        </div>

        {/* Screen Wake Lock */}
        <div className="saas-card p-4 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-text-muted text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-text-muted" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Screen Keep-Awake</span>
          </div>
          <div className="text-xs font-bold mt-2 flex items-center justify-center">
            {geoState.wakeLockActive ? (
              <span className="text-status-success bg-status-success/10 px-2.5 py-0.5 rounded flex items-center space-x-1 font-semibold border border-status-success/20">
                <Sun className="w-3 h-3 text-status-success" strokeWidth={2} />
                <span>Screen ON</span>
              </span>
            ) : (
              <span className="text-text-muted bg-bg-main px-2.5 py-0.5 rounded border border-border">
                Standby
              </span>
            )}
          </div>
          <span className="text-[10px] text-text-muted block mt-1">Prevents Phone Sleep</span>
        </div>
      </div>

      {/* Driver's Live Interactive Map (OpenStreetMap Leaflet) */}
      <div className="saas-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  geoState.trackingStatus === 'Live' ? 'bg-status-success animate-pulse' : 'bg-status-warning'
                }`}
              />
              <h3 className="font-bold text-primary-navy text-base sm:text-lg tracking-tight">
                Live Driver Route & Real Position (OpenStreetMap)
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Your real smartphone GPS coordinates plotted continuously along Route 7.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-primary-navy/10 text-primary-navy font-bold">
              {assignedBus.busNumber}
            </span>
            <span className="px-2.5 py-1 rounded bg-accent-teal/10 text-accent-teal font-semibold">
              Campus Destination
            </span>
          </div>
        </div>

        {/* Live Leaflet Map */}
        <div className="h-[360px] sm:h-[420px] rounded-card overflow-hidden border border-border">
          <LiveMap
            busPosition={{
              lat: driverLat,
              lng: driverLng,
              heading: driverHeading,
              busNumber: assignedBus.busNumber,
              speedKmh: effectiveSpeed,
            }}
            pickupPoints={pickupPoints}
            collegeDestination={collegeDestination}
            routePolyline={route7Waypoints}
            className="h-full w-full"
            selectedMapLayer={driverMapLayer}
            onMapLayerChange={setDriverMapLayer}
          />
        </div>
      </div>

      {/* Permission Modal */}
      <LocationPermissionModal
        isOpen={permissionModalOpen}
        isRequesting={isRequestingPermission}
        onAllow={handleConfirmAllowLocation}
        onNotNow={handleDismissPermission}
        onCancel={handleDismissPermission}
        title="Enable Location Access"
        cancelText="Cancel"
      />
    </div>
  );
};
