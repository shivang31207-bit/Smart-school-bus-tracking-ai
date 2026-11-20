import React, { useState } from 'react';
import { Driver } from '../../types';
import { useTransport } from '../../context/TransportContext';
import { Phone, MessageSquare, Send, X, Star, CheckCircle, Shield } from 'lucide-react';

interface DriverContactModalProps {
  isOpen: boolean;
  driver?: Driver | null;
  busNumber: string;
  onClose: () => void;
}

export const DriverContactModal: React.FC<DriverContactModalProps> = ({
  isOpen,
  driver,
  busNumber,
  onClose,
}) => {
  const { showToast, sendBroadcastNotification } = useTransport();
  const [activeTab, setActiveTab] = useState<'message' | 'call'>('message');
  const [messageText, setMessageText] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  if (!isOpen || !driver) return null;

  const quickMessages = [
    'My child is already at the stop waiting.',
    'Running 2 minutes late to the stop, please hold briefly.',
    'Student has their sports gear bag today.',
    'Grandmother will be receiving the student at drop-off.',
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendBroadcastNotification(
      `Parent Message to Driver (${busNumber})`,
      messageText,
      'driver'
    );
    showToast(`Message sent directly to driver ${driver.name}`, 'success');
    setMessageText('');
    onClose();
  };

  const handleStartCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      showToast(`Connected simulated dispatch call to driver ${driver.name}`, 'info');
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-2xs"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{driver.name}</h3>
              <p className="text-xs text-slate-500">
                Driver • Bus <span className="font-semibold text-blue-600">{busNumber}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  {driver.rating}
                </span>
                <span className="text-[11px] text-slate-400">• {driver.experienceYears} yrs exp</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'message' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Send In-App Message
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'call' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Direct Phone Call
          </button>
        </div>

        {activeTab === 'message' ? (
          <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Preset Messages
              </label>
              <div className="space-y-1.5">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(msg)}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-blue-50/70 text-slate-700 hover:text-blue-700 p-2 rounded-lg border border-slate-200/80 transition-colors"
                  >
                    "{msg}"
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Message</label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message to the driver..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Message
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Phone className={`w-7 h-7 ${isCalling ? 'animate-bounce' : ''}`} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">Official Transport Helpline Number</p>
              <h4 className="font-mono font-extrabold text-lg text-slate-900 mt-0.5">{driver.phone}</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Driver safety protocol: Calls are routed to vehicle hands-free Bluetooth audio only when vehicle is safe.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleStartCall}
                disabled={isCalling}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {isCalling ? 'Dialing Driver Cabin...' : 'Simulate Connected Call'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
