import React, { useState, useEffect } from 'react';
import {
  Bus as BusIcon,
  MapPin,
  Bell,
  BellOff,
  Volume2,
  CheckCircle2,
  ChevronDown,
  Radio,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDistance } from '../utils/haversine';
import { playAlertChime } from '../utils/sound';
import { useTripContext } from '../context/useTripContext';
import { useProximityAlerts } from '../hooks/useProximityAlerts';
import { LiveMap, type MapLayerType } from '../components/map/LiveMap';
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
  const [testChimePlayed, setTestChimePlayed] = useState<boolean>(false);
  const [selectedMapLayer, setSelectedMapLayer] = useState<MapLayerType>('osm_standard');
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const selectedStop =
    pickupPoints.find((p) => p.pickupPointId === selectedStopId) || pickupPoints[0];
  const selectedBus = buses.find((b) => b.busId === selectedBusId) || buses[0];

  const busLat = currentTrip?.latestLatitude ?? 17.4085;
  const busLng = currentTrip?.latestLongitude ?? 78.452;
  const busSpeed = currentTrip?.latestSpeedKmh ?? 38;
  const busHeading = currentTrip?.latestHeading ?? 135;

  // Proximity alerts engine
  const { distanceMeters, isApproaching, activeAlert, alertHistory, dismissActiveAlert } =
    useProximityAlerts({
      busLat,
      busLng,
      pickupPoint: selectedStop,
      alertsEnabled,
      busStatus: currentTrip?.status,
    });

  // Location freshness calculation
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);

  useEffect(() => {
    const calcFreshness = () => {
      if (!currentTrip?.lastLocationUpdate) {
        setSecondsSinceUpdate(0);
        return;
      }
      const diffMs = Date.now() - new Date(currentTrip.lastLocationUpdate).getTime();
      setSecondsSinceUpdate(Math.max(0, Math.floor(diffMs / 1000)));
    };

    calcFreshness();
    const interval = setInterval(calcFreshness, 2000);
    return () => clearInterval(interval);
  }, [currentTrip?.lastLocationUpdate]);

  const getFreshnessBadge = () => {
    if (secondsSinceUpdate <= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-status-success/10 text-status-success border border-status-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          Live ({secondsSinceUpdate}s ago)
        </span>
      );
    } else if (secondsSinceUpdate <= 45) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20">
          <Clock className="w-3 h-3" />
          Location signal delayed ({secondsSinceUpdate}s ago)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Clock className="w-3 h-3" />
          Location Stale (&gt;45s)
        </span>
      );
    }
  };

  const calculateEtaMinutes = (): string => {
    if (!distanceMeters) return 'ETA unavailable';
    const effectiveSpeed = Math.max(15, busSpeed);
    const hours = distanceMeters / 1000 / effectiveSpeed;
    const mins = Math.max(1, Math.round(hours * 60));
    return `~${mins} min${mins > 1 ? 's' : ''}`;
  };

  const handleTestAudio = () => {
    playAlertChime();
    setTestChimePlayed(true);
    setTimeout(() => setTestChimePlayed(false), 2500);
  };

  const handleRequestBrowserNotification = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const permission = await Notification.requestPermission();
        setBrowserNotificationStatus(permission);
        if (permission === 'granted') {
          new Notification('ANSHARY BUS TRACKER', {
            body: 'Browser proximity notifications enabled successfully!',
          });
        }
      } catch (err) {
        console.warn('Browser notification request error:', err);
      }
    }
  };

  const getDerivedBusStatus = () => {
    if (!currentTrip || currentTrip.status === 'NOT_STARTED') {
      return { variant: 'stale' as const, text: 'Trip Not Started' };
    }
    if (currentTrip.status === 'STARTING') {
      return { variant: 'warning' as const, text: 'Trip Starting' };
    }
    if (currentTrip.status === 'ARRIVED') {
      return { variant: 'ok' as const, text: 'Bus Reached College' };
    }
    if (currentTrip.status === 'COMPLETED') {
      return { variant: 'stale' as const, text: 'Trip Completed' };
    }

    if (distanceMeters !== null) {
      if (distanceMeters <= 200) {
        return { variant: 'ok' as const, text: 'Bus Arrived at Your Stop' };
      }
      if (distanceMeters <= 1000) {
        return { variant: 'warning' as const, text: 'Bus Nearby (Under 1 km)' };
      }
      if (distanceMeters <= 3000) {
        return { variant: 'info' as const, text: 'Bus Approaching Your Stop' };
      }
    }

    return { variant: 'info' as const, text: 'Bus Is on the Way' };
  };

  const statusInfo = getDerivedBusStatus();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Simulation Controls if active */}
      <DemoSimulatorControls isDemo={isDemo} />

      {/* Active Distance Alert Toast */}
      {activeAlert && (
        <div className="p-4 rounded-card bg-accent-teal text-white flex items-center justify-between shadow-card animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-btn bg-white/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm">{activeAlert.message}</p>
              <p className="text-xs text-white/80">
                Straight-line distance: {formatDistance(activeAlert.distanceMeters)} · Triggered at{' '}
                {activeAlert.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={dismissActiveAlert}
            className="px-3 py-1 rounded-btn bg-white/20 hover:bg-white/30 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Student Welcome & Shift Overview Header */}
      <div className="saas-card p-6 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-accent-teal uppercase tracking-wider">
                Passenger Commute Console
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-bg-main text-text-secondary border border-border">
                {selectedBus.busNumber}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight mt-1">
              Live Bus Transit Tracking
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-medium">
              Assigned Route: <strong className="text-primary-navy">Route 7 Downtown Express & Campus Hub</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={statusInfo.variant} text={statusInfo.text} pulse />
            {getFreshnessBadge()}
          </div>
        </div>

        {/* Bus & Pickup Stop Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary-navy flex items-center gap-1.5">
              <BusIcon className="w-3.5 h-3.5 text-accent-teal" />
              Assigned Bus Vehicle:
            </label>
            <div className="relative">
              <select
                value={selectedBusId}
                onChange={(e) => setSelectedBusId(e.target.value)}
                className="saas-input w-full font-semibold text-xs pr-8 cursor-pointer"
              >
                {buses.map((b) => (
                  <option key={b.busId} value={b.busId}>
                    {b.busNumber} ({b.assignedDriverName || 'Driver'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary-navy flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent-teal" />
              Your Designated Pickup Stop:
            </label>
            <div className="relative">
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="saas-input w-full font-semibold text-xs pr-8 cursor-pointer"
              >
                {pickupPoints.map((p) => (
                  <option key={p.pickupPointId} value={p.pickupPointId}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Distance Countdown */}
        <div className="saas-card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Distance to Stop
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight mt-1">
            {distanceMeters !== null ? formatDistance(distanceMeters) : '--'}
          </div>
          <span className="text-[11px] text-accent-teal font-semibold block mt-1">
            {isApproaching ? 'Approaching Stop' : 'Moving Past'}
          </span>
        </div>

        {/* Estimated Arrival Time */}
        <div className="saas-card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Estimated Arrival
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight mt-1">
            {calculateEtaMinutes()}
          </div>
          <span className="text-[11px] text-text-muted block mt-1">
            Based on current speed
          </span>
        </div>

        {/* Live Speed */}
        <div className="saas-card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Driving Speed
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight mt-1">
            {Math.round(busSpeed)} <span className="text-xs font-semibold text-text-muted">km/h</span>
          </div>
          <span className="text-[11px] text-text-muted block mt-1">Phone GPS Telemetry</span>
        </div>

        {/* Lead Driver */}
        <div className="saas-card p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Bus Operator
          </span>
          <div className="text-base sm:text-lg font-bold text-primary-navy truncate mt-1">
            {selectedBus.assignedDriverName || 'Ramesh K.'}
          </div>
          <span className="text-[11px] text-status-success font-semibold flex items-center justify-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            Authorized Driver
          </span>
        </div>
      </div>

      {/* Live Interactive Map Card */}
      <div className="saas-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-status-success animate-pulse" />
            <h3 className="font-bold text-primary-navy text-base">
              Live OpenStreetMap & Google Hybrid Tracking
            </h3>
          </div>
          <div className="text-xs text-text-muted">
            Selected Stop: <strong className="text-primary-navy">{selectedStop.name}</strong>
          </div>
        </div>

        <div className="h-[420px] sm:h-[480px] rounded-card overflow-hidden border border-border">
          <LiveMap
            busPosition={{
              lat: busLat,
              lng: busLng,
              heading: busHeading,
              busNumber: selectedBus.busNumber,
              speedKmh: busSpeed,
            }}
            pickupPoints={pickupPoints}
            selectedStopId={selectedStopId}
            collegeDestination={collegeDestination}
            routePolyline={route7Waypoints}
            onSelectStop={(id) => setSelectedStopId(id)}
            className="h-full w-full"
            selectedMapLayer={selectedMapLayer}
            onMapLayerChange={setSelectedMapLayer}
          />
        </div>

        <p className="text-[11px] text-text-muted">
          * Calculated distances represent straight-line GPS measurements. Road transit timing may vary based on traffic signals.
        </p>
      </div>

      {/* Notification Preferences & Audio Chimes Panel */}
      <div className="saas-card p-6 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-primary-navy">
              Smart Proximity Chimes & Alerts
            </h3>
            <p className="text-xs text-text-secondary">
              Configure automated notifications as the bus approaches your pickup point.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAlertsEnabled((prev) => !prev)}
              className={`btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5 ${
                alertsEnabled ? 'border-accent-teal text-accent-teal' : ''
              }`}
            >
              {alertsEnabled ? <Bell className="w-3.5 h-3.5 text-accent-teal" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>{alertsEnabled ? 'Alerts Enabled' : 'Alerts Paused'}</span>
            </button>

            <button
              onClick={handleTestAudio}
              className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              title="Test synthesizer chime audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testChimePlayed ? 'Chime Played!' : 'Test Sound'}</span>
            </button>

            {browserNotificationStatus !== 'granted' && (
              <button
                onClick={handleRequestBrowserNotification}
                className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Browser Alerts</span>
              </button>
            )}
          </div>
        </div>

        {/* Alert Distance Thresholds */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-center text-xs">
          {[
            { km: 5, label: '5 km Away', desc: 'Prepare to depart' },
            { km: 3, label: '3 km Away', desc: 'Walk to stop' },
            { km: 2, label: '2 km Away', desc: 'Approaching stop' },
            { km: 1, label: '1 km Away', desc: 'At pickup point' },
            { km: 0.2, label: '200m Arrival', desc: 'Boarding now' },
          ].map((t) => (
            <div key={t.km} className="p-3 rounded-btn bg-bg-main border border-border">
              <span className="font-bold text-primary-navy block">{t.label}</span>
              <span className="text-[10px] text-text-muted block mt-0.5">{t.desc}</span>
            </div>
          ))}
        </div>

        {/* Recent In-App Notifications History */}
        {alertHistory.length > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <span className="text-xs font-bold text-primary-navy uppercase tracking-wider block">
              Recent Stop Alerts Triggered
            </span>
            <div className="divide-y divide-border">
              {alertHistory.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span className="font-semibold text-text-primary">{item.message}</span>
                  </div>
                  <span className="text-text-muted">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
