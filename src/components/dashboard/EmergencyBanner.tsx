import React from 'react';
import { useTransport } from '../../context/TransportContext';
import { AlertOctagon, PhoneCall, ShieldAlert, Check } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const { buses, alerts, resolveAlert, showToast } = useTransport();

  const emergencyBuses = buses.filter((b) => b.status === 'emergency');
  const criticalAlerts = alerts.filter((a) => a.category === 'sos' && !a.resolved);

  if (emergencyBuses.length === 0 && criticalAlerts.length === 0) {
    return null;
  }

  const handleAcknowledge = () => {
    criticalAlerts.forEach((a) => resolveAlert(a.id));
    showToast('Emergency response protocol initialized. First responders notified.', 'warning');
  };

  return (
    <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between flex-wrap gap-3 animate-pulse border-b-2 border-rose-800">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-white text-rose-600 rounded-lg shadow-sm">
          <AlertOctagon className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-xs bg-rose-900/80 px-2 py-0.5 rounded text-rose-100">
              CRITICAL EMERGENCY BEACON ACTIVE
            </span>
            <span className="text-xs font-semibold">
              {emergencyBuses.length > 0
                ? `${emergencyBuses.map((b) => `${b.id} (${b.driverName})`).join(', ')}`
                : 'Emergency signal received'}
            </span>
          </div>
          <p className="text-xs text-rose-100">
            Emergency SOS was triggered from the bus cabin. Dispatch control and campus security teams have been notified.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="tel:112"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-rose-700 font-bold text-xs rounded-lg shadow-sm hover:bg-rose-50 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Call Emergency Ops
        </a>
        <button
          onClick={handleAcknowledge}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-100 font-bold text-xs rounded-lg transition-colors border border-rose-500/50"
        >
          <Check className="w-3.5 h-3.5" />
          Acknowledge & Clear SOS
        </button>
      </div>
    </div>
  );
};
