import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  Bus,
  Route,
  Student,
  Driver,
  Alert,
  NotificationItem,
  SpeedViolation,
  RouteDeviation,
  AttendanceStatus,
  TripStatus,
} from '../types';
import { loadInitialData, saveToStorage, resetStorageToDefaults } from '../services/mockStorage';
import { stepGpsSimulation } from '../services/gpsService';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface DriverTripState {
  status: TripStatus;
  startTime?: string;
  durationSeconds: number;
  distanceCoveredKm: number;
  currentStopIndex: number;
}

interface TransportContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  buses: Bus[];
  routes: Route[];
  students: Student[];
  drivers: Driver[];
  alerts: Alert[];
  notifications: NotificationItem[];
  speedViolations: SpeedViolation[];
  routeDeviations: RouteDeviation[];
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
  activeDriverBusId: string;
  setActiveDriverBusId: (id: string) => void;
  driverTripState: DriverTripState;
  isGpsSimulating: boolean;
  setIsGpsSimulating: (sim: boolean) => void;
  toggleGpsSimulation: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;

  // Actions
  addBus: (bus: Omit<Bus, 'id'>) => void;
  updateBus: (bus: Bus) => void;
  deleteBus: (busId: string) => void;

  addRoute: (route: Omit<Route, 'id'>) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (routeId: string) => void;

  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;

  startDriverTrip: (busId: string) => void;
  pauseDriverTrip: (busId: string) => void;
  resumeDriverTrip: (busId: string) => void;
  endDriverTrip: (busId: string) => void;

  markStudentAttendance: (studentId: string, status: AttendanceStatus) => void;
  triggerEmergencySos: (busId: string, reason?: string) => void;
  resolveAlert: (alertId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendBroadcastNotification: (title: string, message: string, targetRole?: UserRole | 'all') => void;
  resetAllData: () => void;
}

const TransportContext = createContext<TransportContextType | undefined>(undefined);

export const TransportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadInitialData();

  const [role, setRoleState] = useState<UserRole>('admin');
  const [buses, setBuses] = useState<Bus[]>(initial.buses);
  const [routes, setRoutes] = useState<Route[]>(initial.routes);
  const [students, setStudents] = useState<Student[]>(initial.students);
  const [drivers, setDrivers] = useState<Driver[]>(initial.drivers);
  const [alerts, setAlerts] = useState<Alert[]>(initial.alerts);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initial.notifications);
  const [speedViolations, setSpeedViolations] = useState<SpeedViolation[]>(initial.speedViolations);
  const [routeDeviations, setRouteDeviations] = useState<RouteDeviation[]>(initial.deviations);

  const [selectedChildId, setSelectedChildId] = useState<string>('STU-01');
  const [activeDriverBusId, setActiveDriverBusId] = useState<string>('BUS-04');
  const [isGpsSimulating, setIsGpsSimulating] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Driver Trip State
  const [driverTripState, setDriverTripState] = useState<DriverTripState>({
    status: 'active',
    startTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    durationSeconds: 2100,
    distanceCoveredKm: 7.4,
    currentStopIndex: 1,
  });

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    showToast(`Switched view to ${newRole.toUpperCase()} Dashboard`, 'info');
  };

  // Sync to storage on modifications
  useEffect(() => {
    saveToStorage('BUSES', buses);
  }, [buses]);

  useEffect(() => {
    saveToStorage('ROUTES', routes);
  }, [routes]);

  useEffect(() => {
    saveToStorage('STUDENTS', students);
  }, [students]);

  useEffect(() => {
    saveToStorage('ALERTS', alerts);
  }, [alerts]);

  useEffect(() => {
    saveToStorage('NOTIFICATIONS', notifications);
  }, [notifications]);

  // Active Trip Timer Increment
  useEffect(() => {
    if (driverTripState.status !== 'active') return;
    const interval = setInterval(() => {
      setDriverTripState((prev) => ({
        ...prev,
        durationSeconds: prev.durationSeconds + 1,
        distanceCoveredKm: Number((prev.distanceCoveredKm + 0.009).toFixed(2)),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [driverTripState.status]);

  // 5-Second GPS Telemetry Simulation Loop
  useEffect(() => {
    if (!isGpsSimulating) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) => {
        const { updatedBuses, events } = stepGpsSimulation(prevBuses, routes);

        // Process generated telemetry events
        if (events.length > 0) {
          events.forEach((ev) => {
            if (ev.type === 'approaching_stop' && ev.busId === 'BUS-04') {
              // Add approaching notification for parent
              const notifId = 'notif_' + Date.now();
              setNotifications((prev) => {
                // Avoid flooding duplicates
                if (prev.some((n) => n.category === 'approaching' && Date.now() - new Date(n.timestamp).getTime() < 30000)) {
                  return prev;
                }
                return [
                  {
                    id: notifId,
                    title: `Bus 04 Approaching ${ev.details.stopName}`,
                    message: `Bus is ${ev.details.distanceMeters}m away (~${ev.details.etaMinutes} min). Please ensure students are present.`,
                    category: 'approaching',
                    severity: 'info',
                    timestamp: new Date().toISOString(),
                    read: false,
                    targetRole: 'parent',
                    targetId: 'PAR-01',
                    busId: 'BUS-04',
                  },
                  ...prev,
                ];
              });
            }
          });
        }

        return updatedBuses;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isGpsSimulating, routes]);

  // Bus Management CRUD
  const addBus = (busData: Omit<Bus, 'id'>) => {
    const newId = `BUS-${buses.length + 1 < 10 ? '0' : ''}${buses.length + 1}`;
    const newBus: Bus = {
      ...busData,
      id: newId,
      lastGpsUpdate: new Date().toISOString(),
    };
    setBuses((prev) => [newBus, ...prev]);
    showToast(`Bus ${newId} registered to fleet successfully`, 'success');
  };

  const updateBus = (bus: Bus) => {
    setBuses((prev) => prev.map((b) => (b.id === bus.id ? bus : b)));
    showToast(`Bus ${bus.id} details updated`, 'success');
  };

  const deleteBus = (busId: string) => {
    setBuses((prev) => prev.filter((b) => b.id !== busId));
    showToast(`Bus ${busId} decommissioned from fleet`, 'warning');
  };

  // Route Management CRUD
  const addRoute = (routeData: Omit<Route, 'id'>) => {
    const newId = `RT-${200 + routes.length}`;
    const newRoute: Route = {
      ...routeData,
      id: newId,
    };
    setRoutes((prev) => [...prev, newRoute]);
    showToast(`Route ${routeData.name} created`, 'success');
  };

  const updateRoute = (route: Route) => {
    setRoutes((prev) => prev.map((r) => (r.id === route.id ? route : r)));
    showToast(`Route ${route.code} updated`, 'success');
  };

  const deleteRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    showToast(`Route deleted`, 'warning');
  };

  // Student Management CRUD
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newId = `STU-${students.length + 100}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
    };
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`Student ${studentData.name} enrolled and assigned`, 'success');
  };

  const updateStudent = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    showToast(`Student ${student.name} updated`, 'success');
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    showToast(`Student record removed`, 'warning');
  };

  // Trip Lifecycle
  const startDriverTrip = (busId: string) => {
    setDriverTripState({
      status: 'active',
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      distanceCoveredKm: 0,
      currentStopIndex: 0,
    });

    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              status: 'moving',
              isGpsActive: true,
              speed: 34,
              lastGpsUpdate: new Date().toISOString(),
            }
          : b
      )
    );

    // Broadcast trip started notification
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: `Bus ${busId} Trip Commenced`,
      message: `Morning pickup service is now LIVE. Real-time GPS sharing active.`,
      category: 'trip_started',
      severity: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'all',
      busId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Trip Started: Bus ${busId} is now LIVE on route`, 'success');
  };

  const pauseDriverTrip = (busId: string) => {
    setDriverTripState((prev) => ({ ...prev, status: 'paused' }));
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'stopped', speed: 0 } : b))
    );
    showToast(`Trip paused for Bus ${busId}`, 'warning');
  };

  const resumeDriverTrip = (busId: string) => {
    setDriverTripState((prev) => ({ ...prev, status: 'active' }));
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'moving', speed: 32 } : b))
    );
    showToast(`Trip resumed for Bus ${busId}`, 'success');
  };

  const endDriverTrip = (busId: string) => {
    setDriverTripState((prev) => ({ ...prev, status: 'completed' }));
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? {
              ...b,
              status: 'completed',
              isGpsActive: false,
              speed: 0,
              lastGpsUpdate: new Date().toISOString(),
            }
          : b
      )
    );

    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: `Bus ${busId} Trip Completed`,
      message: `Trip concluded at school terminal. All onboard students marked dropped off.`,
      category: 'trip_completed',
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'all',
      busId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Trip completed for Bus ${busId}. Location sharing stopped.`, 'success');
  };

  // Student Attendance Marking (Cross-Dashboard Sync)
  const markStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              attendanceStatus: status,
              attendanceTimestamp: timeStr,
            }
          : s
      )
    );

    // Update bus occupancy count
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === student.busId) {
          const delta = status === 'boarded' ? 1 : status === 'dropped_off' ? -1 : 0;
          return {
            ...b,
            currentOccupancy: Math.max(0, Math.min(b.capacity, b.currentOccupancy + delta)),
          };
        }
        return b;
      })
    );

    // Broadcast parent notification
    let notifTitle = '';
    let notifMsg = '';
    let category: NotificationItem['category'] = 'boarded';
    let severity: NotificationItem['severity'] = 'info';

    if (status === 'boarded') {
      notifTitle = `Student Boarded: ${student.name}`;
      notifMsg = `${student.name} has safely boarded ${student.busId} at ${student.pickupStopName} (${timeStr}).`;
      category = 'boarded';
      severity = 'success';
    } else if (status === 'dropped_off') {
      notifTitle = `Student Reached: ${student.name}`;
      notifMsg = `${student.name} has been safely dropped off at ${student.dropoffStopName} (${timeStr}).`;
      category = 'dropped_off';
      severity = 'success';
    } else if (status === 'absent') {
      notifTitle = `Student Marked Absent: ${student.name}`;
      notifMsg = `${student.name} was marked absent for today's morning bus transit.`;
      category = 'delayed';
      severity = 'warning';
    }

    if (notifTitle) {
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: notifTitle,
        message: notifMsg,
        category,
        severity,
        timestamp: new Date().toISOString(),
        read: false,
        targetRole: 'parent',
        targetId: student.parentId,
        busId: student.busId,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    showToast(`Attendance updated for ${student.name}: ${status.toUpperCase()}`, 'success');
  };

  // Emergency SOS Trigger
  const triggerEmergencySos = (busId: string, reason = 'Driver signaled critical distress / mechanical emergency') => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'emergency', speed: 0 } : b))
    );

    const alertId = 'ALT-SOS-' + Date.now();
    const newAlert: Alert = {
      id: alertId,
      category: 'sos',
      severity: 'critical',
      title: `CRITICAL SOS: Emergency Beacon from Bus ${busId}`,
      message: `${reason}. Immediate dispatcher verification and response required.`,
      timestamp: new Date().toISOString(),
      busId,
      busNumber: busId,
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    const sosNotif: NotificationItem = {
      id: 'notif_sos_' + Date.now(),
      title: `EMERGENCY ALERT: Bus ${busId}`,
      message: `Emergency SOS triggered for Bus ${busId}. Campus dispatch center alerted.`,
      category: 'sos',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole: 'all',
      busId,
    };
    setNotifications((prev) => [sosNotif, ...prev]);

    showToast(`EMERGENCY SOS BROADCAST FOR BUS ${busId}`, 'error');
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a))
    );
    showToast('Alert marked as resolved', 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked read', 'info');
  };

  const sendBroadcastNotification = (title: string, message: string, targetRole: UserRole | 'all' = 'all') => {
    const item: NotificationItem = {
      id: 'notif_' + Date.now(),
      title,
      message,
      category: 'delayed',
      severity: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      targetRole,
    };
    setNotifications((prev) => [item, ...prev]);
    showToast('Broadcast sent successfully', 'success');
  };

  const toggleGpsSimulation = () => {
    setIsGpsSimulating((prev) => !prev);
    showToast(isGpsSimulating ? 'GPS Simulation Paused' : 'GPS Simulation Active (5s Updates)', 'info');
  };

  const resetAllData = () => {
    resetStorageToDefaults();
    const fresh = loadInitialData();
    setBuses(fresh.buses);
    setRoutes(fresh.routes);
    setStudents(fresh.students);
    setDrivers(fresh.drivers);
    setAlerts(fresh.alerts);
    setNotifications(fresh.notifications);
    setSpeedViolations(fresh.speedViolations);
    setRouteDeviations(fresh.deviations);
    showToast('Demo data reset to initial benchmark state', 'info');
  };

  return (
    <TransportContext.Provider
      value={{
        role,
        setRole,
        buses,
        routes,
        students,
        drivers,
        alerts,
        notifications,
        speedViolations,
        routeDeviations,
        selectedChildId,
        setSelectedChildId,
        activeDriverBusId,
        setActiveDriverBusId,
        driverTripState,
        isGpsSimulating,
        setIsGpsSimulating,
        toggleGpsSimulation,
        toasts,
        showToast,
        dismissToast,
        addBus,
        updateBus,
        deleteBus,
        addRoute,
        updateRoute,
        deleteRoute,
        addStudent,
        updateStudent,
        deleteStudent,
        startDriverTrip,
        pauseDriverTrip,
        resumeDriverTrip,
        endDriverTrip,
        markStudentAttendance,
        triggerEmergencySos,
        resolveAlert,
        markNotificationRead,
        markAllNotificationsRead,
        sendBroadcastNotification,
        resetAllData,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};
