import { Bus, Route } from '../types';
import { calculateBearing, calculateDistanceKm } from '../utils/geoUtils';

/**
 * Step the simulated GPS position for active buses along their route waypoints
 */
export function stepGpsSimulation(buses: Bus[], routes: Route[]): {
  updatedBuses: Bus[];
  events: Array<{
    type: 'approaching_stop' | 'speed_warning' | 'route_deviation';
    busId: string;
    details: any;
  }>;
} {
  const events: Array<{
    type: 'approaching_stop' | 'speed_warning' | 'route_deviation';
    busId: string;
    details: any;
  }> = [];

  const updatedBuses = buses.map((bus) => {
    // Only step buses that are in active/moving state
    if (bus.status !== 'moving' && bus.status !== 'delayed') {
      return bus;
    }

    const route = routes.find((r) => r.id === bus.routeId);
    if (!route || !route.waypoints || route.waypoints.length < 2) {
      return {
        ...bus,
        lastGpsUpdate: new Date().toISOString(),
      };
    }

    const waypoints = route.waypoints;
    const totalWaypoints = waypoints.length;
    let currIndex = bus.currentWaypointIndex ?? 0;
    
    // Target next waypoint index
    let nextIndex = (currIndex + 1) % totalWaypoints;
    const currPoint = waypoints[currIndex]!;
    const nextPoint = waypoints[nextIndex]!;

    // Move 15% towards next waypoint each 5s tick
    const fraction = 0.18;
    const newLat = bus.location.lat + (nextPoint[0] - bus.location.lat) * fraction;
    const newLng = bus.location.lng + (nextPoint[1] - bus.location.lng) * fraction;

    // Check if close to nextPoint
    const distToNext = calculateDistanceKm(
      { lat: newLat, lng: newLng },
      { lat: nextPoint[0], lng: nextPoint[1] }
    );

    let updatedWaypointIndex = currIndex;
    if (distToNext < 0.08) {
      // Reached near next waypoint, step index forward
      updatedWaypointIndex = nextIndex;
    }

    // Realistic speed jitter between 28 and 44 km/h
    const baseSpeed = bus.status === 'delayed' ? 14 : 36;
    const speedVariation = (Math.random() * 8) - 4;
    const newSpeed = Math.max(0, Math.round(baseSpeed + speedVariation));

    const bearing = Math.round(
      calculateBearing(
        { lat: bus.location.lat, lng: bus.location.lng },
        { lat: nextPoint[0], lng: nextPoint[1] }
      )
    );

    // Check approaching stops along the route
    route.stops.forEach((stop) => {
      const distToStopKm = calculateDistanceKm(
        { lat: newLat, lng: newLng },
        { lat: stop.lat, lng: stop.lng }
      );
      // Within 300 meters
      if (distToStopKm < 0.35 && distToStopKm > 0.05) {
        events.push({
          type: 'approaching_stop',
          busId: bus.id,
          details: {
            stopName: stop.name,
            distanceMeters: Math.round(distToStopKm * 1000),
            etaMinutes: Math.max(1, Math.round((distToStopKm / Math.max(newSpeed, 20)) * 60)),
          },
        });
      }
    });

    return {
      ...bus,
      location: {
        lat: Number(newLat.toFixed(6)),
        lng: Number(newLng.toFixed(6)),
        bearing,
        address: bus.location.address,
      },
      speed: newSpeed,
      lastGpsUpdate: new Date().toISOString(),
      currentWaypointIndex: updatedWaypointIndex,
    };
  });

  return { updatedBuses, events };
}
