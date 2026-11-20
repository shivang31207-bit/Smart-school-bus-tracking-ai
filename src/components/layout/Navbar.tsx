import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { UserRole } from '../../types';
import {
  Bus,
  Shield,
  Users,
  Compass,
  Bell,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Cloud,
  Database,
  Flame,
} from 'lucide-react';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

interface NavbarProps {
  onOpenAiAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAiAssistant }) => {
  const {
    role,
    setRole,
    notifications,
    isGpsSimulating,
    toggleGpsSimulation,
    resetAllData,
    isFirebaseConnected,
    isSeedingFirebase,
    seedDatabaseToFirebase,
  } = useTransport();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const unreadCount = notifications.filter((n) => {
    if (!n.read) {
      if (role === 'admin') return true;
      if (role === 'parent') return n.targetRole === 'parent' || n.targetRole === 'all';
      if (role === 'driver') return n.targetRole === 'driver' || n.targetRole === 'all';
    }
    return false;
  }).length;

  const roleConfigs: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    admin: {
      label: 'School Admin',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-blue-600 text-white',
      desc: 'Fleet Command & Central Dispatch',
    },
    parent: {
      label: 'Parent Portal',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-emerald-600 text-white',
      desc: 'Live Student Tracking & ETAs',
    },
    driver: {
      label: 'Bus Driver',
      icon: <Compass className="w-4 h-4" />,
      color: 'bg-indigo-600 text-white',
      desc: 'Mobile Route & Attendance Companion',
    },
  };

  return (
    <>
      <header className="sticky top-0 z-[1000] bg-white border-b border-slate-200/90 shadow-2xs">
        {/* Top Operational Status Bar */}
        <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Firebase Live Status */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-bold border transition-colors ${
                isFirebaseConnected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Firebase Project: smart-school-bus-tracking-ai"
            >
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>FIREBASE: {isFirebaseConnected ? 'CONNECTED' : 'STANDBY'}</span>
              <span className="hidden sm:inline text-amber-200 font-normal">• smart-school-bus-tracking-ai</span>
            </span>

            <span className="hidden md:inline text-slate-400">
              Oakridge International Academy • Unified Transport Platform
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync / Seed to Firebase Button */}
            <button
              onClick={seedDatabaseToFirebase}
              disabled={isSeedingFirebase}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/50 transition-colors disabled:opacity-50"
              title="Upload all 34 buses, routes and students to Cloud Firestore"
            >
              <Database className={`w-3 h-3 ${isSeedingFirebase ? 'animate-spin' : ''}`} />
              <span>{isSeedingFirebase ? 'Syncing...' : 'Sync Firestore'}</span>
            </button>

            {/* GPS Simulation control */}
            <button
              onClick={toggleGpsSimulation}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                isGpsSimulating
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/60 hover:bg-amber-900'
              }`}
              title="Toggle simulated GPS updates"
            >
              {isGpsSimulating ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">GPS Active (5s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">GPS Paused</span>
                </>
              )}
            </button>

            {/* Reset data */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] hover:underline"
              title="Reset all demo data to initial state"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden lg:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">SafeRide</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                  SaaS Fleet
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 font-medium">Smart School Bus Logistics</p>
            </div>
          </div>

          {/* Central Role Selector (Interactive Pills) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {(['admin', 'parent', 'driver'] as UserRole[]).map((r) => {
              const active = role === r;
              const config = roleConfigs[r];
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    active
                      ? `${config.color} shadow-xs`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Icons: AI Assistant Button, Notification Bell */}
          <div className="flex items-center gap-2.5">
            {/* AI Assistant Quick Trigger */}
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:shadow-blue-500/20"
                title="Open AI Transportation Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
              title="View Alerts & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will restore all 34 buses, routes, students, attendance states, and alert feeds back to their original benchmark baseline.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
