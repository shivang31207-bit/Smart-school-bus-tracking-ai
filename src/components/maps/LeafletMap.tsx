import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, RouteStop } from '../../types';
import { SCHOOL_CAMPUS_LOCATION } from '../../data/demoRoutes';

interface LeafletMapProps {
  buses?: Bus[];
  selectedBusId?: string | null;
  onSelectBus?: (busId: string) => void;
  center?: [number, number];
  zoom?: number;
  routePath?: [number, number][];
  routeColor?: string;
  stops?: RouteStop[];
  highlightStopId?: string;
  showSchoolMarker?: boolean;
  className?: string;
  interactive?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  buses = [],
  selectedBusId,
  onSelectBus,
  center = [28.5921, 77.2289],
  zoom = 13,
  routePath,
  routeColor = '#2563EB',
  stops = [],
  highlightStopId,
  showSchoolMarker = true,
  className = 'w-full h-full min-h-[380px]',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      attributionControl: false,
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Fix possible leaflet sizing glitch inside flex / absolute wrappers
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Center / Zoom updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom]);

  // Route Polyline updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routePath && routePath.length > 1) {
      const polyline = L.polyline(routePath, {
        color: routeColor,
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
        dashArray: undefined,
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;
    }
  }, [routePath, routeColor]);

  // Render Markers: Buses, Stops, School
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. School Campus Marker
    if (showSchoolMarker) {
      const schoolHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-blue-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="absolute -bottom-6 bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap">
            Oakridge Campus
          </div>
        </div>
      `;
      const schoolIcon = L.divIcon({
        html: schoolHtml,
        className: 'custom-school-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([SCHOOL_CAMPUS_LOCATION.lat, SCHOOL_CAMPUS_LOCATION.lng], { icon: schoolIcon })
        .bindPopup(`
          <div class="p-2">
            <h4 class="font-bold text-slate-900">${SCHOOL_CAMPUS_LOCATION.name}</h4>
            <p class="text-xs text-slate-500">${SCHOOL_CAMPUS_LOCATION.address}</p>
            <span class="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Central Fleet Hub</span>
          </div>
        `)
        .addTo(markersLayerRef.current);
    }

    // 2. Route Stops Markers
    stops.forEach((stop, index) => {
      const isHighlighted = stop.id === highlightStopId;
      const stopHtml = `
        <div class="relative flex flex-col items-center group">
          <div class="w-7 h-7 rounded-full ${
            isHighlighted
              ? 'bg-amber-500 ring-4 ring-amber-300 ring-offset-2 animate-bounce'
              : stop.completed
              ? 'bg-slate-400 text-white'
              : 'bg-indigo-600 text-white'
          } flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
            ${index + 1}
          </div>
          <span class="absolute -bottom-5 bg-white/95 text-slate-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-slate-200 shadow-sm whitespace-nowrap">
            ${stop.name.length > 14 ? stop.name.substring(0, 12) + '...' : stop.name}
          </span>
        </div>
      `;

      const stopIcon = L.divIcon({
        html: stopHtml,
        className: 'custom-stop-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(
        markersLayerRef.current!
      );

      marker.bindPopup(`
        <div class="p-2">
          <div class="text-[10px] uppercase font-bold text-indigo-600">Stop #${index + 1}</div>
          <h4 class="font-bold text-slate-900 text-sm">${stop.name}</h4>
          <div class="text-xs text-slate-600 mt-1">Scheduled: <span class="font-medium">${stop.scheduledTime}</span></div>
          <div class="text-xs text-slate-600">Students: <span class="font-semibold text-blue-600">${stop.studentCount} assigned</span></div>
          ${isHighlighted ? '<div class="mt-1 text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-semibold">Your Child Pickup Location</div>' : ''}
        </div>
      `);
    });

    // 3. Bus Markers
    buses.forEach((bus) => {
      const isSelected = bus.id === selectedBusId;
      let colorClass = 'bg-blue-600';
      let ringClass = 'ring-blue-400/40';

      if (bus.status === 'moving') {
        colorClass = 'bg-emerald-600';
        ringClass = 'ring-emerald-400/50';
      } else if (bus.status === 'delayed') {
        colorClass = 'bg-amber-500';
        ringClass = 'ring-amber-400/50';
      } else if (bus.status === 'emergency') {
        colorClass = 'bg-rose-600';
        ringClass = 'ring-rose-500/80 animate-ping';
      } else if (bus.status === 'stopped') {
        colorClass = 'bg-slate-700';
        ringClass = 'ring-slate-300';
      }

      const busHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-115 z-50' : 'hover:scale-105'}">
          <div class="w-9 h-9 rounded-full ${colorClass} text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ${ringClass}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-5 4h2m4 5H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="absolute -bottom-5 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
            ${bus.id} • ${Math.round(bus.speed)} km/h
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        html: busHtml,
        className: 'custom-bus-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([bus.location.lat, bus.location.lng], { icon: busIcon }).addTo(
        markersLayerRef.current!
      );

      marker.on('click', () => {
        if (onSelectBus) onSelectBus(bus.id);
      });

      marker.bindPopup(`
        <div class="p-2 min-w-[190px]">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">${bus.id}</span>
            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              bus.status === 'moving'
                ? 'bg-emerald-100 text-emerald-800'
                : bus.status === 'emergency'
                ? 'bg-rose-100 text-rose-800 font-bold animate-pulse'
                : 'bg-amber-100 text-amber-800'
            }">${bus.status}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm mt-1">${bus.name}</h4>
          <div class="text-xs text-slate-600 mt-0.5">Route: <span class="font-medium text-slate-800">${bus.routeName}</span></div>
          <div class="text-xs text-slate-600">Driver: <span class="font-medium text-slate-800">${bus.driverName}</span></div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <span>Speed: <strong class="text-blue-600">${Math.round(bus.speed)} km/h</strong></span>
            <span>Capacity: <strong>${bus.currentOccupancy}/${bus.capacity}</strong></span>
          </div>
        </div>
      `);
    });
  }, [buses, selectedBusId, stops, highlightStopId, showSchoolMarker, onSelectBus]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className={className} />
      
      {/* Map watermark / mode indicator */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur px-2.5 py-1 rounded-md border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>OpenStreetMap Live Engine</span>
        <span className="text-slate-300">•</span>
        <span className="font-mono text-[10px] text-blue-700 font-semibold">DEMO GPS SIMULATOR</span>
      </div>
    </div>
  );
};
