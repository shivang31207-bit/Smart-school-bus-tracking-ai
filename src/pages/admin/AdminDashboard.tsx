import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { Bus, Route, Student, BusStatus, AttendanceStatus } from '../../types';
import { LeafletMap } from '../../components/maps/LeafletMap';
import {
  OnTimeChart,
  UtilizationChart,
  AttendanceChart,
  SpeedTrendsChart,
} from '../../components/charts/FleetCharts';
import {
  BusModal,
  RouteModal,
  StudentModal,
  ConfirmDeleteModal,
} from '../../components/ui/Modals';
import { getBusStatusBadge, getAttendanceBadge, formatSpeed } from '../../utils/formatters';
import {
  Bus as BusIcon,
  MapPin,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Gauge,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
  Radio,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

type AdminTab =
  | 'dispatch'
  | 'fleet_tracking'
  | 'buses'
  | 'routes'
  | 'students'
  | 'attendance'
  | 'safety'
  | 'analytics';

export const AdminDashboard: React.FC = () => {
  const {
    buses,
    routes,
    students,
    alerts,
    speedViolations,
    routeDeviations,
    addBus,
    updateBus,
    deleteBus,
    addRoute,
    updateRoute,
    deleteRoute,
    addStudent,
    updateStudent,
    deleteStudent,
    markStudentAttendance,
    resolveAlert,
    showToast,
    isFirebaseConnected,
    isSeedingFirebase,
    seedDatabaseToFirebase,
  } = useTransport();

  const [activeTab, setActiveTab] = useState<AdminTab>('dispatch');
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-04');
  const [busFilterStatus, setBusFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [busToEdit, setBusToEdit] = useState<Bus | null>(null);

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Calculate real-time aggregate stats
  const totalBuses = buses.length;
  const activeTripsCount = buses.filter((b) => b.status === 'moving' || b.status === 'delayed').length;
  const delayedCount = buses.filter((b) => b.status === 'delayed').length;
  const emergencyCount = buses.filter((b) => b.status === 'emergency').length;
  const studentsOnboard = buses.reduce((acc, b) => acc + b.currentOccupancy, 0);
  const speedAlertsCount = speedViolations.length;

  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0];
  const selectedBusRoute = routes.find((r) => r.id === selectedBus?.routeId);

  // Filtered buses list
  const filteredBuses = buses.filter((bus) => {
    const matchesFilter = busFilterStatus === 'all' || bus.status === busFilterStatus;
    const matchesSearch =
      bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Operational Subnav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Campus Fleet Command Center
            </h1>
            <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              DISPATCH LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Oakridge International Academy • Central Transportation Logistics & Safety System
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'dispatch', label: 'Dispatch Console', icon: <Radio className="w-3.5 h-3.5" /> },
            { id: 'fleet_tracking', label: 'Live Tracking', icon: <MapPin className="w-3.5 h-3.5" /> },
            { id: 'buses', label: 'Buses', icon: <BusIcon className="w-3.5 h-3.5" /> },
            { id: 'routes', label: 'Routes', icon: <CompassRouteIcon /> },
            { id: 'students', label: 'Students', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'safety', label: 'Safety & Speed', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRICS STRIP (SaaS Standard Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Fleet</span>
            <BusIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalBuses}</span>
            <span className="text-[10px] text-slate-400 font-medium">Buses</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">100% Inspected & Ready</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Trips</span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 font-mono">{activeTripsCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">/ {totalBuses}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Live GPS Sharing Active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Students Onboard</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{studentsOnboard}</span>
            <span className="text-[10px] text-slate-400 font-medium">/ 1,240</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">Digital manifest verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">On-Time Rate</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">99.4%</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">Target SLA: &gt;98%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delayed Buses</span>
            <AlertTriangle className={`w-4 h-4 ${delayedCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${delayedCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {delayedCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Flagged</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">Traffic monitoring active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Safety Telemetry</span>
            <Gauge className={`w-4 h-4 ${emergencyCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${emergencyCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
              {emergencyCount > 0 ? 'SOS' : `${speedAlertsCount}`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Alerts</span>
          </div>
          <div className={`text-[10px] font-medium mt-1 ${emergencyCount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
            {emergencyCount > 0 ? 'Emergency beacon active' : 'Normal corridor limits'}
          </div>
        </div>
      </div>

      {/* FIREBASE CLOUD DATABASE STATUS BAR */}
      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Cloud Firestore Connected:</span>
              <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-[11px]">
                smart-school-bus-tracking-ai
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE SYNC READY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live updates propagate across devices via Firebase Realtime listeners.
            </p>
          </div>
        </div>

        <button
          onClick={seedDatabaseToFirebase}
          disabled={isSeedingFirebase}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>{isSeedingFirebase ? 'Syncing to Cloud...' : 'Upload Fleet to Firestore'}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DISPATCH CONSOLE & OVERVIEW
          ========================================================================= */}
      {activeTab === 'dispatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map Box */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">Campus Live Telemetry Map</h3>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                  {buses.length} Fleet Nodes
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Tracking: <strong className="text-blue-600 font-mono">{selectedBus?.id}</strong> ({selectedBus?.name})
              </div>
            </div>

            <div className="relative h-[480px] w-full">
              <LeafletMap
                buses={buses}
                selectedBusId={selectedBusId}
                onSelectBus={(id) => setSelectedBusId(id)}
                center={selectedBus ? [selectedBus.location.lat, selectedBus.location.lng] : [28.5921, 77.2289]}
                zoom={13}
                routePath={selectedBusRoute?.waypoints}
                routeColor={selectedBusRoute?.color}
                stops={selectedBusRoute?.stops}
              />
            </div>

            {/* Quick telemetry footer of selected bus */}
            {selectedBus && (
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                    {selectedBus.id}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">{selectedBus.name}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-600">{selectedBus.driverName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-600">
                  <span>Speed: <strong className="text-blue-600 font-mono">{formatSpeed(selectedBus.speed)}</strong></span>
                  <span>Occupancy: <strong className="font-mono">{selectedBus.currentOccupancy}/{selectedBus.capacity}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getBusStatusBadge(selectedBus.status).badgeClass}`}>
                    {selectedBus.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Dispatch Feed & Active Buses List */}
          <div className="space-y-5">
            {/* Bus Quick Selector & Status List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Fleet Roster Overview</h4>
                <span className="text-[11px] text-slate-400 font-medium">Click to focus</span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {buses.slice(0, 8).map((bus) => {
                  const isSelected = bus.id === selectedBusId;
                  const badge = getBusStatusBadge(bus.status);
                  return (
                    <div
                      key={bus.id}
                      onClick={() => setSelectedBusId(bus.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{bus.id}</span>
                          <span className="text-slate-500 text-[11px] truncate max-w-[120px]">{bus.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[150px]">{bus.driverName}</span>
                        <span className="font-mono font-medium">{formatSpeed(bus.speed)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('fleet_tracking')}
                className="w-full mt-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <span>View All 34 Buses on Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Safety & Operations Log */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Active Dispatch Notices</h4>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                  {alerts.filter((a) => !a.resolved).length} Unresolved
                </span>
              </div>

              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs ${
                      alert.resolved ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 leading-snug">{alert.title}</span>
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE FLEET TRACKING (Full Map + Filters)
          ========================================================================= */}
      {activeTab === 'fleet_tracking' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[750px]">
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Filter:</span>
              {(['all', 'moving', 'stopped', 'delayed', 'emergency'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setBusFilterStatus(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    busFilterStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st} ({st === 'all' ? buses.length : buses.filter((b) => b.status === st).length})
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Simulation Rate: <span className="font-mono text-blue-600 font-bold">5s Telemetry Ping</span>
            </div>
          </div>

          <div className="relative flex-1 w-full">
            <LeafletMap
              buses={filteredBuses}
              selectedBusId={selectedBusId}
              onSelectBus={(id) => setSelectedBusId(id)}
              center={selectedBus ? [selectedBus.location.lat, selectedBus.location.lng] : [28.5921, 77.2289]}
              zoom={13}
              routePath={selectedBusRoute?.waypoints}
              routeColor={selectedBusRoute?.color}
              stops={selectedBusRoute?.stops}
            />

            {/* Floating Selected Bus Telemetry Card */}
            {selectedBus && (
              <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl max-w-xs w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedBus.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      getBusStatusBadge(selectedBus.status).badgeClass
                    }`}
                  >
                    {selectedBus.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{selectedBus.name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedBus.registrationNumber}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-semibold text-slate-800">{selectedBus.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-semibold text-slate-800">{selectedBus.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver Contact:</span>
                    <span className="font-mono text-slate-800">{selectedBus.driverPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Velocity:</span>
                    <span className="font-mono font-bold text-blue-600">{formatSpeed(selectedBus.speed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Occupancy:</span>
                    <span className="font-bold text-slate-900">{selectedBus.currentOccupancy} / {selectedBus.capacity} seats</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FLEET MANAGEMENT (CRUD Table)
          ========================================================================= */}
      {activeTab === 'buses' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header & Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search bus ID, plate, driver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>

              <select
                value={busFilterStatus}
                onChange={(e) => setBusFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses ({buses.length})</option>
                <option value="moving">Moving</option>
                <option value="stopped">Stopped</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <button
              onClick={() => {
                setBusToEdit(null);
                setIsBusModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bus</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Bus Identifier</th>
                  <th className="px-4 py-3">Registration Plate</th>
                  <th className="px-4 py-3">Assigned Route</th>
                  <th className="px-4 py-3">Driver & Contact</th>
                  <th className="px-4 py-3">Capacity & Load</th>
                  <th className="px-4 py-3">Telemetry Speed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBuses.map((bus) => {
                  const badge = getBusStatusBadge(bus.status);
                  return (
                    <tr key={bus.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {bus.id}
                        <div className="font-sans font-normal text-slate-500 text-[11px]">{bus.name}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{bus.registrationNumber}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{bus.routeName}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{bus.driverName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{bus.driverPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">
                          {bus.currentOccupancy} / {bus.capacity} seats
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${(bus.currentOccupancy / bus.capacity) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{formatSpeed(bus.speed)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setBusToEdit(bus);
                              setIsBusModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Bus"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteDialog({
                                isOpen: true,
                                title: `Decommission Bus ${bus.id}?`,
                                message: `Are you sure you want to remove ${bus.id} (${bus.name}) from the school fleet? This action will unassign students linked to this bus.`,
                                onConfirm: () => deleteBus(bus.id),
                              });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Bus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ROUTE MANAGEMENT
          ========================================================================= */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Transit Corridors & Sequence Control</h3>
              <p className="text-xs text-slate-500">Configure pickup stops, departure timetables, and designated fleet vehicles</p>
            </div>
            <button
              onClick={() => {
                setRouteToEdit(null);
                setIsRouteModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-8 rounded-sm"
                      style={{ backgroundColor: route.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                          {route.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{route.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assigned Bus: <strong className="text-blue-600 font-mono">{route.assignedBusId}</strong> • Driver: {route.assignedDriverId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRouteToEdit(route);
                        setIsRouteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit Route"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteDialog({
                          isOpen: true,
                          title: `Delete Route ${route.code}?`,
                          message: `Are you sure you want to remove ${route.name}? Assigned buses will need to be reallocated.`,
                          onConfirm: () => deleteRoute(route.id),
                        });
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Distance</span>
                    <div className="font-mono font-bold text-slate-800">{route.totalDistanceKm} km</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Est. Duration</span>
                    <div className="font-mono font-bold text-slate-800">{route.estimatedDurationMin} mins</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Morning Start</span>
                    <div className="font-mono font-bold text-slate-800">{route.morningStartTime}</div>
                  </div>
                </div>

                {/* Stop sequence */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Stop Sequence ({route.stops.length} stops)
                  </div>
                  <div className="space-y-1.5">
                    {route.stops.map((stop, i) => (
                      <div
                        key={stop.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{stop.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span>{stop.scheduledTime}</span>
                          <span className="font-bold text-blue-600">{stop.studentCount} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: STUDENT MANAGEMENT
          ========================================================================= */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student name, roll, guardian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <button
              onClick={() => {
                setStudentToEdit(null);
                setIsStudentModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class & Roll</th>
                  <th className="px-4 py-3">Assigned Bus</th>
                  <th className="px-4 py-3">Pickup Location</th>
                  <th className="px-4 py-3">Guardian / Phone</th>
                  <th className="px-4 py-3">Today Attendance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.grade.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((student) => {
                    const attBadge = getAttendanceBadge(student.attendanceStatus);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {student.grade} • Roll #{student.rollNo}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">{student.busId}</td>
                        <td className="px-4 py-3 text-slate-700">{student.pickupStopName}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{student.parentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{student.parentPhone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${attBadge.badgeClass}`}>
                            {attBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setStudentToEdit(student);
                                setIsStudentModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Student"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteDialog({
                                  isOpen: true,
                                  title: `Remove ${student.name}?`,
                                  message: `Are you sure you want to withdraw ${student.name} from school bus transit enrollment?`,
                                  onConfirm: () => deleteStudent(student.id),
                                });
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: DIGITAL ATTENDANCE LOG (Boarding / Drop-off System)
          ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Digital Boarding & Drop-Off Log</h3>
              <p className="text-xs text-slate-500">Live RFID & Driver check-in events synced across parent and school dashboards</p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'boarded', 'waiting', 'dropped_off', 'absent'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setBusFilterStatus(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    busFilterStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Assigned Bus</th>
                    <th className="px-4 py-3">Designated Stop</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Scan Time</th>
                    <th className="px-4 py-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => busFilterStatus === 'all' || s.attendanceStatus === busFilterStatus)
                    .map((s) => {
                      const badge = getAttendanceBadge(s.attendanceStatus);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-[11px] text-slate-400">{s.grade}</div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-blue-600">{s.busId}</td>
                          <td className="px-4 py-3 text-slate-700">{s.pickupStopName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.badgeClass}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">
                            {s.attendanceTimestamp || 'Pending'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => markStudentAttendance(s.id, 'boarded')}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded border border-emerald-200 transition-colors"
                              >
                                Boarded
                              </button>
                              <button
                                onClick={() => markStudentAttendance(s.id, 'dropped_off')}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded border border-blue-200 transition-colors"
                              >
                                Dropped
                              </button>
                              <button
                                onClick={() => markStudentAttendance(s.id, 'absent')}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded border border-rose-200 transition-colors"
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: SAFETY, SPEED & ROUTE DEVIATIONS
          ========================================================================= */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speed Violations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Speed Limit Monitoring</h4>
                    <p className="text-xs text-slate-500">Configured safety ceiling: 45 km/h across urban transit</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  {speedViolations.length} Detected
                </span>
              </div>

              <div className="space-y-2.5">
                {speedViolations.map((v) => (
                  <div key={v.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-900">{v.busId} ({v.registrationNumber})</span>
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {v.speed} km/h (Limit: {v.speedLimit})
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">Driver: {v.driverName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Location: {v.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Deviation Monitoring */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Route Deviation Telemetry</h4>
                    <p className="text-xs text-slate-500">Threshold: &gt;250m off assigned waypoint geometry</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                  {routeDeviations.length} Active
                </span>
              </div>

              <div className="space-y-2.5">
                {routeDeviations.map((dev) => (
                  <div key={dev.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-900">{dev.busId}</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                        Deviation: {dev.deviationDistanceMeters}m
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800">{dev.routeName}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Telemetry log: {dev.currentLocation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: FLEET ANALYTICS
          ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OnTimeChart />
            <UtilizationChart />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttendanceChart />
            <SpeedTrendsChart />
          </div>
        </div>
      )}

      {/* MODALS */}
      <BusModal
        isOpen={isBusModalOpen}
        busToEdit={busToEdit}
        routes={routes}
        onClose={() => setIsBusModalOpen(false)}
        onSave={(data) => {
          if (busToEdit) {
            updateBus(data);
          } else {
            addBus(data);
          }
        }}
      />

      <RouteModal
        isOpen={isRouteModalOpen}
        routeToEdit={routeToEdit}
        buses={buses}
        onClose={() => setIsRouteModalOpen(false)}
        onSave={(data) => {
          if (routeToEdit) {
            updateRoute(data);
          } else {
            addRoute(data);
          }
        }}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        studentToEdit={studentToEdit}
        buses={buses}
        routes={routes}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={(data) => {
          if (studentToEdit) {
            updateStudent(data);
          } else {
            addStudent(data);
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.title}
        message={deleteDialog.message}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
};

const CompassRouteIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.512a2 2 0 011.553-1.954L9 2m0 18l6-3m-6 3V2m6 15l5.447 2.724A2 2 0 0021 17.488V7.512a2 2 0 00-1.553-1.954L15 4m0 13V4m0 0L9 2" />
  </svg>
);
