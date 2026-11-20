import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { LeafletMap } from '../../components/maps/LeafletMap';
import { DriverContactModal } from '../../components/ui/DriverContactModal';
import { DEMO_PARENTS } from '../../data/demoStudents';
import { calculateDistanceKm, calculateEtaMinutes } from '../../utils/geoUtils';
import { getAttendanceBadge, getBusStatusBadge, formatSpeed, formatDistance } from '../../utils/formatters';
import {
  Users,
  Bus as BusIcon,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ShieldCheck,
  Navigation,
  Compass,
  Bell,
  Sparkles,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const {
    students,
    buses,
    routes,
    drivers,
    notifications,
    selectedChildId,
    setSelectedChildId,
    showToast,
  } = useTransport();

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  // Parent's linked children (Demo Parent PAR-01)
  const parentProfile = DEMO_PARENTS[0]!;
  const myChildren = students.filter((s) => parentProfile.childrenIds.includes(s.id));

  // Active selected child
  const activeChild = myChildren.find((c) => c.id === selectedChildId) || myChildren[0] || students[0]!;

  // Bus assigned to child
  const assignedBus = buses.find((b) => b.id === activeChild.busId) || buses[0]!;
  const assignedRoute = routes.find((r) => r.id === assignedBus.routeId) || routes[0]!;
  const assignedDriver = drivers.find((d) => d.id === assignedBus.driverId) || drivers[0]!;

  // Find child's pickup stop coordinates
  const pickupStop = assignedRoute.stops.find((s) => s.id === activeChild.pickupStopId) || assignedRoute.stops[1]!;

  // Calculate real-time distance and ETA
  const distanceKm = calculateDistanceKm(
    { lat: assignedBus.location.lat, lng: assignedBus.location.lng },
    { lat: pickupStop.lat, lng: pickupStop.lng }
  );
  const etaMinutes = calculateEtaMinutes(distanceKm, assignedBus.speed);
  const isApproaching = distanceKm <= 2.5;

  const attendanceBadge = getAttendanceBadge(activeChild.attendanceStatus);
  const busBadge = getBusStatusBadge(assignedBus.status);

  // Relevant notifications for this child / parent
  const parentNotifs = notifications.filter(
    (n) => n.targetRole === 'parent' || n.targetRole === 'all' || n.busId === assignedBus.id
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Multi-Child Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Parent Guardian Portal</h1>
            <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              SAFE PASSENGER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, <strong className="text-slate-800">{parentProfile.name}</strong> • Real-time transit monitoring
          </p>
        </div>

        {/* Multi-Child Selector Buttons */}
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase px-2">Select Child:</span>
          {myChildren.map((child) => {
            const isSelected = child.id === activeChild.id;
            const badge = getAttendanceBadge(child.attendanceStatus);
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900'
                }`}
              >
                <img
                  src={child.avatar}
                  alt={child.name}
                  className="w-5 h-5 rounded-full object-cover border border-white"
                />
                <span>{child.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-white' : badge.badgeClass}`}>
                  {child.grade}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Map & Live Tracking, Right Child Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Leaflet Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Top Live Banner */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                LIVE GPS TRACKING
              </span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">
                SIMULATED GPS • 5s INTERVAL
              </span>
            </div>

            <div className="text-xs text-slate-600">
              Assigned: <strong className="font-mono text-slate-900">{assignedBus.id}</strong> ({assignedBus.name})
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative h-[480px] w-full">
            <LeafletMap
              buses={[assignedBus]}
              selectedBusId={assignedBus.id}
              center={[assignedBus.location.lat, assignedBus.location.lng]}
              zoom={14}
              routePath={assignedRoute.waypoints}
              routeColor={assignedRoute.color}
              stops={assignedRoute.stops}
              highlightStopId={activeChild.pickupStopId}
            />

            {/* Floating Live ETA Banner on Map */}
            <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xl max-w-xs">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {activeChild.attendanceStatus === 'boarded' ? 'En Route to School' : 'Pickup ETA'}
                </span>
                {isApproaching && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded animate-pulse">
                    APPROACHING
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-600 font-mono">
                  {activeChild.attendanceStatus === 'boarded' ? 'Onboard' : `${etaMinutes} mins`}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({formatDistance(distanceKm)} away)
                </span>
              </div>

              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{pickupStop.name}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Status Bar */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Bus Status:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${busBadge.badgeClass}`}>
                {assignedBus.status}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Current Speed: <strong className="font-mono text-blue-600">{formatSpeed(assignedBus.speed)}</strong></span>
            </div>

            <div className="text-slate-500 text-[11px]">
              Last Telemetry Ping: <strong className="text-slate-700 font-mono">Just now</strong>
            </div>
          </div>
        </div>

        {/* Right Col: Child Profile & Driver Quick Action Card */}
        <div className="space-y-5">
          {/* Child Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <img
                src={activeChild.avatar}
                alt={activeChild.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-slate-900 truncate">{activeChild.name}</h3>
                <p className="text-xs text-slate-500">{activeChild.grade} • Roll #{activeChild.rollNo}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${attendanceBadge.badgeClass}`}>
                    {attendanceBadge.label}
                  </span>
                  {activeChild.attendanceTimestamp && (
                    <span className="text-[10px] font-mono text-slate-400">
                      @ {activeChild.attendanceTimestamp}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Pickup Stop:</span>
                <span className="font-semibold text-slate-900 text-right max-w-[180px]">{activeChild.pickupStopName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-mono font-bold text-slate-800">{activeChild.pickupTime}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-900 text-right max-w-[180px]">{activeChild.dropoffStopName}</span>
              </div>
              {activeChild.notes && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] mt-2">
                  <strong>Special Care Note:</strong> {activeChild.notes}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Driver Card & Contact Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Assigned Bus Driver
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED OPERATOR
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={assignedDriver.avatar}
                alt={assignedDriver.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">{assignedDriver.name}</h4>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{assignedDriver.phone}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rating: ★ {assignedDriver.rating} • {assignedDriver.experienceYears} yrs exp</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsDriverModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Message</span>
              </button>
              <button
                onClick={() => setIsDriverModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Cabin</span>
              </button>
            </div>
          </div>

          {/* Recent Parent Activity Alerts */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Today's Transit Updates
            </h4>
            <div className="space-y-2">
              {parentNotifs.slice(0, 3).map((n) => (
                <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-900 text-xs">{n.title}</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Driver Contact Modal */}
      <DriverContactModal
        isOpen={isDriverModalOpen}
        driver={assignedDriver}
        busNumber={assignedBus.id}
        onClose={() => setIsDriverModalOpen(false)}
      />
    </div>
  );
};
