import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { AlertOctagon, PhoneCall, ShieldAlert, Check, Siren, Hospital, Users } from 'lucide-react';
import { IncidentResponseModal } from './IncidentResponseModal';
import { buildIncidentDispatchReport } from '../../utils/emergencyServices';

export const EmergencyBanner: React.FC = () => {
  const { buses, alerts, resolveAlert, showToast, activeIncidentReport, students } = useTransport();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const emergencyBuses = buses.filter((b) => b.status === 'emergency');
  const criticalAlerts = alerts.filter((a) => a.category === 'sos' && !a.resolved);

  if (emergencyBuses.length === 0 && criticalAlerts.length === 0) {
    return null;
  }

  // Fallback to construct incident report if not already generated
  const incidentData =
    activeIncidentReport ||
    buildIncidentDispatchReport(
      emergencyBuses[0] || buses[0]!,
      'Vehicle Accident & Structural Damage Distress Beacon',
      students
    );

  const handleAcknowledge = () => {
    criticalAlerts.forEach((a) => resolveAlert(a.id));
    showToast('Emergency response protocol acknowledged. First responders & parents dispatched.', 'warning');
  };

  return (
    <>
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 text-white px-4 py-2.5 shadow-lg flex items-center justify-between flex-wrap gap-3 border-b-2 border-rose-900 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white text-rose-600 rounded-xl shadow-md">
            <Siren className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-black uppercase tracking-wider text-[10px] bg-black/40 px-2 py-0.5 rounded text-rose-100 border border-white/20">
                CRITICAL ACCIDENT / DAMAGE SOS ACTIVE
              </span>
              <span className="text-xs font-black">
                {emergencyBuses.length > 0
                  ? `${emergencyBuses.map((b) => `${b.id} (${b.driverName})`).join(', ')}`
                  : 'Emergency beacon activated'}
              </span>
              <span className="text-[10px] bg-rose-950/80 text-rose-200 px-2 py-0.5 rounded border border-rose-500/50">
                4 Channels Dispatched
              </span>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              Dispatched: <strong>Police ({incidentData.policeStation.name})</strong> • <strong>Hospital ({incidentData.hospital.name})</strong> • <strong>{incidentData.parentBroadcast.totalParentsNotified} Parents</strong> • <strong>School Admin</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-800 font-extrabold text-xs rounded-xl shadow-md hover:bg-rose-50 transition-transform active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>View Multi-Agency Dispatch</span>
          </button>

          <a
            href="tel:112"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors border border-rose-500/40"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </a>

          <button
            onClick={handleAcknowledge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-rose-100 font-bold text-xs rounded-xl transition-colors border border-white/20"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Clear Incident</span>
          </button>
        </div>
      </div>

      <IncidentResponseModal
        isOpen={isModalOpen}
        incident={incidentData}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
