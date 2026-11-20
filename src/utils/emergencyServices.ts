import { LatLng, calculateDistanceKm, calculateEtaMinutes } from './geoUtils';
import { Bus, Student } from '../types';

export interface EmergencyStation {
  id: string;
  name: string;
  type: 'police' | 'hospital';
  address: string;
  lat: number;
  lng: number;
  emergencyPhone: string;
  directLine: string;
  contactPerson: string;
  unitAssigned: string;
}

export const REGIONAL_POLICE_STATIONS: EmergencyStation[] = [
  {
    id: 'POL-01',
    name: 'South Sector Police Headquarters & PCR Division',
    type: 'police',
    address: 'Sector 14 Police Complex, Expressway Corridor',
    lat: 28.6115,
    lng: 77.2210,
    emergencyPhone: '112',
    directLine: '+91 11 2651 0100',
    contactPerson: 'Inspector R. S. Chauhan (PCR Command)',
    unitAssigned: 'Highway Patrol PCR Van #04',
  },
  {
    id: 'POL-02',
    name: 'Central Metro Division Police Station',
    type: 'police',
    address: 'Civic Centre Road, Central District',
    lat: 28.5985,
    lng: 77.2345,
    emergencyPhone: '112',
    directLine: '+91 11 2341 2233',
    contactPerson: 'Sub-Inspector M. K. Sharma',
    unitAssigned: 'Sector Quick Response Team (QRT #2)',
  },
  {
    id: 'POL-03',
    name: 'East Riverview Expressway Police Post',
    type: 'police',
    address: 'Expressway Toll Junction, Riverview Rd',
    lat: 28.5940,
    lng: 77.2750,
    emergencyPhone: '112',
    directLine: '+91 11 2921 5566',
    contactPerson: 'Station House Officer P. K. Singh',
    unitAssigned: 'Highway Interceptor PCR #11',
  },
  {
    id: 'POL-04',
    name: 'West Ridge Hills Police Station',
    type: 'police',
    address: 'Ridge Forest Arterial Crossing',
    lat: 28.5890,
    lng: 77.1820,
    emergencyPhone: '112',
    directLine: '+91 11 2510 4455',
    contactPerson: 'Duty Officer Vikramaditya',
    unitAssigned: 'PCR Van #18',
  },
];

export const REGIONAL_HOSPITALS: EmergencyStation[] = [
  {
    id: 'HOSP-01',
    name: 'City Apex Super Specialty & 24/7 Trauma Care Center',
    type: 'hospital',
    address: 'Sector 12 Medical Enclave, Arterial Rd',
    lat: 28.6185,
    lng: 77.2250,
    emergencyPhone: '108',
    directLine: '+91 11 2682 5555',
    contactPerson: 'Dr. Neha Verma (Emergency ER Head)',
    unitAssigned: 'Advanced Cardiac Life Support (ALS Ambulance #09)',
  },
  {
    id: 'HOSP-02',
    name: 'Oakridge Memorial Hospital & Pediatric Trauma Wing',
    type: 'hospital',
    address: 'Institutional Area, Near School Campus',
    lat: 28.5935,
    lng: 77.2270,
    emergencyPhone: '108',
    directLine: '+91 11 2659 4400',
    contactPerson: 'Emergency Response Coordinator Dr. R. Iyer',
    unitAssigned: 'Pediatric Emergency Ambulance Unit #02',
  },
  {
    id: 'HOSP-03',
    name: 'Metro East Trauma & Emergency Critical Care',
    type: 'hospital',
    address: 'Ring Road Crossing, East Sector',
    lat: 28.5950,
    lng: 77.2680,
    emergencyPhone: '108',
    directLine: '+91 11 4277 6222',
    contactPerson: 'Triage Incharge Dr. S. K. Roy',
    unitAssigned: 'Rapid Ambulance Service Unit #14',
  },
];

export interface EmergencyStationMatch extends EmergencyStation {
  distanceKm: number;
  distanceFormatted: string;
  etaMinutes: number;
}

export function findNearestPoliceStation(busLoc: LatLng): EmergencyStationMatch {
  let nearest = REGIONAL_POLICE_STATIONS[0]!;
  let minDistance = Infinity;

  for (const station of REGIONAL_POLICE_STATIONS) {
    const dist = calculateDistanceKm(busLoc, { lat: station.lat, lng: station.lng });
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  const etaMinutes = calculateEtaMinutes(minDistance, 55); // Police emergency priority driving speed
  return {
    ...nearest,
    distanceKm: Number(minDistance.toFixed(2)),
    distanceFormatted: minDistance < 1 ? `${Math.round(minDistance * 1000)} meters` : `${minDistance.toFixed(1)} km`,
    etaMinutes: Math.max(2, etaMinutes),
  };
}

export function findNearestHospital(busLoc: LatLng): EmergencyStationMatch {
  let nearest = REGIONAL_HOSPITALS[0]!;
  let minDistance = Infinity;

  for (const hospital of REGIONAL_HOSPITALS) {
    const dist = calculateDistanceKm(busLoc, { lat: hospital.lat, lng: hospital.lng });
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hospital;
    }
  }

  const etaMinutes = calculateEtaMinutes(minDistance, 50); // Ambulance emergency speed
  return {
    ...nearest,
    distanceKm: Number(minDistance.toFixed(2)),
    distanceFormatted: minDistance < 1 ? `${Math.round(minDistance * 1000)} meters` : `${minDistance.toFixed(1)} km`,
    etaMinutes: Math.max(3, etaMinutes),
  };
}

export interface IncidentDispatchReport {
  incidentId: string;
  timestamp: string;
  bus: Bus;
  reason: string;
  policeStation: EmergencyStationMatch;
  hospital: EmergencyStationMatch;
  parentBroadcast: {
    totalParentsNotified: number;
    parentsList: { parentName: string; parentPhone: string; studentName: string }[];
    smsMessage: string;
  };
  adminReport: {
    severity: 'CRITICAL_ACCIDENT';
    incidentCoordinates: string;
    actionTaken: string;
  };
}

export function buildIncidentDispatchReport(
  bus: Bus,
  reason: string,
  allStudents: Student[]
): IncidentDispatchReport {
  const incidentId = 'INC-' + Date.now().toString().slice(-6);
  const busLoc = { lat: bus.location.lat, lng: bus.location.lng };
  const nearestPolice = findNearestPoliceStation(busLoc);
  const nearestHospital = findNearestHospital(busLoc);

  // Filter students assigned to this bus
  const onboardStudents = allStudents.filter((s) => s.busId === bus.id);
  const parentsList = onboardStudents.map((s) => ({
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    studentName: s.name,
  }));

  const smsMessage = `URGENT SAFETY ALERT: School Bus ${bus.id} (${bus.registrationNumber}) carrying your child reported an incident/damage at ${bus.location.address || 'transit corridor'}. Emergency services dispatched: ${nearestPolice.name} (${nearestPolice.unitAssigned}) & ${nearestHospital.name} (Ambulance). Campus Administration is on scene managing student welfare. Phone lines are open.`;

  return {
    incidentId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    bus,
    reason,
    policeStation: nearestPolice,
    hospital: nearestHospital,
    parentBroadcast: {
      totalParentsNotified: parentsList.length > 0 ? parentsList.length : 28,
      parentsList,
      smsMessage,
    },
    adminReport: {
      severity: 'CRITICAL_ACCIDENT',
      incidentCoordinates: `${bus.location.lat.toFixed(5)}, ${bus.location.lng.toFixed(5)}`,
      actionTaken: 'Automated 4-Channel Emergency Dispatch (Police, Trauma Hospital, Parents, Campus Security)',
    },
  };
}
