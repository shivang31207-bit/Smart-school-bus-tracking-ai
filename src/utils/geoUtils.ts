/**
 * Geographic utilities for real-time tracking, ETA estimation, and distance
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// Earth's radius in kilometers
const R = 6371;

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(pos1: LatLng, pos2: LatLng): number {
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
      Math.cos((pos2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing angle in degrees between two coordinates (0-360)
 */
export function calculateBearing(start: LatLng, end: LatLng): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Calculate estimated time of arrival in minutes
 */
export function calculateEtaMinutes(distanceKm: number, speedKmH: number = 30): number {
  if (distanceKm <= 0.05) return 0;
  const effectiveSpeed = Math.max(speedKmH, 15); // assume minimum 15 km/h urban traffic speed
  const hours = distanceKm / effectiveSpeed;
  return Math.max(1, Math.round(hours * 60));
}

/**
 * Interpolate coordinate between two points with a progress fraction (0 to 1)
 */
export function interpolateCoordinate(p1: LatLng, p2: LatLng, fraction: number): LatLng {
  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
  };
}

/**
 * Check if a location has deviated beyond threshold (in meters) from a route
 */
export function checkRouteDeviation(currentLoc: LatLng, waypoints: [number, number][], thresholdMeters = 250): {
  isDeviated: boolean;
  minDistanceMeters: number;
} {
  if (!waypoints || waypoints.length === 0) return { isDeviated: false, minDistanceMeters: 0 };
  
  let minDistanceKm = Infinity;
  for (const wp of waypoints) {
    const dist = calculateDistanceKm(currentLoc, { lat: wp[0], lng: wp[1] });
    if (dist < minDistanceKm) {
      minDistanceKm = dist;
    }
  }

  const minDistanceMeters = Math.round(minDistanceKm * 1000);
  return {
    isDeviated: minDistanceMeters > thresholdMeters,
    minDistanceMeters,
  };
}
