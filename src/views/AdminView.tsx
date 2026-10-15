import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  Bus as BusIcon,
  Route,
  MapPin,
  Radio,
  History,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Save,
  Shield,
} from 'lucide-react';
import {
  getFleetBuses,
  getRoutes,
  getPickupPoints,
  getCollegeDestination,
  getStudents,
  addStudent,
  toggleStudentStatus,
  deleteStudent,
  getDrivers,
  addDriver,
  toggleDriverStatus,
  getAuditLogs,
  addBus,
  toggleBusStatus,
  addPickupPoint,
  deletePickupPoint,
  addRoute,
  getAdminSettings,
  updateAdminSettings,
  subscribeToFleet,
} from '../services/fleetService';
import type {
  Bus,
  BusRoute,
  PickupPoint,
  StudentRecord,
  DriverRecord,
  AuditLogEvent,
  AdminSettings,
  CollegeDestination,
} from '../types';
import { useTripContext } from '../context/useTripContext';
import { LiveMap } from '../components/map/LiveMap';
import { ROUTE_7_WAYPOINTS } from '../config/routeData';

interface AdminViewProps {
  isDemo: boolean;
  onLogout?: () => void;
}

type AdminTab =
  | 'overview'
  | 'students'
  | 'drivers'
  | 'buses'
  | 'routes'
  | 'stops'
  | 'active-trips'
  | 'trip-history'
  | 'audit-log'
  | 'settings';

export const AdminView: React.FC<AdminViewProps> = ({ isDemo: _isDemo, onLogout }) => {
  const { currentTrip, activeTrips } = useTripContext();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>(() => getRoutes());
  const [stops, setStops] = useState<PickupPoint[]>(() => getPickupPoints());
  const [students, setStudents] = useState<StudentRecord[]>(() => getStudents());
  const [drivers, setDrivers] = useState<DriverRecord[]>(() => getDrivers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => getAuditLogs());
  const [settings, setSettings] = useState<AdminSettings>(() => getAdminSettings());
  const [collegeDest, setCollegeDest] = useState<CollegeDestination>(() => getCollegeDestination());

  // Search & Filter state
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DEACTIVATED'>('ALL');
  const [driverSearch, setDriverSearch] = useState<string>('');

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState<boolean>(false);
  const [showAddBusModal, setShowAddBusModal] = useState<boolean>(false);
  const [showAddStopModal, setShowAddStopModal] = useState<boolean>(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form fields: Student
  const [newStdName, setNewStdName] = useState<string>('');
  const [newStdId, setNewStdId] = useState<string>('');
  const [newStdReg, setNewStdReg] = useState<string>('');
  const [newStdEmail, setNewStdEmail] = useState<string>('');
  const [newStdBusId, setNewStdBusId] = useState<string>('bus_04');
  const [newStdStopId, setNewStdStopId] = useState<string>('stop_03');

  // Form fields: Driver
  const [newDrvName, setNewDrvName] = useState<string>('');
  const [newDrvId, setNewDrvId] = useState<string>('');
  const [newDrvPhone, setNewDrvPhone] = useState<string>('');
  const [newDrvLicense, setNewDrvLicense] = useState<string>('');
  const [newDrvLogin, setNewDrvLogin] = useState<string>('');
  const [newDrvBusId, setNewDrvBusId] = useState<string>('bus_04');

  // Form fields: Bus
  const [newBusNumber, setNewBusNumber] = useState<string>('');
  const [newBusRouteId, setNewBusRouteId] = useState<string>('route_07');
  const [newBusDriverName, setNewBusDriverName] = useState<string>('');

  // Form fields: Stop
  const [newStopName, setNewStopName] = useState<string>('');
  const [newStopLat, setNewStopLat] = useState<string>('17.4120');
  const [newStopLng, setNewStopLng] = useState<string>('78.4480');
  const [newStopRouteId, setNewStopRouteId] = useState<string>('route_07');

  // Form fields: Route
  const [newRouteId, setNewRouteId] = useState<string>('');
  const [newRouteName, setNewRouteName] = useState<string>('');
  const [newRouteStart, setNewRouteStart] = useState<string>('');
  const [newRouteEnd, setNewRouteEnd] = useState<string>('Anshary College Campus');

  useEffect(() => {
    let isMounted = true;
    void getFleetBuses().then((b) => {
      if (isMounted) setBuses(b);
    });

    const unsub = subscribeToFleet(() => {
      void getFleetBuses().then((b) => {
        if (isMounted) {
          setBuses(b);
          setRoutes(getRoutes());
          setStops(getPickupPoints());
          setStudents(getStudents());
          setDrivers(getDrivers());
          setAuditLogs(getAuditLogs());
          setSettings(getAdminSettings());
          setCollegeDest(getCollegeDestination());
        }
      });
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const showTemporaryNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handlers: Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStdName || !newStdId || !newStdEmail) return;

    const selectedBus = buses.find((b) => b.busId === newStdBusId);
    const selectedStop = stops.find((s) => s.pickupPointId === newStdStopId);

    await addStudent({
      studentId: newStdId.trim(),
      fullName: newStdName.trim(),
      regNumber: newStdReg.trim() || newStdId.trim(),
      loginIdentifier: newStdEmail.trim().toLowerCase(),
      assignedBusId: newStdBusId,
      assignedBusNumber: selectedBus?.busNumber || 'BUS-04',
      assignedRouteId: selectedBus?.routeId || 'route_07',
      pickupPointId: newStdStopId,
      pickupPointName: selectedStop?.name || 'Stop 3: Market Junction',
      accountStatus: 'ACTIVE',
    });

    setShowAddStudentModal(false);
    setNewStdName('');
    setNewStdId('');
    setNewStdReg('');
    setNewStdEmail('');
    showTemporaryNotice(`Successfully provisioned student ${newStdName}`);
  };

  // Handlers: Driver
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrvName || !newDrvId || !newDrvLogin) return;

    const selectedBus = buses.find((b) => b.busId === newDrvBusId);

    await addDriver({
      driverId: newDrvId.trim(),
      fullName: newDrvName.trim(),
      loginIdentifier: newDrvLogin.trim().toLowerCase(),
      phone: newDrvPhone.trim() || '+91 98765 00000',
      licenseNumber: newDrvLicense.trim() || 'COMM-AP-2024',
      assignedBusId: newDrvBusId,
      assignedBusNumber: selectedBus?.busNumber || 'BUS-04',
      assignedRouteId: selectedBus?.routeId || 'route_07',
      accountStatus: 'ACTIVE',
      currentTripStatus: 'NOT_STARTED',
    });

    setShowAddDriverModal(false);
    setNewDrvName('');
    setNewDrvId('');
    setNewDrvPhone('');
    setNewDrvLicense('');
    setNewDrvLogin('');
    showTemporaryNotice(`Successfully provisioned driver ${newDrvName}`);
  };

  // Handlers: Bus
  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber.trim()) return;

    const busId = `bus_${Date.now().toString().slice(-4)}`;
    await addBus({
      busId,
      busNumber: newBusNumber.trim().toUpperCase(),
      routeId: newBusRouteId,
      assignedDriverId: `drv_${Date.now().toString().slice(-4)}`,
      assignedDriverName: newBusDriverName.trim() || 'Assigned Driver',
      collegeDestination: collegeDest,
      status: 'IDLE',
      currentTripId: null,
    });

    setShowAddBusModal(false);
    setNewBusNumber('');
    setNewBusDriverName('');
    showTemporaryNotice(`Created bus ${newBusNumber.toUpperCase()}`);
  };

  // Handlers: Stop
  const handleCreateStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopName.trim()) return;

    const lat = parseFloat(newStopLat);
    const lng = parseFloat(newStopLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const stopId = `stop_${Date.now().toString().slice(-4)}`;
    await addPickupPoint({
      pickupPointId: stopId,
      routeId: newStopRouteId,
      name: newStopName.trim(),
      lat,
      lng,
      sequenceNumber: stops.length + 1,
    });

    setShowAddStopModal(false);
    setNewStopName('');
    showTemporaryNotice(`Added pickup stop: ${newStopName}`);
  };

  // Handlers: Route
  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName.trim()) return;

    const routeId = newRouteId.trim() || `route_${Date.now().toString().slice(-3)}`;
    await addRoute({
      routeId,
      routeName: newRouteName.trim(),
      startPoint: newRouteStart.trim() || 'Terminal',
      endPoint: newRouteEnd.trim() || 'College Campus',
      color: '#0F9D91',
      active: true,
    });

    setShowAddRouteModal(false);
    setNewRouteName('');
    setNewRouteId('');
    setNewRouteStart('');
  };

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.loginIdentifier.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus =
      studentStatusFilter === 'ALL' || s.accountStatus === studentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered drivers
  const filteredDrivers = drivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.driverId.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.loginIdentifier.toLowerCase().includes(driverSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-bg-main">
      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-border shrink-0 hidden md:flex flex-col justify-between p-4 shadow-subtle">
        <div className="space-y-6">
          {/* Admin Identity Badge */}
          <div className="p-3 rounded-card bg-bg-main border border-border">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-btn bg-secondary-navy text-white flex items-center justify-center font-bold text-xs shadow-subtle">
                ADM
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-primary-navy text-xs block truncate">
                  College Transport Admin
                </span>
                <span className="text-[10px] text-accent-teal font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Full System Authority
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'students', label: 'Students', icon: Users, count: students.length },
              { id: 'drivers', label: 'Drivers', icon: Car, count: drivers.length },
              { id: 'buses', label: 'Buses', icon: BusIcon, count: buses.length },
              { id: 'routes', label: 'Routes', icon: Route, count: routes.length },
              { id: 'stops', label: 'Pickup Points', icon: MapPin, count: stops.length },
              { id: 'active-trips', label: 'Active Trips', icon: Radio, count: activeTrips.length },
              { id: 'trip-history', label: 'Trip History', icon: History },
              { id: 'audit-log', label: 'Audit Log', icon: FileText },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-btn text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary-navy text-white shadow-subtle'
                      : 'text-text-secondary hover:text-primary-navy hover:bg-bg-subtle'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-accent-teal' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isActive ? 'bg-secondary-navy text-white' : 'bg-bg-main text-text-muted'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        {onLogout && (
          <div className="pt-4 border-t border-border">
            <button
              onClick={onLogout}
              className="w-full btn-secondary !py-2 text-xs flex items-center justify-center gap-2 text-status-error hover:border-status-error/40"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Administrative Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 overflow-x-hidden">
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex overflow-x-auto space-x-2 pb-2 border-b border-border">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: 'Students' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'buses', label: 'Buses' },
            { id: 'routes', label: 'Routes' },
            { id: 'stops', label: 'Stops' },
            { id: 'active-trips', label: 'Live' },
            { id: 'audit-log', label: 'Audit' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-navy text-white'
                  : 'bg-white text-text-secondary border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Action Banner Notice */}
        {actionNotice && (
          <div className="p-3 rounded-btn bg-status-success/10 border border-status-success/30 text-xs font-semibold text-status-success flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  Fleet Operations Overview
                </h1>
                <p className="text-xs text-text-secondary mt-0.5">
                  Real-time database metrics for college bus transit fleet.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="btn-primary !py-2 !px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student</span>
                </button>
                <button
                  onClick={() => setShowAddDriverModal(true)}
                  className="btn-navy !py-2 !px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Driver</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="saas-card p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Total Students
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">
                  {students.length}
                </p>
                <span className="text-[11px] text-accent-teal font-semibold">
                  {students.filter((s) => s.accountStatus === 'ACTIVE').length} Active
                </span>
              </div>

              <div className="saas-card p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Total Drivers
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">
                  {drivers.length}
                </p>
                <span className="text-[11px] text-accent-teal font-semibold">
                  {drivers.filter((d) => d.accountStatus === 'ACTIVE').length} Authorized
                </span>
              </div>

              <div className="saas-card p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Total Fleet Buses
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">
                  {buses.length}
                </p>
                <span className="text-[11px] text-text-secondary font-medium">
                  {buses.filter((b) => b.status === 'ACTIVE').length} Operating
                </span>
              </div>

              <div className="saas-card p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Active Trips
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-status-success">
                  {activeTrips.length || 1}
                </p>
                <span className="text-[11px] text-status-success font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                  Live GPS Broadcasting
                </span>
              </div>

              <div className="saas-card p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Total Stops
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-navy">
                  {stops.length}
                </p>
                <span className="text-[11px] text-text-secondary font-medium">
                  Across {routes.length} Routes
                </span>
              </div>
            </div>

            {/* Live Operational Fleet Preview */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-status-success animate-pulse" />
                  <h3 className="text-sm font-bold text-primary-navy uppercase tracking-wider">
                    Live Telemetry Dispatch Monitor
                  </h3>
                </div>
                <span className="text-xs text-text-muted">
                  Arrival Geofence: {collegeDest.arrivalRadiusMeters}m
                </span>
              </div>

              <div className="h-[340px] rounded-card overflow-hidden border border-border">
                <LiveMap
                  busPosition={{
                    lat: currentTrip?.latestLatitude ?? 17.4085,
                    lng: currentTrip?.latestLongitude ?? 78.452,
                    heading: currentTrip?.latestHeading ?? 135,
                    busNumber: currentTrip?.busNumber || 'BUS-04',
                    speedKmh: currentTrip?.latestSpeedKmh ?? 38,
                  }}
                  pickupPoints={stops}
                  collegeDestination={collegeDest}
                  routePolyline={ROUTE_7_WAYPOINTS}
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="saas-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-primary-navy">Recent Administrative Actions</h3>
              <div className="divide-y divide-border">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.eventId} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-primary-navy mr-2">{log.action}</span>
                      <span className="text-text-secondary">{log.details}</span>
                    </div>
                    <span className="text-text-muted shrink-0 ml-4">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  Student Account Provisioning
                </h1>
                <p className="text-xs text-text-secondary">
                  Manage enrolled students, stop subscriptions, and account statuses.
                </p>
              </div>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="saas-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex-1 relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by student name, ID, registration number, or login email..."
                  className="saas-input w-full pl-9 !py-1.5"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-text-muted font-medium">Status:</span>
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                  className="saas-input !py-1.5 !px-2.5"
                >
                  <option value="ALL">All Accounts ({students.length})</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="DEACTIVATED">Deactivated Only</option>
                </select>
              </div>
            </div>

            {/* Responsive Student Table */}
            <div className="saas-card overflow-x-auto border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-main border-b border-border text-text-muted font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">College Reg No</th>
                    <th className="p-3.5">Login Identifier</th>
                    <th className="p-3.5">Assigned Bus</th>
                    <th className="p-3.5">Pickup Stop</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-text-muted">
                        No student records found matching the current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-bg-main/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary-navy">{s.studentId}</td>
                        <td className="p-3.5 font-semibold text-text-primary">{s.fullName}</td>
                        <td className="p-3.5 font-mono text-text-secondary">{s.regNumber}</td>
                        <td className="p-3.5 font-mono text-accent-teal">{s.loginIdentifier}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-bold bg-primary-navy/10 text-primary-navy text-[11px]">
                            {s.assignedBusNumber}
                          </span>
                        </td>
                        <td className="p-3.5 text-text-secondary truncate max-w-[160px]" title={s.pickupPointName}>
                          {s.pickupPointName}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.accountStatus === 'ACTIVE'
                                ? 'bg-status-success/10 text-status-success'
                                : 'bg-status-error/10 text-status-error'
                            }`}
                          >
                            {s.accountStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                toggleStudentStatus(s.id);
                                showTemporaryNotice(`Toggled status for ${s.fullName}`);
                              }}
                              className="btn-secondary !py-1 !px-2 text-[11px]"
                              title={s.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {s.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                deleteStudent(s.id);
                                showTemporaryNotice(`Removed student record ${s.studentId}`);
                              }}
                              className="btn-icon !w-7 !h-7 text-status-error hover:bg-status-error/10"
                              title="Delete Student Record"
                              aria-label="Delete Student Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVERS */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  Driver Operator Management
                </h1>
                <p className="text-xs text-text-secondary">
                  Manage drivers, phone broadcasting credentials, and bus assignments.
                </p>
              </div>

              <button
                onClick={() => setShowAddDriverModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver</span>
              </button>
            </div>

            {/* Driver Search Bar */}
            <div className="saas-card p-3 flex items-center gap-3 text-xs">
              <div className="flex-1 relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Search by driver name, ID, or login identifier..."
                  className="saas-input w-full pl-9 !py-1.5"
                />
              </div>
            </div>

            <div className="saas-card overflow-x-auto border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-main border-b border-border text-text-muted font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Driver ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Login Identifier</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Commercial License</th>
                    <th className="p-3.5">Assigned Bus</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {filteredDrivers.map((d) => (
                    <tr key={d.id} className="hover:bg-bg-main/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-primary-navy">{d.driverId}</td>
                      <td className="p-3.5 font-semibold text-text-primary">{d.fullName}</td>
                      <td className="p-3.5 font-mono text-accent-teal">{d.loginIdentifier}</td>
                      <td className="p-3.5 text-text-secondary">{d.phone}</td>
                      <td className="p-3.5 font-mono text-text-muted">{d.licenseNumber}</td>
                      <td className="p-3.5 font-bold text-primary-navy">{d.assignedBusNumber}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.accountStatus === 'ACTIVE'
                              ? 'bg-status-success/10 text-status-success'
                              : 'bg-status-error/10 text-status-error'
                          }`}
                        >
                          {d.accountStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            toggleDriverStatus(d.id);
                            showTemporaryNotice(`Toggled status for driver ${d.fullName}`);
                          }}
                          className="btn-secondary !py-1 !px-2.5 text-[11px]"
                        >
                          {d.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BUSES */}
        {activeTab === 'buses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  College Bus Fleet
                </h1>
                <p className="text-xs text-text-secondary">
                  Active bus fleet registration, driver pairings, and operational states.
                </p>
              </div>

              <button
                onClick={() => setShowAddBusModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bus</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buses.map((b) => (
                <div key={b.busId} className="saas-card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-btn bg-primary-navy text-white flex items-center justify-center font-bold text-xs">
                        <BusIcon className="w-4 h-4 text-accent-teal" />
                      </div>
                      <span className="font-extrabold text-base text-primary-navy">{b.busNumber}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'ACTIVE'
                          ? 'bg-status-success/10 text-status-success'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <p className="flex justify-between">
                      <span className="text-text-muted">Assigned Route:</span>
                      <span className="font-semibold text-primary-navy">{b.routeId}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-text-muted">Assigned Driver:</span>
                      <span className="font-semibold text-primary-navy">{b.assignedDriverName || 'Unassigned'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-text-muted">Active Trip:</span>
                      <span className="font-mono text-accent-teal">{b.currentTripId || 'None'}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <button
                      onClick={() => {
                        toggleBusStatus(b.busId);
                        showTemporaryNotice(`Toggled status for ${b.busNumber}`);
                      }}
                      className="btn-secondary !py-1 !px-2.5 text-xs"
                    >
                      {b.status === 'ACTIVE' ? 'Set Idle' : 'Activate Bus'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ROUTES */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  Route Management
                </h1>
                <p className="text-xs text-text-secondary">
                  Configure college transit corridors and origin-destination routes.
                </p>
              </div>

              <button
                onClick={() => setShowAddRouteModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Create Route</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((r) => (
                <div key={r.routeId} className="saas-card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <Route className="w-4 h-4 text-accent-teal" />
                      <span className="font-bold text-base text-primary-navy">{r.routeName}</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-bg-main px-2 py-0.5 rounded text-text-secondary">
                      {r.routeId}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-text-secondary">
                    <p>
                      <strong>Origin:</strong> {r.startPoint}
                    </p>
                    <p>
                      <strong>Destination:</strong> {r.endPoint}
                    </p>
                    <p>
                      <strong>Stops count:</strong> {stops.filter((s) => s.routeId === r.routeId).length} stops configured
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PICKUP POINTS */}
        {activeTab === 'stops' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  Pickup Stop Calibration
                </h1>
                <p className="text-xs text-text-secondary">
                  Manage student boarding stations with exact GPS latitude and longitude.
                </p>
              </div>

              <button
                onClick={() => setShowAddStopModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pickup Stop</span>
              </button>
            </div>

            <div className="saas-card overflow-x-auto border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-main border-b border-border text-text-muted font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Sequence</th>
                    <th className="p-3.5">Stop ID</th>
                    <th className="p-3.5">Stop Name</th>
                    <th className="p-3.5">Route</th>
                    <th className="p-3.5">Latitude</th>
                    <th className="p-3.5">Longitude</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {stops.map((stop) => (
                    <tr key={stop.pickupPointId} className="hover:bg-bg-main/50 transition-colors">
                      <td className="p-3.5 font-bold text-accent-teal">{stop.sequenceNumber}</td>
                      <td className="p-3.5 font-mono text-primary-navy">{stop.pickupPointId}</td>
                      <td className="p-3.5 font-semibold">{stop.name}</td>
                      <td className="p-3.5 font-mono text-text-secondary">{stop.routeId}</td>
                      <td className="p-3.5 font-mono text-text-muted">{stop.lat.toFixed(5)}</td>
                      <td className="p-3.5 font-mono text-text-muted">{stop.lng.toFixed(5)}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            deletePickupPoint(stop.pickupPointId);
                            showTemporaryNotice(`Deleted stop ${stop.name}`);
                          }}
                          className="btn-icon !w-7 !h-7 text-status-error hover:bg-status-error/10"
                          title="Delete Stop"
                          aria-label="Delete Stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVE TRIPS */}
        {activeTab === 'active-trips' && (
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
              Live Active Trips
            </h1>
            <p className="text-xs text-text-secondary">
              Trips currently broadcasting live smartphone GPS updates from drivers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="saas-card p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                    <span className="font-extrabold text-primary-navy text-sm">
                      {currentTrip?.busNumber || 'BUS-04'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-success/10 text-status-success">
                    {currentTrip?.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-text-secondary">
                  <p className="flex justify-between">
                    <span>Driver:</span>
                    <strong className="text-primary-navy">{currentTrip?.driverName || 'Ramesh K.'}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono">{currentTrip?.latestLatitude?.toFixed(4)}, {currentTrip?.latestLongitude?.toFixed(4)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Current Speed:</span>
                    <strong className="text-accent-teal">{currentTrip?.latestSpeedKmh || 38} km/h</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>GPS Accuracy:</span>
                    <span>±{currentTrip?.latestAccuracyMeters || 10}m</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Last Telemetry Packet:</span>
                    <span>{currentTrip?.lastLocationUpdate ? new Date(currentTrip.lastLocationUpdate).toLocaleTimeString() : 'Active'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: TRIP HISTORY */}
        {activeTab === 'trip-history' && (
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
              Trip History & Completion Archive
            </h1>
            <p className="text-xs text-text-secondary">
              Auditable records of completed morning and afternoon student commute trips.
            </p>

            <div className="saas-card p-6 text-center space-y-2">
              <History className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="font-bold text-sm text-primary-navy">Historical Trips Maintained In Ledger</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Completed trips are securely archived without unneeded raw second-by-second coordinate overhead, keeping database costs at ₹0 free-tier.
              </p>
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT LOG */}
        {activeTab === 'audit-log' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                  Administrative Audit Trail
                </h1>
                <p className="text-xs text-text-secondary">
                  Immutable security and operational event log.
                </p>
              </div>
            </div>

            <div className="saas-card divide-y divide-border overflow-hidden">
              {auditLogs.map((log) => (
                <div key={log.eventId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary-navy">{log.action}</span>
                      <span className="px-2 py-0.5 rounded bg-bg-main text-[10px] font-mono text-text-muted">
                        Actor: {log.actor}
                      </span>
                    </div>
                    <p className="text-text-secondary">{log.details}</p>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-navy">
                System & Geofence Settings
              </h1>
              <p className="text-xs text-text-secondary">
                Configure destination coordinates, arrival tolerance radius, and defaults.
              </p>
            </div>

            <div className="saas-card p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary-navy block">
                  Campus Name
                </label>
                <input
                  type="text"
                  value={settings.collegeName}
                  onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                  className="saas-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary-navy block">
                    Campus Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.destinationLat}
                    onChange={(e) => setSettings({ ...settings, destinationLat: parseFloat(e.target.value) })}
                    className="saas-input w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary-navy block">
                    Campus Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settings.destinationLng}
                    onChange={(e) => setSettings({ ...settings, destinationLng: parseFloat(e.target.value) })}
                    className="saas-input w-full"
                  />
                </div>
              </div>

              {/* Arrival Radius slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-primary-navy">
                    College Arrival Geofence Radius: <span className="text-accent-teal">{settings.arrivalRadiusMeters} meters</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={settings.arrivalRadiusMeters}
                  onChange={(e) => {
                    const r = parseInt(e.target.value);
                    setSettings({ ...settings, arrivalRadiusMeters: r });
                  }}
                  className="w-full accent-accent-teal cursor-pointer"
                />
                <p className="text-[11px] text-text-muted">
                  Buses entering within {settings.arrivalRadiusMeters}m of campus coordinates are officially detected as "ARRIVED".
                </p>
              </div>

              <button
                onClick={() => {
                  updateAdminSettings(settings);
                  showTemporaryNotice('Successfully updated college destination settings.');
                }}
                className="btn-primary !py-2.5 !px-5 text-xs font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Administrative Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD STUDENT */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-modal shadow-dropdown border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-primary-navy">Provision New Student</h3>
                <button onClick={() => setShowAddStudentModal(false)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStdName}
                    onChange={(e) => setNewStdName(e.target.value)}
                    placeholder="e.g. Anjali Nair"
                    className="saas-input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Student ID</label>
                    <input
                      type="text"
                      required
                      value={newStdId}
                      onChange={(e) => setNewStdId(e.target.value)}
                      placeholder="e.g. STU-2024-055"
                      className="saas-input w-full"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">College Reg No</label>
                    <input
                      type="text"
                      value={newStdReg}
                      onChange={(e) => setNewStdReg(e.target.value)}
                      placeholder="e.g. 21CS089"
                      className="saas-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Login Identifier / Email</label>
                  <input
                    type="text"
                    required
                    value={newStdEmail}
                    onChange={(e) => setNewStdEmail(e.target.value)}
                    placeholder="e.g. anjali@123 or anjali@anshary.edu"
                    className="saas-input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Assigned Bus</label>
                    <select
                      value={newStdBusId}
                      onChange={(e) => setNewStdBusId(e.target.value)}
                      className="saas-input w-full"
                    >
                      {buses.map((b) => (
                        <option key={b.busId} value={b.busId}>
                          {b.busNumber} ({b.routeId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Pickup Stop</label>
                    <select
                      value={newStdStopId}
                      onChange={(e) => setNewStdStopId(e.target.value)}
                      className="saas-input w-full"
                    >
                      {stops.map((s) => (
                        <option key={s.pickupPointId} value={s.pickupPointId}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="btn-secondary !py-2 !px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary !py-2 !px-4">
                    Provision Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD DRIVER */}
        {showAddDriverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-modal shadow-dropdown border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-primary-navy">Provision Driver Account</h3>
                <button onClick={() => setShowAddDriverModal(false)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    value={newDrvName}
                    onChange={(e) => setNewDrvName(e.target.value)}
                    placeholder="e.g. Harish Kumar"
                    className="saas-input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Driver ID</label>
                    <input
                      type="text"
                      required
                      value={newDrvId}
                      onChange={(e) => setNewDrvId(e.target.value)}
                      placeholder="e.g. DRV-108"
                      className="saas-input w-full"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newDrvPhone}
                      onChange={(e) => setNewDrvPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="saas-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Login Identifier</label>
                  <input
                    type="text"
                    required
                    value={newDrvLogin}
                    onChange={(e) => setNewDrvLogin(e.target.value)}
                    placeholder="e.g. harish@123 or driver_harish"
                    className="saas-input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Commercial License</label>
                    <input
                      type="text"
                      value={newDrvLicense}
                      onChange={(e) => setNewDrvLicense(e.target.value)}
                      placeholder="AP-10-2020-001"
                      className="saas-input w-full"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Assigned Bus</label>
                    <select
                      value={newDrvBusId}
                      onChange={(e) => setNewDrvBusId(e.target.value)}
                      className="saas-input w-full"
                    >
                      {buses.map((b) => (
                        <option key={b.busId} value={b.busId}>
                          {b.busNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDriverModal(false)}
                    className="btn-secondary !py-2 !px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary !py-2 !px-4">
                    Create Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD BUS */}
        {showAddBusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-modal shadow-dropdown border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-primary-navy">Register New Fleet Bus</h3>
                <button onClick={() => setShowAddBusModal(false)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBus} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Bus Number</label>
                  <input
                    type="text"
                    required
                    value={newBusNumber}
                    onChange={(e) => setNewBusNumber(e.target.value)}
                    placeholder="e.g. BUS-12"
                    className="saas-input w-full uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Assigned Route</label>
                  <select
                    value={newBusRouteId}
                    onChange={(e) => setNewBusRouteId(e.target.value)}
                    className="saas-input w-full"
                  >
                    {routes.map((r) => (
                      <option key={r.routeId} value={r.routeId}>
                        {r.routeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Lead Driver Name</label>
                  <input
                    type="text"
                    value={newBusDriverName}
                    onChange={(e) => setNewBusDriverName(e.target.value)}
                    placeholder="e.g. Anand P."
                    className="saas-input w-full"
                  />
                </div>

                <div className="pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBusModal(false)}
                    className="btn-secondary !py-2 !px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary !py-2 !px-4">
                    Register Bus
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD STOP */}
        {showAddStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-modal shadow-dropdown border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-primary-navy">Add Pickup Point</h3>
                <button onClick={() => setShowAddStopModal(false)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStop} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Stop Name</label>
                  <input
                    type="text"
                    required
                    value={newStopName}
                    onChange={(e) => setNewStopName(e.target.value)}
                    placeholder="e.g. Stop 5: Cyber Towers Gate"
                    className="saas-input w-full"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Route</label>
                  <select
                    value={newStopRouteId}
                    onChange={(e) => setNewStopRouteId(e.target.value)}
                    className="saas-input w-full"
                  >
                    {routes.map((r) => (
                      <option key={r.routeId} value={r.routeId}>
                        {r.routeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Latitude</label>
                    <input
                      type="text"
                      required
                      value={newStopLat}
                      onChange={(e) => setNewStopLat(e.target.value)}
                      className="saas-input w-full"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-text-primary block mb-1">Longitude</label>
                    <input
                      type="text"
                      required
                      value={newStopLng}
                      onChange={(e) => setNewStopLng(e.target.value)}
                      className="saas-input w-full"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStopModal(false)}
                    className="btn-secondary !py-2 !px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary !py-2 !px-4">
                    Save Stop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD ROUTE */}
        {showAddRouteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-navy/60 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-modal shadow-dropdown border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-primary-navy">Create Bus Route</h3>
                <button onClick={() => setShowAddRouteModal(false)} className="text-text-muted hover:text-text-primary">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-text-primary block mb-1">Route Identifier</label>
                  <input
                    type="text"
                    value={newRouteId}
                    onChange={(e) => setNewRouteId(e.target.value)}
                    placeholder="e.g. route_12"
                    className="saas-input w-full font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    placeholder="e.g. Route 12 - North Campus Express"
                    className="saas-input w-full"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Start Origin Point</label>
                  <input
                    type="text"
                    value={newRouteStart}
                    onChange={(e) => setNewRouteStart(e.target.value)}
                    placeholder="e.g. North Terminal"
                    className="saas-input w-full"
                  />
                </div>

                <div>
                  <label className="font-semibold text-text-primary block mb-1">Destination Point</label>
                  <input
                    type="text"
                    value={newRouteEnd}
                    onChange={(e) => setNewRouteEnd(e.target.value)}
                    placeholder="e.g. Anshary College Campus"
                    className="saas-input w-full"
                  />
                </div>

                <div className="pt-3 border-t border-border flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRouteModal(false)}
                    className="btn-secondary !py-2 !px-3"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary !py-2 !px-4">
                    Create Route
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
