import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { LeafletMap } from '../../components/maps/LeafletMap';
import { AttendanceStatus, TripStatus } from '../../types';
import { getAttendanceBadge, formatDuration, formatSpeed } from '../../utils/formatters';
import {
  Play,
  Pause,
  Square,
  AlertOctagon,
  Users,
  Compass,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  Search,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  UserCheck,
  Smartphone,
  Battery,
  Power,
  Wifi,
  WifiOff,
  Siren,
  Zap,
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const {
    activeDriverBusId,
    buses,
    routes,
    drivers,
    students,
    driverTripState,
    startDriverTrip,
    pauseDriverTrip,
    resumeDriverTrip,
    endDriverTrip,
    markStudentAttendance,
    triggerEmergencySos,
    showToast,
    driverDeviceSensor,
    toggleDriverDevicePower,
  } = useTransport();

  const [searchStudent, setSearchStudent] = useState('');
  const [filterStop, setFilterStop] = useState<string>('all');
  const [isSosConfirmOpen, setIsSosConfirmOpen] = useState(false);
  const [sosReason, setSosReason] = useState('Critical Mechanical Breakdown / Road Incident');
  const [completedStops, setCompletedStops] = useState<string[]>(['STP-101-1']);

  const bus = buses.find((b) => b.id === activeDriverBusId) || buses[0]!;
  const route = routes.find((r) => r.id === bus.routeId) || routes[0]!;
  const driver = drivers.find((d) => d.id === bus.driverId) || drivers[0]!;

  // Students assigned to this bus
  const busStudents = students.filter((s) => s.busId === bus.id);
  const boardedCount = busStudents.filter((s) => s.attendanceStatus === 'boarded').length;
  const waitingCount = busStudents.filter((s) => s.attendanceStatus === 'waiting').length;
  const droppedCount = busStudents.filter((s) => s.attendanceStatus === 'dropped_off').length;

  // Filtered student list
  const filteredStudents = busStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.pickupStopName.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesStop = filterStop === 'all' || s.pickupStopId === filterStop;
    return matchesSearch && matchesStop;
  });

  const nextStop = route.stops.find((s) => !completedStops.includes(s.id)) || route.stops[route.stops.length - 1]!;

  const handleToggleStop = (stopId: string) => {
    if (completedStops.includes(stopId)) {
      setCompletedStops((prev) => prev.filter((id) => id !== stopId));
      showToast('Stop status reverted', 'info');
    } else {
      setCompletedStops((prev) => [...prev, stopId]);
      showToast(`Stop check-in completed: ${route.stops.find((s) => s.id === stopId)?.name}`, 'success');
    }
  };

  const handleConfirmSos = () => {
    triggerEmergencySos(bus.id, sosReason);
    setIsSosConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Tablet Navigation & Driver Status Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <img
            src={driver.avatar}
            alt={driver.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sm bg-blue-600 px-2.5 py-0.5 rounded text-white shadow-xs">
                {bus.id}
              </span>
              <h2 className="font-extrabold text-base tracking-tight">{driver.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Route: <strong className="text-slate-200">{route.name}</strong> • {bus.registrationNumber}
            </p>
          </div>
        </div>

        {/* GPS PRIVACY SHARING STATUS BADGE */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${driverTripState.status === 'active'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${driverTripState.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
            />
            <span>
              {driverTripState.status === 'active'
                ? 'ACTIVE TRIP — LOCATION SHARED'
                : 'OFF DUTY — LOCATION NOT SHARED'}
            </span>
          </div>

          {/* SOS BUTTON */}
          <button
            onClick={() => setIsSosConfirmOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-rose-900/50 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <AlertOctagon className="w-4 h-4 animate-bounce" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* SENSOR-BASED PHONE WATCHDOG & POWER STATUS CARD */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all ${
          driverDeviceSensor.isPoweredOn
            ? 'bg-white border-blue-200 shadow-2xs'
            : 'bg-rose-950 border-rose-500 text-white shadow-xl animate-pulse'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                driverDeviceSensor.isPoweredOn
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-rose-600 text-white animate-bounce'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider">
                  Driver Phone Sensor & Heartbeat Watchdog
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full ${
                    driverDeviceSensor.isPoweredOn
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-600 text-white border border-rose-300 animate-ping'
                  }`}
                >
                  {driverDeviceSensor.isPoweredOn ? 'POWERED ON • 86%' : 'POWERED OFF • DISCONNECTED'}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 leading-relaxed ${driverDeviceSensor.isPoweredOn ? 'text-slate-500' : 'text-rose-200 font-medium'}`}>
                {driverDeviceSensor.isPoweredOn
                  ? 'Failsafe armed: If phone powers off or loses telemetry mid-transit, an automated SOS is immediately transmitted to the Nearest Police, Hospital, Parents & Admin.'
                  : '⚠️ SENSOR TRIGGERED: Device shutdown detected! Multi-agency emergency SOS dispatched to Police, Hospital, Parents & Admin.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleDriverDevicePower}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              driverDeviceSensor.isPoweredOn
                ? 'bg-slate-900 hover:bg-black text-rose-300 hover:text-white border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {driverDeviceSensor.isPoweredOn
                ? 'Simulate Phone Switched Off'
                : 'Power On / Restore Device'}
            </span>
          </button>
        </div>
      </div>

      {/* TRIP MANAGEMENT CONTROL STRIP */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Trip Command Controls
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${driverTripState.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : driverTripState.status === 'paused'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
              >
                Status: {driverTripState.status}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600">
                Duration: <strong className="font-mono">{formatDuration(driverTripState.durationSeconds)}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600">
                Distance: <strong className="font-mono">{driverTripState.distanceCoveredKm.toFixed(1)} km</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {driverTripState.status !== 'active' ? (
              <button
                onClick={() => startDriverTrip(bus.id)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Duty Trip</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => pauseDriverTrip(bus.id)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Trip</span>
                </button>
                <button
                  onClick={() => endDriverTrip(bus.id)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>End Trip</span>
                </button>
              </>
            )}

            {driverTripState.status === 'paused' && (
              <button
                onClick={() => resumeDriverTrip(bus.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Trip</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid for Driver */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Current Speed</span>
            <div className="font-mono font-black text-lg text-blue-600 mt-0.5">
              {formatSpeed(bus.speed)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Students Onboard</span>
            <div className="font-mono font-black text-lg text-emerald-600 mt-0.5">
              {boardedCount} / {busStudents.length}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Waiting at Stops</span>
            <div className="font-mono font-black text-lg text-amber-600 mt-0.5">
              {waitingCount}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Target Next Stop</span>
            <div className="font-bold text-xs text-slate-800 truncate mt-1">
              {nextStop ? nextStop.name : 'School Terminal'}
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: LEFT ROUTE PROGRESS & MAP, RIGHT ATTENDANCE ROSTER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stops Progression & Map Preview */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Route Waypoint Progress</h3>
              <span className="text-xs text-slate-500 font-mono">
                {completedStops.length} of {route.stops.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {route.stops.map((stop, index) => {
                const isDone = completedStops.includes(stop.id);
                const isCurrent = nextStop?.id === stop.id;

                return (
                  <div
                    key={stop.id}
                    onClick={() => handleToggleStop(stop.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${isDone
                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : isCurrent
                          ? 'bg-blue-50 border-blue-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${isDone
                            ? 'bg-slate-300 text-slate-700 border-slate-300'
                            : isCurrent
                              ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      <div>
                        <div className={`font-bold ${isCurrent ? 'text-blue-900 text-sm' : 'text-slate-800'}`}>
                          {stop.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{stop.scheduledTime}</span>
                          <span>•</span>
                          <span>{stop.studentCount} students</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${isDone
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {isDone ? 'Completed' : 'Mark Arrival'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact Driver Map */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden h-[260px] relative">
            <LeafletMap
              buses={[bus]}
              selectedBusId={bus.id}
              center={[bus.location.lat, bus.location.lng]}
              zoom={14}
              routePath={route.waypoints}
              routeColor={route.color}
              stops={route.stops}
            />
          </div>
        </div>

        {/* Right: Digital Student Attendance Manifest */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Student Attendance Manifest</h3>
              <p className="text-xs text-slate-500">Tap status to mark boarding or drop-off</p>
            </div>
            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
              {busStudents.length} Assigned
            </span>
          </div>

          {/* Search & Stop Filter */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student name or stop..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStop}
              onChange={(e) => setFilterStop(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none max-w-[130px]"
            >
              <option value="all">All Stops</option>
              {route.stops.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student List with One-Click Toggles */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No students match your query.
              </div>
            ) : (
              filteredStudents.map((s) => {
                const badge = getAttendanceBadge(s.attendanceStatus);
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.grade} • Roll #{s.rollNo}</div>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between">
                      <span className="truncate">{s.pickupStopName}</span>
                      {s.attendanceTimestamp && (
                        <span className="font-mono text-slate-400">@ {s.attendanceTimestamp}</span>
                      )}
                    </div>

                    {/* Touch Buttons for Driver */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => markStudentAttendance(s.id, 'waiting')}
                        className={`py-1 rounded text-[10px] font-bold transition-colors ${s.attendanceStatus === 'waiting'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
                          }`}
                      >
                        Waiting
                      </button>
                      <button
                        type="button"
                        onClick={() => markStudentAttendance(s.id, 'boarded')}
                        className={`py-1 rounded text-[10px] font-bold transition-colors ${s.attendanceStatus === 'boarded'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                          }`}
                      >
                        Boarded
                      </button>
                      <button
                        type="button"
                        onClick={() => markStudentAttendance(s.id, 'dropped_off')}
                        className={`py-1 rounded text-[10px] font-bold transition-colors ${s.attendanceStatus === 'dropped_off'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                          }`}
                      >
                        Dropped
                      </button>
                      <button
                        type="button"
                        onClick={() => markStudentAttendance(s.id, 'absent')}
                        className={`py-1 rounded text-[10px] font-bold transition-colors ${s.attendanceStatus === 'absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-rose-50 border border-slate-200'
                          }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* DOUBLE-CONFIRMATION EMERGENCY SOS MODAL */}
      {isSosConfirmOpen && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-rose-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-500 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-rose-600 text-lg uppercase tracking-tight">
                  Trigger Emergency SOS?
                </h3>
                <p className="text-xs text-slate-500">Dual-confirmation required for safety broadcast</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Confirming this beacon immediately transmits high-priority critical emergency telemetry from{' '}
              <strong className="text-slate-900 font-mono">{bus.id}</strong> directly to the{' '}
              <strong className="text-blue-700">Nearest Police Station</strong>,{' '}
              <strong className="text-emerald-700">Nearest Hospital Trauma ER</strong>,{' '}
              <strong className="text-indigo-700">All Parents</strong>, and{' '}
              <strong className="text-slate-900">School Administration Command</strong>.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Emergency Classification
              </label>
              <select
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="Vehicle Collision / Road Accident (Structural Damage)">
                  💥 Vehicle Collision / Road Accident (Structural Damage)
                </option>
                <option value="Critical Mechanical Breakdown / Engine Hazard">
                  ⚠️ Critical Mechanical Breakdown / Engine Hazard
                </option>
                <option value="Passenger Medical Emergency">🚑 Passenger Medical Emergency</option>
                <option value="Road Traffic Collision / Route Blocked">🚧 Road Traffic Collision / Route Blocked</option>
                <option value="Security Distress Alert">🛡️ Security Distress Alert</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSosConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel / Safe
              </button>
              <button
                type="button"
                onClick={handleConfirmSos}
                className="px-5 py-2.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg transition-transform active:scale-95 uppercase tracking-wider"
              >
                Confirm & Broadcast SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
