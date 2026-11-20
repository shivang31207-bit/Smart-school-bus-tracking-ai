import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { calculateDistanceKm } from '../../utils/geoUtils';
import { SCHOOL_CAMPUS_LOCATION } from '../../data/demoRoutes';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Clock,
  ShieldAlert,
  Bus as BusIcon,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBus?: (busId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'bus_list' | 'stats' | 'alerts';
    items?: Array<{ id: string; label: string; sub: string; badge?: string }>;
  };
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose, onSelectBus }) => {
  const { buses, routes, students, alerts, speedViolations } = useTransport();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'ai',
      text: "Hello! I am your AI Transportation Assistant. I analyze real-time telemetry across all 34 school buses, student check-ins, and route schedules. How can I assist dispatch today?",
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const quickQuestions = [
    'Which buses are delayed?',
    'How many students are currently onboard?',
    'Are there any safety alerts?',
    'Which bus is nearest to the school?',
    "What is today's fleet performance?",
    'Which routes have the most delays?',
  ];

  const processQuery = (question: string) => {
    const q = question.toLowerCase();
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyText = '';
    let actionCard: ChatMessage['actionCard'] = undefined;

    if (q.includes('delayed') || q.includes('late')) {
      const delayedBuses = buses.filter((b) => b.status === 'delayed');
      if (delayedBuses.length > 0) {
        replyText = `Found ${delayedBuses.length} bus(es) currently experiencing delays:`;
        actionCard = {
          type: 'bus_list',
          items: delayedBuses.map((b) => ({
            id: b.id,
            label: `${b.id} • ${b.name}`,
            sub: `${b.routeName} — ${b.location.address}`,
            badge: `${Math.round(b.speed)} km/h (Slow)`,
          })),
        };
      } else {
        replyText = 'All active buses are currently running on schedule. Zero delays reported across the network.';
      }
    } else if (q.includes('onboard') || q.includes('student') || q.includes('attendance')) {
      const onboardCount = students.filter((s) => s.attendanceStatus === 'boarded').length;
      const waitingCount = students.filter((s) => s.attendanceStatus === 'waiting').length;
      const absentCount = students.filter((s) => s.attendanceStatus === 'absent').length;
      const totalOccupancy = buses.reduce((acc, b) => acc + b.currentOccupancy, 0);

      replyText = `Currently, there are approximately ${totalOccupancy} students in transit across the fleet (with ${onboardCount} detailed passenger manifest check-ins verified).`;
      actionCard = {
        type: 'stats',
        items: [
          { id: '1', label: 'Students Onboard', sub: 'Verified boarding scans', badge: `${totalOccupancy}` },
          { id: '2', label: 'Awaiting Pickup', sub: 'At downstream stops', badge: `${waitingCount}` },
          { id: '3', label: 'Reported Absent', sub: 'Prior leave submitted', badge: `${absentCount}` },
        ],
      };
    } else if (q.includes('alert') || q.includes('safety') || q.includes('sos') || q.includes('speed')) {
      const openAlerts = alerts.filter((a) => !a.resolved);
      const sosCount = buses.filter((b) => b.status === 'emergency').length;
      replyText = `Safety status overview: ${openAlerts.length} unresolved alerts, ${speedViolations.length} speed telemetry warnings, and ${sosCount} emergency SOS signals.`;
      actionCard = {
        type: 'alerts',
        items: openAlerts.map((a) => ({
          id: a.id,
          label: a.title,
          sub: a.message,
          badge: a.severity.toUpperCase(),
        })),
      };
    } else if (q.includes('nearest') || q.includes('closest')) {
      // Find bus with lowest distance to school campus
      let closestBus = buses[0]!;
      let minDistance = Infinity;

      buses.forEach((b) => {
        const d = calculateDistanceKm(b.location, {
          lat: SCHOOL_CAMPUS_LOCATION.lat,
          lng: SCHOOL_CAMPUS_LOCATION.lng,
        });
        if (d < minDistance) {
          minDistance = d;
          closestBus = b;
        }
      });

      replyText = `The nearest vehicle is ${closestBus.id} (${closestBus.name}), located approx ${minDistance.toFixed(
        2
      )} km away on ${closestBus.routeName}. Current speed: ${Math.round(closestBus.speed)} km/h.`;
      actionCard = {
        type: 'bus_list',
        items: [
          {
            id: closestBus.id,
            label: `${closestBus.id} — Nearest to Campus`,
            sub: `${closestBus.location.address} (~${minDistance.toFixed(2)} km)`,
            badge: `${Math.round(closestBus.speed)} km/h`,
          },
        ],
      };
    } else if (q.includes('performance') || q.includes('on-time') || q.includes('utilization')) {
      const activeTrips = buses.filter((b) => b.status === 'moving' || b.status === 'delayed').length;
      const onTimeRate = '99.4%';
      replyText = `Today's fleet performance summary: 34 Total Buses, ${activeTrips} Active Trips, 99.4% On-Time Performance Rate, and fleet capacity utilization at 78.2%.`;
      actionCard = {
        type: 'stats',
        items: [
          { id: '1', label: 'On-Time Performance', sub: 'Benchmark SLA: >98%', badge: onTimeRate },
          { id: '2', label: 'Fleet Active', sub: 'Out of 34 total registered', badge: `${activeTrips} Buses` },
          { id: '3', label: 'Safety Compliance', sub: 'Zero critical incidents', badge: '100%' },
        ],
      };
    } else {
      replyText = `I analyzed your inquiry about "${question}". Currently, 34 buses are provisioned in the system with 28 active routes. You can ask for delayed buses, nearest bus to school, onboard student counts, or safety violation summaries.`;
    }

    const aiMsg: ChatMessage = {
      id: 'ai_' + Date.now(),
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCard,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery('');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    processQuery(inputQuery);
  };

  return (
    <div className="fixed inset-0 z-[5500] flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">Transportation AI Assistant</h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono">
                  DEMO RULE ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Live Telemetry & Fleet Dispatch Query Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Dispatch Queries
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => processQuery(q)}
                className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 shadow-2xs rounded-bl-xs'
                }`}
              >
                <div className="font-normal">{m.text}</div>

                {/* Structured Result Cards */}
                {m.actionCard && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    {m.actionCard.items?.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.id.startsWith('BUS-') && onSelectBus) {
                            onSelectBus(item.id);
                            onClose();
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-colors cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate">{item.label}</div>
                          <div className="text-[10px] text-slate-500 truncate">{item.sub}</div>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 ${
                    m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about delayed buses, speeds, student attendance..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="px-4 py-1.5 bg-slate-100 text-[10px] text-slate-500 border-t border-slate-200 text-center">
          Note: Rule-assisted demonstration engine answering from shared in-memory fleet state.
        </div>
      </div>
    </div>
  );
};
