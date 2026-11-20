import React, { useState } from 'react';
import { IncidentDispatchReport } from '../../utils/emergencyServices';
import { useTransport } from '../../context/TransportContext';
import {
  AlertOctagon,
  ShieldAlert,
  Siren,
  Hospital,
  Users,
  Phone,
  CheckCircle2,
  Clock,
  X,
  Send,
  MapPin,
  FileText,
  Bus as BusIcon,
} from 'lucide-react';

interface IncidentResponseModalProps {
  isOpen: boolean;
  incident: IncidentDispatchReport | null;
  onClose: () => void;
}

export const IncidentResponseModal: React.FC<IncidentResponseModalProps> = ({
  isOpen,
  incident,
  onClose,
}) => {
  const { resolveAlert, alerts, showToast, sendBroadcastNotification } = useTransport();
  const [activeTab, setActiveTab] = useState<'all' | 'police' | 'hospital' | 'parents' | 'admin'>('all');
  const [customParentUpdate, setCustomParentUpdate] = useState('');
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);

  if (!isOpen || !incident) return null;

  const handleSendParentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customParentUpdate.trim()) return;

    setIsSendingUpdate(true);
    setTimeout(() => {
      sendBroadcastNotification(
        `Incident Update from School Admin (Bus ${incident.bus.id})`,
        customParentUpdate,
        'parent'
      );
      showToast(`Follow-up update broadcasted to all ${incident.parentBroadcast.totalParentsNotified} parents`, 'success');
      setCustomParentUpdate('');
      setIsSendingUpdate(false);
    }, 600);
  };

  const handleResolveAll = () => {
    alerts.filter((a) => a.category === 'sos' && !a.resolved).forEach((a) => resolveAlert(a.id));
    showToast('Emergency incident marked resolved & archived by Dispatch Command', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[7500] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-rose-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
              <Siren className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase bg-black/30 px-2 py-0.5 rounded border border-white/20 text-rose-100">
                  INCIDENT TICKET: {incident.incidentId}
                </span>
                <span className="text-[10px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded-full">
                  LIVE MULTI-AGENCY DISPATCH
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight mt-0.5">
                Accident & Emergency Incident Command
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                Bus <strong className="font-mono text-white">{incident.bus.id}</strong> ({incident.bus.name}) • {incident.bus.registrationNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Impact Banner */}
        <div className="bg-rose-50 border-b border-rose-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-900">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Incident Coordinates:</strong> {incident.adminReport.incidentCoordinates} ({incident.bus.location.address || 'Corridor Route'})
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Broadcast Time: <strong className="font-mono text-slate-900">{incident.timestamp}</strong></span>
          </div>
        </div>

        {/* 4 Dispatch Channel Cards Grid */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. NEAREST POLICE STATION */}
            <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                      <Siren className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                      1. Nearest Police Station
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    UNITS EN ROUTE
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900">{incident.policeStation.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{incident.policeStation.address}</p>

                <div className="mt-3 pt-2.5 border-t border-blue-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance from Bus:</span>
                    <strong className="text-blue-700 font-mono">{incident.policeStation.distanceFormatted}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Police ETA:</span>
                    <strong className="text-blue-700 font-mono">~{incident.policeStation.etaMinutes} mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Responding:</span>
                    <span className="font-semibold text-slate-800">{incident.policeStation.unitAssigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Officer in Charge:</span>
                    <span className="text-slate-700">{incident.policeStation.contactPerson}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex gap-2">
                <a
                  href={`tel:${incident.policeStation.emergencyPhone}`}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call PCR (112)</span>
                </a>
                <a
                  href={`tel:${incident.policeStation.directLine}`}
                  className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
                  title="Direct Station Desk Line"
                >
                  <span>Desk Line</span>
                </a>
              </div>
            </div>

            {/* 2. NEAREST HOSPITAL TRAUMA CENTER */}
            <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs">
                      <Hospital className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                      2. Nearest Hospital Trauma Care
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                    ALS AMBULANCE DISPATCHED
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900">{incident.hospital.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{incident.hospital.address}</p>

                <div className="mt-3 pt-2.5 border-t border-emerald-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance from Bus:</span>
                    <strong className="text-emerald-700 font-mono">{incident.hospital.distanceFormatted}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ambulance ETA:</span>
                    <strong className="text-emerald-700 font-mono">~{incident.hospital.etaMinutes} mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ambulance Unit:</span>
                    <span className="font-semibold text-slate-800">{incident.hospital.unitAssigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ER Trauma Lead:</span>
                    <span className="text-slate-700">{incident.hospital.contactPerson}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex gap-2">
                <a
                  href={`tel:${incident.hospital.emergencyPhone}`}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Ambulance (108)</span>
                </a>
                <a
                  href={`tel:${incident.hospital.directLine}`}
                  className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
                  title="Direct Hospital ER Hotline"
                >
                  <span>ER Hotline</span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. ALL PARENTS BROADCAST STATUS */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    3. All Parents & Guardians Dispatched
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Delivered via High-Priority SMS Gateway & In-App Push to {incident.parentBroadcast.totalParentsNotified} linked families
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                100% DELIVERED
              </span>
            </div>

            {/* Broadcast message preview */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed mt-2 shadow-2xs">
              "{incident.parentBroadcast.smsMessage}"
            </div>

            {/* Quick Parent Follow-up Broadcast form */}
            <form onSubmit={handleSendParentUpdate} className="mt-3 flex gap-2">
              <input
                type="text"
                value={customParentUpdate}
                onChange={(e) => setCustomParentUpdate(e.target.value)}
                placeholder="Broadcast real-time status update to all parents (e.g. All students safe, replacement bus en route)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                disabled={!customParentUpdate.trim() || isSendingUpdate}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Parent Alert</span>
              </button>
            </form>
          </div>

          {/* 4. SCHOOL ADMIN COMMAND & CRISIS LOG */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-800 text-white rounded-lg shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    4. School Administration & Security Log
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Campus Principal, Transport Directorate, and First Response Coordinators logged
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                CRISIS PROTOCOL ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bus Driver</span>
                <div className="font-bold text-slate-900 mt-0.5">{incident.bus.driverName}</div>
                <div className="text-[10px] text-blue-600 font-mono">{incident.bus.driverPhone}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Route</span>
                <div className="font-bold text-slate-900 mt-0.5">{incident.bus.routeName}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Students Onboard</span>
                <div className="font-mono font-black text-slate-900 mt-0.5">{incident.bus.currentOccupancy} Verified</div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Campus Security</span>
                <div className="font-bold text-emerald-600 mt-0.5">En Route with Escort</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="text-[11px] text-slate-500">
            Emergency multi-channel beacon active • Real-time GPS sharing pinned
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
            >
              Keep Monitoring
            </button>
            <button
              onClick={handleResolveAll}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge & Clear Emergency Incident</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
