import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { Bus, Route, Student, Driver, Alert, AttendanceStatus } from '../types';

export const COLLECTIONS = {
  BUSES: 'buses',
  ROUTES: 'routes',
  STUDENTS: 'students',
  DRIVERS: 'drivers',
  ALERTS: 'alerts',
  SETTINGS: 'system_settings',
};

/**
 * Seed all initial demo data directly into Cloud Firestore
 */
export async function seedAllCollectionsToFirestore(
  buses: Bus[],
  routes: Route[],
  students: Student[],
  drivers: Driver[],
  alerts: Alert[]
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    let count = 0;

    // 1. Seed Buses
    for (const bus of buses) {
      await setDoc(doc(firestoreDb, COLLECTIONS.BUSES, bus.id), bus, { merge: true });
      count++;
    }

    // 2. Seed Routes
    for (const route of routes) {
      await setDoc(doc(firestoreDb, COLLECTIONS.ROUTES, route.id), route, { merge: true });
      count++;
    }

    // 3. Seed Students
    for (const student of students) {
      await setDoc(doc(firestoreDb, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
      count++;
    }

    // 4. Seed Drivers
    for (const driver of drivers) {
      await setDoc(doc(firestoreDb, COLLECTIONS.DRIVERS, driver.id), driver, { merge: true });
      count++;
    }

    // 5. Seed Alerts
    for (const alert of alerts) {
      await setDoc(doc(firestoreDb, COLLECTIONS.ALERTS, alert.id), alert, { merge: true });
      count++;
    }

    return {
      success: true,
      message: `Successfully synchronized ${count} documents across Cloud Firestore collections.`,
      count,
    };
  } catch (error: any) {
    console.error('Error seeding data to Cloud Firestore:', error);
    return {
      success: false,
      message: error?.message || 'Failed to seed Cloud Firestore. Check Firestore Security Rules.',
      count: 0,
    };
  }
}

/**
 * Update single bus telemetry in Firestore
 */
export async function updateBusTelemetryInFirestore(bus: Bus): Promise<void> {
  try {
    const busRef = doc(firestoreDb, COLLECTIONS.BUSES, bus.id);
    await setDoc(
      busRef,
      {
        location: bus.location,
        speed: bus.speed,
        status: bus.status,
        lastGpsUpdate: bus.lastGpsUpdate,
        currentOccupancy: bus.currentOccupancy,
        isGpsActive: bus.isGpsActive,
      },
      { merge: true }
    );
  } catch (err) {
    // Silent fail in case of offline / restricted rule environment
    console.debug('Firestore bus sync note:', err);
  }
}

/**
 * Update student attendance state in Firestore
 */
export async function updateStudentAttendanceInFirestore(
  studentId: string,
  status: AttendanceStatus,
  timestamp?: string
): Promise<void> {
  try {
    const studentRef = doc(firestoreDb, COLLECTIONS.STUDENTS, studentId);
    await updateDoc(studentRef, {
      attendanceStatus: status,
      attendanceTimestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err) {
    console.debug('Firestore student attendance sync note:', err);
  }
}

/**
 * Push an alert to Cloud Firestore
 */
export async function pushAlertToFirestore(alert: Alert): Promise<void> {
  try {
    await setDoc(doc(firestoreDb, COLLECTIONS.ALERTS, alert.id), alert, { merge: true });
  } catch (err) {
    console.debug('Firestore alert sync note:', err);
  }
}

/**
 * Subscribe to real-time updates from Cloud Firestore 'buses' collection
 */
export function subscribeToFirestoreBuses(
  onUpdate: (buses: Bus[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const busesCol = collection(firestoreDb, COLLECTIONS.BUSES);
    const unsubscribe = onSnapshot(
      busesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Bus[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Bus);
          });
          onUpdate(list);
        }
      },
      (error) => {
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.debug('Firestore subscription initialization note:', e);
    return () => {};
  }
}

/**
 * Check if Cloud Firestore is responding
 */
export async function checkFirestoreHealth(): Promise<boolean> {
  try {
    const testDocRef = doc(firestoreDb, COLLECTIONS.SETTINGS, 'health_check');
    await setDoc(testDocRef, { lastPing: new Date().toISOString() }, { merge: true });
    return true;
  } catch (e) {
    console.warn('Firestore connection check resulted in:', e);
    return false;
  }
}
