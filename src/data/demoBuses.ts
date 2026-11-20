import { Bus } from '../types';

export const INITIAL_BUSES: Bus[] = [
  // Primary Featured Live Bus (Route 1)
  {
    id: 'BUS-04',
    name: 'Yellow Cruiser 04',
    registrationNumber: 'DL-01-TC-8820',
    driverId: 'DRV-04',
    driverName: 'Rajesh Kumar Sharma',
    driverPhone: '+91 98102 44321',
    routeId: 'RT-101',
    routeName: 'North Valley & Maple Line',
    capacity: 36,
    currentOccupancy: 28,
    status: 'moving',
    speed: 38,
    speedLimit: 45,
    lastGpsUpdate: new Date().toISOString(),
    location: {
      lat: 28.6215,
      lng: 77.2185,
      address: 'Approaching Maple Enclave, Sector 12',
      bearing: 154,
    },
    isGpsActive: true,
    fuelLevel: 82,
    currentTripId: 'TRIP-2026-04',
    currentWaypointIndex: 2,
  },
  {
    id: 'BUS-07',
    name: 'Metro Carrier 07',
    registrationNumber: 'DL-02-TC-9412',
    driverId: 'DRV-07',
    driverName: 'Vikram Singh Mehta',
    driverPhone: '+91 98711 55678',
    routeId: 'RT-102',
    routeName: 'South Cyber & Tech Park Express',
    capacity: 40,
    currentOccupancy: 34,
    status: 'moving',
    speed: 41,
    speedLimit: 45,
    lastGpsUpdate: new Date().toISOString(),
    location: {
      lat: 28.5712,
      lng: 77.2355,
      address: 'Near Palm Residency Circle, Arterial Rd',
      bearing: 14,
    },
    isGpsActive: true,
    fuelLevel: 76,
    currentTripId: 'TRIP-2026-07',
    currentWaypointIndex: 4,
  },
  {
    id: 'BUS-11',
    name: 'Express Transit 11',
    registrationNumber: 'DL-04-TC-1102',
    driverId: 'DRV-11',
    driverName: 'Gurpreet Singh Gill',
    driverPhone: '+91 98118 77623',
    routeId: 'RT-103',
    routeName: 'East Riverview Corridor',
    capacity: 38,
    currentOccupancy: 31,
    status: 'delayed',
    speed: 18,
    speedLimit: 45,
    lastGpsUpdate: new Date().toISOString(),
    location: {
      lat: 28.5948,
      lng: 77.2785,
      address: 'Congestion at Highland Park Crossing',
      bearing: 265,
    },
    isGpsActive: true,
    fuelLevel: 68,
    currentTripId: 'TRIP-2026-11',
    currentWaypointIndex: 2,
  },
  {
    id: 'BUS-18',
    name: 'Hilltop Runner 18',
    registrationNumber: 'DL-08-TC-3391',
    driverId: 'DRV-18',
    driverName: 'Manoj Kumar Verma',
    driverPhone: '+91 98990 12894',
    routeId: 'RT-104',
    routeName: 'West Hill & Forest Hills Circuit',
    capacity: 34,
    currentOccupancy: 25,
    status: 'moving',
    speed: 36,
    speedLimit: 45,
    lastGpsUpdate: new Date().toISOString(),
    location: {
      lat: 28.5898,
      lng: 77.1852,
      address: 'Passing Pinecrest Gardens Boulevard',
      bearing: 82,
    },
    isGpsActive: true,
    fuelLevel: 91,
    currentTripId: 'TRIP-2026-18',
    currentWaypointIndex: 2,
  },
  {
    id: 'BUS-22',
    name: 'City Pride 22',
    registrationNumber: 'DL-03-TC-4478',
    driverId: 'DRV-22',
    driverName: 'Abdul Rashid Khan',
    driverPhone: '+91 98214 33890',
    routeId: 'RT-105',
    routeName: 'Central Heritage Feeder',
    capacity: 32,
    currentOccupancy: 20,
    status: 'moving',
    speed: 34,
    speedLimit: 45,
    lastGpsUpdate: new Date().toISOString(),
    location: {
      lat: 28.6025,
      lng: 77.2415,
      address: 'University Square North Crossing',
      bearing: 215,
    },
    isGpsActive: true,
    fuelLevel: 85,
    currentTripId: 'TRIP-2026-22',
    currentWaypointIndex: 2,
  },
  // Additional buses up to 34
  ...Array.from({ length: 29 }, (_, i) => {
    const num = i + 1;
    // Skip 4, 7, 11, 18, 22 because they are specifically created above
    const busNum = [4, 7, 11, 18, 22].includes(num) ? num + 50 : num;
    const formattedId = `BUS-${busNum < 10 ? '0' : ''}${busNum}`;
    const routeIndex = (i % 5) + 1;
    const routeCodes = ['RT-101', 'RT-102', 'RT-103', 'RT-104', 'RT-105'];
    const routeNames = [
      'North Valley & Maple Line',
      'South Cyber & Tech Park Express',
      'East Riverview Corridor',
      'West Hill & Forest Hills Circuit',
      'Central Heritage Feeder',
    ];

    // 28 buses active, some delayed, some stopped, others completed
    let status: Bus['status'] = 'moving';
    let speed = 32 + (i % 12);
    if (i % 7 === 0) {
      status = 'stopped';
      speed = 0;
    } else if (i === 9 || i === 19) {
      status = 'delayed';
      speed = 12;
    } else if (i > 24) {
      status = 'completed';
      speed = 0;
    }

    return {
      id: formattedId,
      name: `Fleet Shuttle ${busNum}`,
      registrationNumber: `DL-${(i + 1 < 10 ? '0' : '') + (i + 1)}-TC-${1000 + i * 87}`,
      driverId: `DRV-${busNum}`,
      driverName: `Fleet Driver ${busNum}`,
      driverPhone: `+91 9810${i}${100 + i * 2}`,
      routeId: routeCodes[i % 5] || 'RT-101',
      routeName: routeNames[i % 5] || 'North Valley & Maple Line',
      capacity: 36,
      currentOccupancy: status === 'completed' ? 0 : 22 + (i % 12),
      status,
      speed,
      speedLimit: 45,
      lastGpsUpdate: new Date(Date.now() - (i * 3000)).toISOString(),
      location: {
        lat: 28.5921 + ((i % 8) - 4) * 0.012,
        lng: 77.2289 + (((i * 3) % 9) - 4) * 0.015,
        address: `Sector ${(i % 24) + 1} Main Corridor`,
        bearing: (i * 45) % 360,
      },
      isGpsActive: status === 'moving' || status === 'delayed',
      fuelLevel: 65 + (i % 30),
      currentTripId: status !== 'completed' ? `TRIP-2026-${busNum}` : undefined,
    } as Bus;
  }).slice(0, 29),
];
