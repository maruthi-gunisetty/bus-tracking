import React, { useState } from 'react';
import { 
  Bus as BusIcon, 
  MapPin, 
  Bell, 
  BellOff, 
  Navigation2, 
  Clock, 
  Volume2, 
  ShieldCheck 
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDistance } from '../utils/haversine';
import { playAlertChime } from '../utils/sound';

interface StudentViewProps {
  isDemo: boolean;
}

export const StudentView: React.FC<StudentViewProps> = ({ isDemo: _isDemo }) => {
  const [selectedBusId, setSelectedBusId] = useState<string>('bus_04');
  const [selectedStopId, setSelectedStopId] = useState<string>('stop_03');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [allowStudentLocation, setAllowStudentLocation] = useState<boolean>(false);
  const [testChimePlayed, setTestChimePlayed] = useState<boolean>(false);

  // Sample data for UI shell
  const sampleBuses = [
    { id: 'bus_04', number: 'BUS-04', route: 'Route 7 - Downtown Express', status: 'ACTIVE' },
    { id: 'bus_01', number: 'BUS-01', route: 'Route 1 - North Campus Line', status: 'IDLE' },
    { id: 'bus_08', number: 'BUS-08', route: 'Route 3 - Metro Connector', status: 'IDLE' },
  ];

  const sampleStops = [
    { id: 'stop_01', name: 'Stop 1: Central Station', seq: 1 },
    { id: 'stop_02', name: 'Stop 2: Jubilee Hills Checkpost', seq: 2 },
    { id: 'stop_03', name: 'Stop 3: Market Junction', seq: 3 },
    { id: 'stop_04', name: 'Stop 4: IT Park Crossroads', seq: 4 },
  ];

  const handleTestAudio = () => {
    playAlertChime();
    setTestChimePlayed(true);
    setTimeout(() => setTestChimePlayed(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
            {sampleBuses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.number} - {bus.route} ({bus.status})
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
            {sampleStops.map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Status & Proximity Card */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Status</span>
              <StatusBadge variant="ok" text="BUS IS ON THE WAY" pulse />
            </div>
            <h2 className="text-2xl font-black text-white mt-1">BUS-04 approaching your stop</h2>
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
              {formatDistance(2150)}
            </div>
            <span className="text-[10px] text-emerald-500 flex items-center space-x-1 mt-0.5 font-medium">
              <Navigation2 className="w-3 h-3 rotate-45" />
              <span>Approaching stop</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Estimated Time</span>
            <div className="text-2xl font-black text-white mt-0.5">
              ~6 mins
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Based on 36 km/h avg
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">Target Stop</span>
            <div className="text-sm font-bold text-slate-200 mt-1 truncate">
              Market Junction
            </div>
            <span className="text-[10px] text-slate-400 block">
              Stop #3 of 4
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">GPS Recency</span>
            <div className="text-sm font-bold text-sky-400 mt-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>5s ago</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Accuracy: ±12 m
            </span>
          </div>
        </div>

        {testChimePlayed && (
          <div className="mt-3 py-1 px-3 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold animate-pulse">
            Chime sound synthesized via Web Audio! Browser audio context active.
          </div>
        )}
      </div>

      {/* Live Map Area Placeholder (Wired in Stage 5 with Leaflet) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 bg-navy-850 border-b border-navy-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">Live Tracking Map</span>
            <span className="text-[11px] text-slate-400">· OpenStreetMap + Leaflet</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              Live Bus Signal
            </span>
          </div>
        </div>

        {/* Interactive Map Canvas Container */}
        <div id="student-map-container" className="h-[380px] w-full bg-navy-950 flex flex-col items-center justify-center relative p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 animate-pulse">
            <BusIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-white text-base">OpenStreetMap Live View</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Tracking BUS-04 along Route 7. Leaflet tile renderer connects directly to live Firestore coordinates.
          </p>
          <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-400 bg-navy-900/80 px-3 py-1.5 rounded-lg border border-navy-800">
            <span>© OpenStreetMap contributors · Zero-cost tile policy</span>
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
              : 'bg-navy-800 border-navy-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {allowStudentLocation ? 'Show My Position' : 'Privacy Mode (Default)'}
        </button>
      </div>
    </div>
  );
};
