export type UserRole = 'admin' | 'parent' | 'driver';

export type BusStatus = 'moving' | 'stopped' | 'delayed' | 'completed' | 'emergency';

export type TripStatus = 'off_duty' | 'active' | 'paused' | 'completed';

export type AttendanceStatus = 'waiting' | 'boarded' | 'dropped_off' | 'absent';

export type AlertCategory = 
  | 'approaching' 
  | 'delayed' 
  | 'overspeeding' 
  | 'deviation' 
  | 'boarded' 
  | 'dropped_off' 
  | 'sos' 
  | 'trip_started' 
  | 'trip_completed';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
  bearing?: number;
}

export interface RouteStop {
  id: string;
  name: string;
  sequence: number;
  lat: number;
  lng: number;
  scheduledTime: string;
  studentCount: number;
  completed?: boolean;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  color: string;
  assignedBusId: string;
  assignedDriverId: string;
  stops: RouteStop[];
  waypoints: [number, number][];
  totalDistanceKm: number;
  estimatedDurationMin: number;
  morningStartTime: string;
  eveningStartTime: string;
}

export interface Bus {
  id: string;
  name: string;
  registrationNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  routeId: string;
  routeName: string;
  capacity: number;
  currentOccupancy: number;
  status: BusStatus;
  speed: number;
  speedLimit: number;
  lastGpsUpdate: string;
  location: LocationCoordinates;
  isGpsActive: boolean;
  fuelLevel: number;
  currentTripId?: string;
  currentWaypointIndex?: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  avatar: string;
  busId: string;
  routeId: string;
  pickupStopId: string;
  pickupStopName: string;
  pickupTime: string;
  dropoffStopId: string;
  dropoffStopName: string;
  dropoffTime: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  attendanceStatus: AttendanceStatus;
  attendanceTimestamp?: string;
  emergencyContact: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  rating: number;
  assignedBusId: string;
  assignedRouteId: string;
  status: 'on_duty' | 'driving' | 'break' | 'off_duty';
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  childrenIds: string[];
}

export interface Trip {
  id: string;
  busId: string;
  routeId: string;
  driverId: string;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  currentStopIndex: number;
  nextStopName: string;
  completedStops: string[];
  studentsOnboard: number;
  totalStudentsAssigned: number;
  distanceCoveredKm: number;
  durationSeconds: number;
  gpsHistory: { lat: number; lng: number; timestamp: string; speed: number }[];
}

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  busId?: string;
  busNumber?: string;
  routeId?: string;
  studentId?: string;
  studentName?: string;
  resolved: boolean;
  resolvedAt?: string;
  details?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
  targetRole: UserRole | 'all';
  targetId?: string;
  busId?: string;
}

export interface SpeedViolation {
  id: string;
  busId: string;
  registrationNumber: string;
  driverName: string;
  speed: number;
  speedLimit: number;
  location: string;
  timestamp: string;
  severity: 'minor' | 'critical';
}

export interface RouteDeviation {
  id: string;
  busId: string;
  routeName: string;
  currentLocation: string;
  deviationDistanceMeters: number;
  timestamp: string;
  status: 'active' | 'cleared';
}
