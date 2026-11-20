import React from 'react';
import { useTransport } from '../../context/TransportContext';
import { Bell, CheckCheck, X, AlertTriangle, ShieldCheck, Clock, Bus as BusIcon, UserCheck } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, role } = useTransport();

  if (!isOpen) return null;

  // Filter relevant notifications based on current active role
  const filteredNotifications = notifications.filter((n) => {
    if (role === 'admin') return true;
    if (role === 'parent') return n.targetRole === 'parent' || n.targetRole === 'all';
    if (role === 'driver') return n.targetRole === 'driver' || n.targetRole === 'all';
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sos':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'boarded':
      case 'dropped_off':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'trip_started':
      case 'trip_completed':
        return <BusIcon className="w-4 h-4 text-blue-600" />;
      case 'overspeeding':
      case 'deviation':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Activity & Alerts Feed</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread notices` : 'All notifications read'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline px-2 py-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 stroke-1" />
              <p className="text-sm font-medium">No recent notifications</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`py-3 px-3 rounded-lg cursor-pointer transition-colors ${
                  item.read ? 'bg-transparent hover:bg-slate-50/80' : 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">{item.title}</span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      {item.busId && (
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-semibold">
                          {item.busId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Sync Engine: Push event dispatch active • React state synced
        </div>
      </div>
    </div>
  );
};
