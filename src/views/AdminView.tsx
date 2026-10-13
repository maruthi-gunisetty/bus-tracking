import React, { useState } from 'react';
import { 
  Bus as BusIcon, 
  Plus, 
  Compass
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DEFAULT_COLLEGE } from '../config/constants';

interface AdminViewProps {
  isDemo: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({ isDemo: _isDemo }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'geofence'>('fleet');
  const [collegeRadius, setCollegeRadius] = useState<number>(DEFAULT_COLLEGE.arrivalRadiusMeters);

  const fleet = [
    {
      busId: 'bus_04',
      number: 'BUS-04',
      route: 'Route 7 - Downtown Express',
      driver: 'Ramesh K. (Driver)',
      status: 'ACTIVE',
      lastUpdate: '5s ago',
      speed: '36 km/h',
    },
    {
      busId: 'bus_01',
      number: 'BUS-01',
      route: 'Route 1 - North Campus Line',
      driver: 'Suresh M. (Driver)',
      status: 'IDLE',
      lastUpdate: 'Not on shift',
      speed: '0 km/h',
    },
    {
      busId: 'bus_08',
      number: 'BUS-08',
      route: 'Route 3 - Metro Connector',
      driver: 'Anand P. (Driver)',
      status: 'IDLE',
      lastUpdate: 'Not on shift',
      speed: '0 km/h',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <span>Fleet Administration Console</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
              Admin
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage college fleet, driver vehicle assignments, route pickup points, and arrival geofencing.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center space-x-1 bg-navy-850 p-1 rounded-xl border border-navy-800 text-xs">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'fleet' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Fleet
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'routes' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Routes & Stops
          </button>
          <button
            onClick={() => setActiveTab('geofence')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'geofence' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            College Geofence
          </button>
        </div>
      </div>

      {/* Tab: Fleet Overview */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Registered College Buses (3)</h2>
            <button
              onClick={() => alert('New Bus registration modal (will connect to Firestore in Stage 7)')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fleet.map((bus) => (
              <div
                key={bus.busId}
                className="p-5 rounded-2xl bg-navy-900 border border-navy-800 shadow-lg space-y-4 hover:border-purple-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-navy-800 text-sky-400 flex items-center justify-center font-bold text-xs">
                      <BusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base">{bus.number}</h3>
                      <span className="text-[10px] text-slate-400 block">{bus.route}</span>
                    </div>
                  </div>

                  {bus.status === 'ACTIVE' ? (
                    <StatusBadge variant="ok" text="LIVE" pulse />
                  ) : (
                    <StatusBadge variant="info" text="IDLE" />
                  )}
                </div>

                <div className="pt-2 border-t border-navy-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-semibold text-white">{bus.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telemetry:</span>
                    <span className="text-sky-400 font-medium">{bus.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last GPS:</span>
                    <span className="text-slate-400">{bus.lastUpdate}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => alert(`Managing permissions for ${bus.number}`)}
                    className="flex-1 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white text-xs font-medium transition"
                  >
                    Edit Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Routes */}
      {activeTab === 'routes' && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Route 7 - Downtown Express</h2>
              <p className="text-xs text-slate-400">4 pickup stops configured. Click on map to add pickup points.</p>
            </div>
            <button
              onClick={() => alert('Add Pickup Stop trigger')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="space-y-2">
            {[
              { id: '1', name: 'Stop 1: Central Station', seq: 1, lat: 17.3912, lng: 78.4722 },
              { id: '2', name: 'Stop 2: Jubilee Hills Checkpost', seq: 2, lat: 17.4312, lng: 78.4122 },
              { id: '3', name: 'Stop 3: Market Junction', seq: 3, lat: 17.3855, lng: 78.4611 },
              { id: '4', name: 'Stop 4: IT Park Crossroads', seq: 4, lat: 17.4411, lng: 78.3811 },
            ].map((stop) => (
              <div
                key={stop.id}
                className="flex items-center justify-between p-3 rounded-xl bg-navy-850 border border-navy-800 text-xs text-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-navy-800 text-sky-400 font-bold flex items-center justify-center text-[11px]">
                    {stop.seq}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{stop.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Active Stop</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Geofence Settings */}
      {activeTab === 'geofence' && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">College Campus Destination Geofence</h2>
            <p className="text-xs text-slate-400 mt-1">
              Arrival is detected automatically using Haversine calculation when the driver enters this radius.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Campus Name</label>
              <input
                type="text"
                defaultValue={DEFAULT_COLLEGE.name}
                className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Arrival Radius (Meters)</label>
              <input
                type="number"
                value={collegeRadius}
                onChange={(e) => setCollegeRadius(Number(e.target.value))}
                min="50"
                max="500"
                className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-center space-x-2">
            <Compass className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Arrival geofence active at: {DEFAULT_COLLEGE.lat}, {DEFAULT_COLLEGE.lng} with radius of {collegeRadius} meters.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
