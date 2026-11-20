import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// 1. On-Time Performance (Past 7 Days)
const ON_TIME_DATA = [
  { day: 'Mon', onTime: 99.1, delayed: 0.9 },
  { day: 'Tue', onTime: 98.8, delayed: 1.2 },
  { day: 'Wed', onTime: 99.5, delayed: 0.5 },
  { day: 'Thu', onTime: 99.2, delayed: 0.8 },
  { day: 'Fri', onTime: 99.6, delayed: 0.4 },
  { day: 'Sat', onTime: 99.8, delayed: 0.2 },
  { day: 'Today', onTime: 99.4, delayed: 0.6 },
];

// 2. Bus Capacity Utilization across Primary Routes
const UTILIZATION_DATA = [
  { route: 'North Line', capacity: 180, passengers: 154, rate: 85.5 },
  { route: 'South Express', capacity: 200, passengers: 178, rate: 89.0 },
  { route: 'East Corridor', capacity: 150, passengers: 118, rate: 78.6 },
  { route: 'West Ridge', capacity: 140, passengers: 104, rate: 74.2 },
  { route: 'Central Feeder', capacity: 120, passengers: 96, rate: 80.0 },
];

// 3. Today's Student Attendance Breakdown
const ATTENDANCE_PIE_DATA = [
  { name: 'Onboard (Verified)', value: 890, color: '#10B981' },
  { name: 'Waiting at Stop', value: 240, color: '#F59E0B' },
  { name: 'Safely Dropped', value: 92, color: '#2563EB' },
  { name: 'Reported Absent', value: 18, color: '#EF4444' },
];

// 4. Hourly Speed Violation Telemetry Trend
const SPEED_TELEMETRY_DATA = [
  { time: '06:30 AM', avgSpeed: 28, maxSpeed: 42, violations: 0 },
  { time: '07:00 AM', avgSpeed: 34, maxSpeed: 44, violations: 0 },
  { time: '07:30 AM', avgSpeed: 37, maxSpeed: 52, violations: 1 },
  { time: '08:00 AM', avgSpeed: 31, maxSpeed: 45, violations: 0 },
  { time: '08:30 AM', avgSpeed: 24, maxSpeed: 38, violations: 0 },
  { time: '02:00 PM', avgSpeed: 32, maxSpeed: 43, violations: 0 },
  { time: '02:30 PM', avgSpeed: 36, maxSpeed: 56, violations: 1 },
];

export const OnTimeChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">On-Time Performance Rate</h4>
          <p className="text-xs text-slate-500">Benchmark SLA target: 98.5% • Current: 99.4%</p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          +0.3% vs Prev Week
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ON_TIME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="onTimeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis domain={[96, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
            <Tooltip
              formatter={(value: any) => [`${value}%`, 'On-Time Rate']}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }}
            />
            <Area type="monotone" dataKey="onTime" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#onTimeGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const UtilizationChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Route Capacity Utilization</h4>
          <p className="text-xs text-slate-500">Passenger loads vs maximum seated capacity</p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          Avg 81.4%
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={UTILIZATION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip
              formatter={(value: any, name: any) => [value, name === 'passengers' ? 'Students Onboard' : 'Total Capacity']}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }}
            />
            <Bar dataKey="capacity" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Total Seats" />
            <Bar dataKey="passengers" fill="#2563EB" radius={[4, 4, 0, 0]} name="Active Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AttendanceChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Daily Attendance Distribution</h4>
          <p className="text-xs text-slate-500">Total 1,240 enrolled bus passengers</p>
        </div>
      </div>
      <div className="h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ATTENDANCE_PIE_DATA}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {ATTENDANCE_PIE_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${value} students`, 'Count']}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SpeedTrendsChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Fleet Velocity & Telemetry Profile</h4>
          <p className="text-xs text-slate-500">Average velocity vs speed safety threshold (45 km/h)</p>
        </div>
        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
          Limit: 45 km/h
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SPEED_TELEMETRY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" km/h" />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }} />
            <Line type="monotone" dataKey="avgSpeed" stroke="#2563EB" strokeWidth={2.5} name="Average Speed" />
            <Line type="monotone" dataKey="maxSpeed" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" name="Peak Speed" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
