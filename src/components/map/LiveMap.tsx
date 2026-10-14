import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Maximize2 } from 'lucide-react';
import type { PickupPoint, CollegeDestination } from '../../types';

interface LiveMapProps {
  busPosition?: {
    lat: number;
    lng: number;
    heading?: number | null;
    busNumber?: string;
    speedKmh?: number | null;
  } | null;
  pickupPoints?: PickupPoint[];
  selectedStopId?: string | null;
  collegeDestination?: CollegeDestination;
  routePolyline?: [number, number][];
  onSelectStop?: (stopId: string) => void;
  className?: string;
  autoCenterBus?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  busPosition,
  pickupPoints = [],
  selectedStopId,
  collegeDestination,
  routePolyline = [],
  onSelectStop,
  className = 'h-[440px]',
  autoCenterBus = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const stopsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const collegeMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [followBus, setFollowBus] = useState<boolean>(autoCenterBus);

  const destLat = collegeDestination?.lat ?? 17.385044;
  const destLng = collegeDestination?.lng ?? 78.486671;

  const initialCenterRef = useRef<[number, number]>([
    busPosition?.lat ?? destLat,
    busPosition?.lng ?? destLng,
  ]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Standard OpenStreetMap tiles (universal compatibility)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap contributors' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const stopsGroup = L.layerGroup().addTo(map);
    stopsLayerGroupRef.current = stopsGroup;
    mapRef.current = map;

    // Invalidate size to guarantee tiles render properly even if layout settled after mount
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Watch resize of map container
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route Polyline & Initial Fit Bounds
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (routePolyline.length > 1) {
      routeLineRef.current = L.polyline(routePolyline, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Fit bounds to full route on initial load if not actively tracking a bus
      if (!followBus) {
        const bounds = L.latLngBounds(routePolyline);
        mapRef.current.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [routePolyline, followBus]);

  // Update College Destination Marker and Geofence Circle
  useEffect(() => {
    if (!mapRef.current || !collegeDestination) return;

    const latLng: [number, number] = [collegeDestination.lat, collegeDestination.lng];

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng(latLng);
      geofenceCircleRef.current.setRadius(collegeDestination.arrivalRadiusMeters);
    } else {
      geofenceCircleRef.current = L.circle(latLng, {
        radius: collegeDestination.arrivalRadiusMeters,
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(mapRef.current);
    }

    const collegeIcon = L.divIcon({
      className: 'custom-college-icon',
      html: `
        <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
          <div class="px-2 py-0.5 rounded bg-purple-900/90 text-purple-200 border border-purple-500 text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
            🎓 Campus Destination
          </div>
          <div class="w-7 h-7 rounded-full bg-purple-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
            ★
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    if (collegeMarkerRef.current) {
      collegeMarkerRef.current.setLatLng(latLng);
      collegeMarkerRef.current.setIcon(collegeIcon);
    } else {
      collegeMarkerRef.current = L.marker(latLng, { icon: collegeIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${collegeDestination.name}</b><br>Arrival Geofence: ${collegeDestination.arrivalRadiusMeters}m`);
    }
  }, [collegeDestination]);

  // Update Pickup Point Markers
  useEffect(() => {
    if (!mapRef.current || !stopsLayerGroupRef.current) return;

    stopsLayerGroupRef.current.clearLayers();

    pickupPoints.forEach((stop) => {
      const isSelected = stop.pickupPointId === selectedStopId;
      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <div class="px-2 py-0.5 rounded ${
              isSelected ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-navy-900/90 text-slate-200 border border-navy-700'
            } text-[10px] font-bold shadow-md whitespace-nowrap mb-1 group-hover:scale-105 transition-transform">
              ${stop.name}
            </div>
            <div class="relative flex items-center justify-center">
              ${isSelected ? '<span class="absolute w-8 h-8 rounded-full bg-emerald-400/40 animate-ping"></span>' : ''}
              <div class="w-6 h-6 rounded-full ${
                isSelected ? 'bg-emerald-500 text-white border-2 border-white' : 'bg-navy-800 text-sky-400 border border-sky-400'
              } shadow-lg flex items-center justify-center font-bold text-[11px]">
                ${stop.sequenceNumber}
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(stopsLayerGroupRef.current!)
        .on('click', () => {
          if (onSelectStop) onSelectStop(stop.pickupPointId);
        });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a;">
          <strong>${stop.name}</strong><br/>
          <span>Stop #${stop.sequenceNumber}</span>
        </div>
      `);
    });
  }, [pickupPoints, selectedStopId, onSelectStop]);

  // Update Bus Live Position Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (!busPosition || !busPosition.lat || !busPosition.lng) {
      if (busMarkerRef.current) {
        mapRef.current.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
      return;
    }

    const latLng: [number, number] = [busPosition.lat, busPosition.lng];
    const busNum = busPosition.busNumber || 'BUS-04';
    const speed = busPosition.speedKmh ? `${Math.round(busPosition.speedKmh)} km/h` : 'Active';
    const headingDeg = busPosition.heading ?? 0;

    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
          <!-- Floating Tag -->
          <div class="px-2.5 py-0.5 rounded-full bg-sky-600 text-white font-extrabold text-[11px] shadow-xl border border-sky-300 flex items-center space-x-1 mb-1 whitespace-nowrap">
            <span>🚌 ${busNum}</span>
            <span class="text-[9px] opacity-90">· ${speed}</span>
          </div>

          <!-- Pulsing Radar Halo -->
          <div class="relative flex items-center justify-center">
            <span class="absolute w-12 h-12 rounded-full bg-sky-400/30 animate-ping"></span>
            <span class="absolute w-8 h-8 rounded-full bg-sky-500/40"></span>
            
            <!-- Rotating Pointer Vehicle -->
            <div 
              class="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 border-2 border-white shadow-2xl flex items-center justify-center text-white"
              style="transform: rotate(${headingDeg}deg); transition: transform 0.4s ease;"
            >
              <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng(latLng);
      busMarkerRef.current.setIcon(busIcon);
    } else {
      busMarkerRef.current = L.marker(latLng, { icon: busIcon, zIndexOffset: 1000 })
        .addTo(mapRef.current)
        .bindPopup(`<b>${busNum}</b><br>Speed: ${speed}`);
    }

    if (followBus && mapRef.current) {
      mapRef.current.panTo(latLng, { animate: true, duration: 0.8 });
    }
  }, [busPosition, followBus]);

  const handleCenterOnBus = () => {
    if (mapRef.current && busPosition?.lat && busPosition?.lng) {
      setFollowBus(true);
      mapRef.current.setView([busPosition.lat, busPosition.lng], 15, { animate: true });
    }
  };

  const handleFitRoute = () => {
    if (!mapRef.current) return;
    setFollowBus(false);

    if (routePolyline.length > 0) {
      const bounds = L.latLngBounds(routePolyline);
      mapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-navy-800 shadow-xl ${className}`}
      style={{ minHeight: '440px' }}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '440px' }}
        className="w-full h-full"
      />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-2">
        <button
          onClick={handleCenterOnBus}
          className={`p-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-1.5 transition backdrop-blur-md ${
            followBus
              ? 'bg-sky-600/90 text-white border-sky-400'
              : 'bg-navy-900/90 text-slate-200 border-navy-750 hover:bg-navy-800'
          }`}
          title="Center on Live Bus"
        >
          <Compass className="w-4 h-4 text-sky-300" />
          <span className="hidden sm:inline">Follow Bus</span>
        </button>

        <button
          onClick={handleFitRoute}
          className="p-2.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-slate-200 border border-navy-750 shadow-lg text-xs font-semibold flex items-center space-x-1.5 transition backdrop-blur-md"
          title="Fit Full Route"
        >
          <Maximize2 className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Overview</span>
        </button>
      </div>

      {/* Status Overlay Footer */}
      <div className="absolute bottom-2 left-3 z-[1000] bg-navy-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-navy-800 text-[11px] text-slate-300 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>OpenStreetMap Live Tiles · ₹0 Zero API cost</span>
      </div>
    </div>
  );
};
