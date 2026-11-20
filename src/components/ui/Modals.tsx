import React, { useState } from 'react';
import { Bus, Route, Student, BusStatus, AttendanceStatus } from '../../types';
import { X, AlertTriangle, ShieldCheck, Bus as BusIcon, MapPin, User, Trash2 } from 'lucide-react';

/* =========================================================================
   1. BUS MODAL (Add / Edit)
   ========================================================================= */
interface BusModalProps {
  isOpen: boolean;
  busToEdit?: Bus | null;
  routes: Route[];
  onClose: () => void;
  onSave: (busData: any) => void;
}

export const BusModal: React.FC<BusModalProps> = ({
  isOpen,
  busToEdit,
  routes,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(busToEdit?.name || '');
  const [registrationNumber, setRegistrationNumber] = useState(busToEdit?.registrationNumber || '');
  const [driverName, setDriverName] = useState(busToEdit?.driverName || '');
  const [driverPhone, setDriverPhone] = useState(busToEdit?.driverPhone || '');
  const [routeId, setRouteId] = useState(busToEdit?.routeId || routes[0]?.id || 'RT-101');
  const [capacity, setCapacity] = useState(busToEdit?.capacity || 36);
  const [status, setStatus] = useState<BusStatus>(busToEdit?.status || 'moving');
  const [speedLimit, setSpeedLimit] = useState(busToEdit?.speedLimit || 45);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoute = routes.find((r) => r.id === routeId);
    onSave({
      ...(busToEdit || {}),
      name,
      registrationNumber,
      driverName,
      driverPhone,
      routeId,
      routeName: selectedRoute?.name || 'Assigned Route',
      capacity: Number(capacity),
      status,
      speedLimit: Number(speedLimit),
      speed: status === 'stopped' ? 0 : 34,
      isGpsActive: status === 'moving',
      location: busToEdit?.location || {
        lat: 28.5921 + (Math.random() - 0.5) * 0.05,
        lng: 77.2289 + (Math.random() - 0.5) * 0.05,
        address: 'Sector Arterial Road',
      },
      currentOccupancy: busToEdit?.currentOccupancy || 0,
      fuelLevel: busToEdit?.fuelLevel || 85,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {busToEdit ? `Edit Bus ${busToEdit.id}` : 'Register New Fleet Bus'}
              </h3>
              <p className="text-xs text-slate-500">Configure vehicle specifications and route assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bus Fleet Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Express Cruiser 35"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plate / Registration #</label>
              <input
                required
                type="text"
                placeholder="e.g. DL-01-TC-9901"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Driver</label>
              <input
                required
                type="text"
                placeholder="Driver full name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone Number</label>
              <input
                required
                type="text"
                placeholder="+91 98100 00000"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Route</label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name} ({r.stops.length} stops)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
              <input
                type="number"
                min="10"
                max="60"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Speed Limit (km/h)</label>
              <input
                type="number"
                min="20"
                max="70"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BusStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="moving">Moving</option>
                <option value="stopped">Stopped</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {busToEdit ? 'Save Changes' : 'Create Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   2. ROUTE MODAL (Add / Edit)
   ========================================================================= */
interface RouteModalProps {
  isOpen: boolean;
  routeToEdit?: Route | null;
  buses: Bus[];
  onClose: () => void;
  onSave: (routeData: any) => void;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  routeToEdit,
  buses,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(routeToEdit?.name || '');
  const [code, setCode] = useState(routeToEdit?.code || 'ROUTE-0' + (buses.length % 5 + 1));
  const [color, setColor] = useState(routeToEdit?.color || '#2563EB');
  const [assignedBusId, setAssignedBusId] = useState(routeToEdit?.assignedBusId || buses[0]?.id || 'BUS-01');
  const [totalDistanceKm, setTotalDistanceKm] = useState(routeToEdit?.totalDistanceKm || 15.0);
  const [estimatedDurationMin, setEstimatedDurationMin] = useState(routeToEdit?.estimatedDurationMin || 40);
  const [morningStartTime, setMorningStartTime] = useState(routeToEdit?.morningStartTime || '07:15 AM');
  const [eveningStartTime, setEveningStartTime] = useState(routeToEdit?.eveningStartTime || '02:45 PM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(routeToEdit || {}),
      name,
      code,
      color,
      assignedBusId,
      assignedDriverId: 'DRV-' + assignedBusId.replace('BUS-', ''),
      totalDistanceKm: Number(totalDistanceKm),
      estimatedDurationMin: Number(estimatedDurationMin),
      morningStartTime,
      eveningStartTime,
      stops: routeToEdit?.stops || [
        {
          id: 'STP-NEW-1',
          name: 'Main Gateway',
          sequence: 1,
          lat: 28.615,
          lng: 77.22,
          scheduledTime: morningStartTime,
          studentCount: 8,
        },
        {
          id: 'STP-NEW-2',
          name: 'Oakridge School Main Terminal',
          sequence: 2,
          lat: 28.5921,
          lng: 77.2289,
          scheduledTime: '08:00 AM',
          studentCount: 0,
        },
      ],
      waypoints: routeToEdit?.waypoints || [
        [28.615, 77.22],
        [28.605, 77.225],
        [28.5921, 77.2289],
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {routeToEdit ? `Edit Route ${routeToEdit.code}` : 'Create New Transit Route'}
              </h3>
              <p className="text-xs text-slate-500">Define transit corridor, schedules, and bus assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Route Name</label>
              <input
                required
                type="text"
                placeholder="e.g. West Ridge Arterial Line"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Route Identifier Code</label>
              <input
                required
                type="text"
                placeholder="ROUTE-06"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Fleet Bus</label>
              <select
                value={assignedBusId}
                onChange={(e) => setAssignedBusId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Map Line Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Morning Departure</label>
              <input
                type="text"
                value={morningStartTime}
                onChange={(e) => setMorningStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Evening Return</label>
              <input
                type="text"
                value={eveningStartTime}
                onChange={(e) => setEveningStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={totalDistanceKm}
                onChange={(e) => setTotalDistanceKm(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Duration (mins)</label>
              <input
                type="number"
                value={estimatedDurationMin}
                onChange={(e) => setEstimatedDurationMin(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {routeToEdit ? 'Save Route' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   3. STUDENT MODAL (Add / Edit)
   ========================================================================= */
interface StudentModalProps {
  isOpen: boolean;
  studentToEdit?: Student | null;
  buses: Bus[];
  routes: Route[];
  onClose: () => void;
  onSave: (studentData: any) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  studentToEdit,
  buses,
  routes,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(studentToEdit?.name || '');
  const [grade, setGrade] = useState(studentToEdit?.grade || 'Grade 5-A');
  const [rollNo, setRollNo] = useState(studentToEdit?.rollNo || '15');
  const [busId, setBusId] = useState(studentToEdit?.busId || 'BUS-04');
  const [routeId, setRouteId] = useState(studentToEdit?.routeId || 'RT-101');
  const [pickupStopName, setPickupStopName] = useState(studentToEdit?.pickupStopName || 'Maple Enclave (Block C)');
  const [parentName, setParentName] = useState(studentToEdit?.parentName || 'Parent Guardian');
  const [parentPhone, setParentPhone] = useState(studentToEdit?.parentPhone || '+91 98112 34567');
  const [emergencyContact, setEmergencyContact] = useState(studentToEdit?.emergencyContact || '+91 98112 34567');
  const [notes, setNotes] = useState(studentToEdit?.notes || '');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>(studentToEdit?.attendanceStatus || 'waiting');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(studentToEdit || {}),
      name,
      grade,
      rollNo,
      avatar: studentToEdit?.avatar || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      busId,
      routeId,
      pickupStopId: 'STP-CUSTOM',
      pickupStopName,
      pickupTime: '07:30 AM',
      dropoffStopId: 'STP-CAMPUS',
      dropoffStopName: 'Oakridge School Main Terminal',
      dropoffTime: '08:00 AM',
      parentId: studentToEdit?.parentId || 'PAR-CUSTOM',
      parentName,
      parentPhone,
      emergencyContact,
      notes,
      attendanceStatus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {studentToEdit ? `Edit Student: ${studentToEdit.name}` : 'Enroll New Student'}
              </h3>
              <p className="text-xs text-slate-500">Assign student to route, bus stops, and emergency contacts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade / Class</label>
              <input
                required
                type="text"
                placeholder="5-A"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Bus</label>
              <select
                value={busId}
                onChange={(e) => {
                  setBusId(e.target.value);
                  const b = buses.find((item) => item.id === e.target.value);
                  if (b) setRouteId(b.routeId);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Route</label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} - {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Stop Location</label>
            <input
              required
              type="text"
              placeholder="e.g. Maple Enclave (Block C)"
              value={pickupStopName}
              onChange={(e) => setPickupStopName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
              <input
                required
                type="text"
                placeholder="Guardian name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone</label>
              <input
                required
                type="text"
                placeholder="+91 98112 34567"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                placeholder="+91 98112 34567"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medical / Transit Notes</label>
              <input
                type="text"
                placeholder="e.g. Asthma inhaler, peanut allergy"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              {studentToEdit ? 'Update Student' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   4. CONFIRM DELETE DIALOG
   ========================================================================= */
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
            <p className="text-[11px] text-slate-500">Destructive action confirmation</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-5">{message}</p>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
