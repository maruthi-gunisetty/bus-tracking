import React, { useState } from 'react';
import { 
  Bus as BusIcon, 
  Plus, 
  Compass, 
  MapPin, 
  Check, 
  X,
  Sliders
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useTripContext } from '../context/useTripContext';
import { addBus, updateBusDriver, addPickupPoint, updateCollegeRadius } from '../services/fleetService';
import { LiveMap } from '../components/map/LiveMap';
import { DemoSimulatorControls } from '../components/common/DemoSimulatorControls';

let entityCounter = 100;
function createEntityId(prefix: string): string {
  entityCounter += 1;
  return `${prefix}_${entityCounter}`;
}

interface AdminViewProps {
  isDemo: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({ isDemo }) => {
  const { buses, pickupPoints, collegeDestination, route7Waypoints, currentTrip } = useTripContext();
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'geofence'>('fleet');
  const [collegeRadius, setCollegeRadius] = useState<number>(collegeDestination.arrivalRadiusMeters);

  // Modal states
  const [showAddBusModal, setShowAddBusModal] = useState<boolean>(false);
  const [newBusNumber, setNewBusNumber] = useState<string>('');
  const [newBusDriver, setNewBusDriver] = useState<string>('');

  const [showAddStopModal, setShowAddStopModal] = useState<boolean>(false);
  const [newStopName, setNewStopName] = useState<string>('');
  const [newStopLat, setNewStopLat] = useState<string>('17.4120');
  const [newStopLng, setNewStopLng] = useState<string>('78.4480');

  // Edit Driver modal
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [editedDriverName, setEditedDriverName] = useState<string>('');

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber.trim()) return;

    const newBusId = createEntityId('bus');
    await addBus({
      busId: newBusId,
      busNumber: newBusNumber.toUpperCase(),
      routeId: 'route_07',
      assignedDriverId: createEntityId('driver'),
      assignedDriverName: newBusDriver.trim() || 'Assigned Driver',
      collegeDestination,
      status: 'IDLE',
      currentTripId: null,
    });

    setNewBusNumber('');
    setNewBusDriver('');
    setShowAddBusModal(false);
  };

  const handleSaveDriver = async (busId: string) => {
    if (!editedDriverName.trim()) return;
    await updateBusDriver(busId, createEntityId('driver'), editedDriverName.trim());
    setEditingBusId(null);
    setEditedDriverName('');
  };

  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopName.trim()) return;

    const lat = parseFloat(newStopLat);
    const lng = parseFloat(newStopLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const newStopId = createEntityId('stop');
    await addPickupPoint({
      pickupPointId: newStopId,
      routeId: 'route_07',
      name: newStopName.trim(),
      lat,
      lng,
      sequenceNumber: pickupPoints.length + 1,
    });

    setNewStopName('');
    setShowAddStopModal(false);
  };

  const handleRadiusChange = async (newVal: number) => {
    setCollegeRadius(newVal);
    await updateCollegeRadius(newVal);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Demo simulation toolbar */}
      <DemoSimulatorControls isDemo={isDemo} />

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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Registered College Buses ({buses.length})</h2>
            <button
              onClick={() => setShowAddBusModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buses.map((bus) => {
              const isLive = bus.status === 'ACTIVE' || (bus.busId === 'bus_04' && currentTrip?.status === 'ACTIVE');
              return (
                <div
                  key={bus.busId}
                  className="p-5 rounded-2xl bg-navy-900 border border-navy-800 shadow-lg space-y-4 hover:border-purple-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-navy-800 text-sky-400 flex items-center justify-center font-bold text-xs border border-navy-700">
                        <BusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base">{bus.busNumber}</h3>
                        <span className="text-[10px] text-slate-400 block">Route 7 - Downtown Express</span>
                      </div>
                    </div>

                    {isLive ? (
                      <StatusBadge variant="ok" text="LIVE" pulse />
                    ) : (
                      <StatusBadge variant="info" text="IDLE" />
                    )}
                  </div>

                  <div className="pt-2 border-t border-navy-800/80 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Driver:</span>
                      {editingBusId === bus.busId ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            value={editedDriverName}
                            onChange={(e) => setEditedDriverName(e.target.value)}
                            placeholder="Driver Name"
                            className="bg-navy-850 border border-navy-700 rounded px-2 py-0.5 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSaveDriver(bus.busId)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingBusId(null)}
                            className="p-1 rounded bg-navy-800 text-slate-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-white">{bus.assignedDriverName || 'Unassigned'}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Telemetry:</span>
                      <span className="text-sky-400 font-medium">
                        {isLive ? `${currentTrip?.latestSpeedKmh || 36} km/h` : 'Parked'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last GPS:</span>
                      <span className="text-slate-400">{isLive ? 'Active now' : 'Standby'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingBusId(bus.busId);
                        setEditedDriverName(bus.assignedDriverName || '');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white text-xs font-medium transition border border-navy-750"
                    >
                      Reassign Driver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Fleet Map */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>Live Fleet Tracking Map</span>
            </h3>
            <LiveMap
              busPosition={
                currentTrip?.latestLatitude && currentTrip?.latestLongitude
                  ? {
                      lat: currentTrip.latestLatitude,
                      lng: currentTrip.latestLongitude,
                      heading: currentTrip.latestHeading,
                      busNumber: 'BUS-04',
                      speedKmh: currentTrip.latestSpeedKmh,
                    }
                  : null
              }
              pickupPoints={pickupPoints}
              collegeDestination={collegeDestination}
              routePolyline={route7Waypoints}
              className="h-[360px]"
            />
          </div>
        </div>
      )}

      {/* Tab: Routes */}
      {activeTab === 'routes' && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Route 7 - Downtown Express</h2>
              <p className="text-xs text-slate-400">
                {pickupPoints.length} pickup stops configured along this corridor.
              </p>
            </div>
            <button
              onClick={() => setShowAddStopModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pickupPoints.map((stop) => (
              <div
                key={stop.pickupPointId}
                className="flex items-center justify-between p-3.5 rounded-xl bg-navy-850 border border-navy-800 text-xs text-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-navy-800 text-sky-400 font-bold flex items-center justify-center text-xs border border-navy-700">
                    {stop.sequenceNumber}
                  </span>
                  <div>
                    <span className="font-bold text-white block text-sm">{stop.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
            ))}
          </div>

          {/* Route Map Preview */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-400">Route Geometry & Stops</h4>
            <LiveMap
              pickupPoints={pickupPoints}
              collegeDestination={collegeDestination}
              routePolyline={route7Waypoints}
              className="h-[300px]"
            />
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
                readOnly
                value={collegeDestination.name}
                className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>Arrival Radius: {collegeRadius} meters</span>
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={collegeRadius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>50m (Tight gate)</span>
                <span>150m (Standard campus)</span>
                <span>500m (Broad perimeter)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-center space-x-2">
            <Compass className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Arrival geofence active at: {collegeDestination.lat}, {collegeDestination.lng} with radius of {collegeRadius} meters.
            </span>
          </div>

          {/* Interactive Geofence Map Visualizer */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400">Campus Perimeter Visualizer</h4>
            <LiveMap
              collegeDestination={{ ...collegeDestination, arrivalRadiusMeters: collegeRadius }}
              pickupPoints={pickupPoints}
              routePolyline={route7Waypoints}
              className="h-[320px]"
            />
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl w-full max-w-md p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="font-bold text-white text-base">Register New College Bus</h3>
              <button onClick={() => setShowAddBusModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Bus Number / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUS-12"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Driver Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={newBusDriver}
                  onChange={(e) => setNewBusDriver(e.target.value)}
                  className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md"
                >
                  Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl w-full max-w-md p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="font-bold text-white text-base">Add New Pickup Stop</h3>
              <button onClick={() => setShowAddStopModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStop} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Stop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stop 5: Botanical Gardens Gate"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={newStopLat}
                    onChange={(e) => setNewStopLat(e.target.value)}
                    className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={newStopLng}
                    onChange={(e) => setNewStopLng(e.target.value)}
                    className="w-full bg-navy-850 border border-navy-750 text-white rounded-xl px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
