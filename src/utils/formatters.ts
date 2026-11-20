import { BusStatus, AttendanceStatus, TripStatus, AlertSeverity } from '../types';

export function formatSpeed(speedKmH: number): string {
  return `${Math.round(speedKmH)} km/h`;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}

export function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recent';
  }
}

export function getBusStatusBadge(status: BusStatus): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'moving':
      return {
        label: 'Moving',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500 animate-pulse',
      };
    case 'stopped':
      return {
        label: 'Idle / Stopped',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    case 'delayed':
      return {
        label: 'Delayed',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500 animate-ping',
      };
    case 'emergency':
      return {
        label: 'Emergency SOS',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse',
        dotClass: 'bg-rose-600 animate-ping',
      };
    case 'completed':
      return {
        label: 'Completed',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
  }
}

export function getAttendanceBadge(status: AttendanceStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'waiting':
      return {
        label: 'Waiting',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'boarded':
      return {
        label: 'Onboard',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'dropped_off':
      return {
        label: 'Dropped Off',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'absent':
      return {
        label: 'Absent',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
  }
}

export function getTripStatusBadge(status: TripStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'active':
      return {
        label: 'Trip Active',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'paused':
      return {
        label: 'Trip Paused',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'completed':
      return {
        label: 'Trip Completed',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      };
    case 'off_duty':
      return {
        label: 'Off Duty',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      };
  }
}

export function getSeverityStyle(severity: AlertSeverity): {
  badge: string;
  border: string;
  text: string;
} {
  switch (severity) {
    case 'critical':
      return {
        badge: 'bg-rose-500 text-white',
        border: 'border-rose-300 bg-rose-50/60',
        text: 'text-rose-700',
      };
    case 'warning':
      return {
        badge: 'bg-amber-500 text-white',
        border: 'border-amber-300 bg-amber-50/60',
        text: 'text-amber-800',
      };
    case 'success':
      return {
        badge: 'bg-emerald-500 text-white',
        border: 'border-emerald-300 bg-emerald-50/60',
        text: 'text-emerald-700',
      };
    case 'info':
    default:
      return {
        badge: 'bg-blue-500 text-white',
        border: 'border-blue-200 bg-blue-50/60',
        text: 'text-blue-700',
      };
  }
}
