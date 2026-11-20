import React, { useState } from 'react';
import { TransportProvider, useTransport } from './context/TransportContext';
import { Navbar } from './components/layout/Navbar';
import { EmergencyBanner } from './components/dashboard/EmergencyBanner';
import { ToastContainer } from './components/ui/ToastContainer';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { ShieldCheck, Bus, HeartHandshake, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role } = useTransport();
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar onOpenAiAssistant={() => setIsAiOpen(true)} />

      {/* Emergency Alert Banner (Active when SOS is triggered) */}
      <EmergencyBanner />

      {/* Main Body per Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {role === 'admin' && <AdminDashboard />}
        {role === 'parent' && <ParentDashboard />}
        {role === 'driver' && <DriverDashboard />}
      </main>

      {/* Global AI Assistant Drawer */}
      <AiAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Floating AI Button (Bottom Right) */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-[3000] p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group border border-white/20"
        title="Open Transportation AI Assistant"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="text-xs font-bold pr-1 hidden group-hover:inline transition-all">
          AI Assistant
        </span>
      </button>

      {/* Toast Notifications Container */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">SafeRide AI Platform</span>
            <span>• Oakridge International Academy Transport Division</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Sync Active
            </span>
            <span>OSM Real-Time Mapping</span>
            <span>SaaS Architecture v2.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransportProvider>
      <AppContent />
    </TransportProvider>
  );
}
