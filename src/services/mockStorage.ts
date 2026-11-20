import { Bus, Route, Student, Driver, Alert, NotificationItem, SpeedViolation, RouteDeviation } from '../types';
import { INITIAL_BUSES } from '../data/demoBuses';
import { INITIAL_ROUTES } from '../data/demoRoutes';
import { INITIAL_DRIVERS } from '../data/demoDrivers';
import { INITIAL_STUDENTS } from '../data/demoStudents';
import { INITIAL_ALERTS, INITIAL_NOTIFICATIONS, INITIAL_SPEED_VIOLATIONS, INITIAL_ROUTE_DEVIATIONS } from '../data/demoAlerts';

const STORAGE_KEYS = {
  BUSES: 'safeschool_buses_v1',
  ROUTES: 'safeschool_routes_v1',
  DRIVERS: 'safeschool_drivers_v1',
  STUDENTS: 'safeschool_students_v1',
  ALERTS: 'safeschool_alerts_v1',
  NOTIFICATIONS: 'safeschool_notifications_v1',
  SPEED_VIOLATIONS: 'safeschool_speed_violations_v1',
  DEVIATIONS: 'safeschool_deviations_v1',
};

export function loadInitialData() {
  try {
    const buses = localStorage.getItem(STORAGE_KEYS.BUSES);
    const routes = localStorage.getItem(STORAGE_KEYS.ROUTES);
    const drivers = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    const students = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const alerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
    const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const speedViolations = localStorage.getItem(STORAGE_KEYS.SPEED_VIOLATIONS);
    const deviations = localStorage.getItem(STORAGE_KEYS.DEVIATIONS);

    return {
      buses: buses ? (JSON.parse(buses) as Bus[]) : INITIAL_BUSES,
      routes: routes ? (JSON.parse(routes) as Route[]) : INITIAL_ROUTES,
      drivers: drivers ? (JSON.parse(drivers) as Driver[]) : INITIAL_DRIVERS,
      students: students ? (JSON.parse(students) as Student[]) : INITIAL_STUDENTS,
      alerts: alerts ? (JSON.parse(alerts) as Alert[]) : INITIAL_ALERTS,
      notifications: notifications ? (JSON.parse(notifications) as NotificationItem[]) : INITIAL_NOTIFICATIONS,
      speedViolations: speedViolations ? (JSON.parse(speedViolations) as SpeedViolation[]) : INITIAL_SPEED_VIOLATIONS,
      deviations: deviations ? (JSON.parse(deviations) as RouteDeviation[]) : INITIAL_ROUTE_DEVIATIONS,
    };
  } catch (e) {
    console.warn('Failed to parse localStorage data, falling back to initial presets:', e);
    return {
      buses: INITIAL_BUSES,
      routes: INITIAL_ROUTES,
      drivers: INITIAL_DRIVERS,
      students: INITIAL_STUDENTS,
      alerts: INITIAL_ALERTS,
      notifications: INITIAL_NOTIFICATIONS,
      speedViolations: INITIAL_SPEED_VIOLATIONS,
      deviations: INITIAL_ROUTE_DEVIATIONS,
    };
  }
}

export function saveToStorage<T>(key: keyof typeof STORAGE_KEYS, data: T) {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export function resetStorageToDefaults() {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Storage clear error:', e);
  }
}
