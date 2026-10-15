import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Maximize2, Layers, Check } from 'lucide-react';
import type { PickupPoint, CollegeDestination } from '../../types';

import { type MapLayerType, MAP_LAYERS } from './mapLayers';
export type { MapLayerType };

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
  selectedMapLayer?: MapLayerType;
  onMapLayerChange?: (layer: MapLayerType) => void;
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
  selectedMapLayer,
  onMapLayerChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const stopsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const collegeMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [internalLayer, setInternalLayer] = useState<MapLayerType>('osm_standard');
  const [followBus, setFollowBus] = useState<boolean>(autoCenterBus);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  const activeLayer = selectedMapLayer ?? internalLayer;

  const destLat = collegeDestination?.lat ?? 17.385044;
  const destLng = collegeDestination?.lng ?? 78.486671;

  const initialCenterRef = useRef<[number, number]>([
    busPosition?.lat ?? destLat,
    busPosition?.lng ?? destLng,
  ]);

  const handleSelectLayer = (layer: MapLayerType) => {
    if (onMapLayerChange) {
      onMapLayerChange(layer);
    } else {
      setInternalLayer(layer);
    }
    setShowLayerMenu(false);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // Add zoom controls (zoom in / zoom out)
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const stopsGroup = L.layerGroup().addTo(map);
    stopsLayerGroupRef.current = stopsGroup;
    mapRef.current = map;

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

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

  // Update Tile Layer dynamically
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const config = MAP_LAYERS[activeLayer];
    const newTileLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc',
      attribution: config.attribution,
    }).addTo(mapRef.current);

    tileLayerRef.current = newTileLayer;
  }, [activeLayer]);

  // Update Route Polyline
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (routePolyline.length > 1) {
      const isSatellite = activeLayer === 'google_satellite';
      routeLineRef.current = L.polyline(routePolyline, {
        color: isSatellite ? '#0F9D91' : '#10243A',
        weight: isSatellite ? 4 : 3.5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(mapRef.current);

      if (!followBus) {
        const bounds = L.latLngBounds(routePolyline);
        mapRef.current.fitBounds(bounds, { padding: [35, 35] });
      }
    }
  }, [routePolyline, followBus, activeLayer]);

  // Update College Destination Marker and Geofence Circle
  useEffect(() => {
    if (!mapRef.current || !collegeDestination) return;

    const latLng: [number, number] = [collegeDestination.lat, collegeDestination.lng];
    const isSatellite = activeLayer === 'google_satellite';

    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng(latLng);
      geofenceCircleRef.current.setRadius(collegeDestination.arrivalRadiusMeters);
    } else {
      geofenceCircleRef.current = L.circle(latLng, {
        radius: collegeDestination.arrivalRadiusMeters,
        color: isSatellite ? '#0F9D91' : '#10243A',
        fillColor: '#0F9D91',
        fillOpacity: isSatellite ? 0.2 : 0.25,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(mapRef.current);
    }

    const collegeIcon = L.divIcon({
      className: 'custom-college-icon',
      html: `
        <div class="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
          <div class="px-2 py-0.5 rounded bg-white text-primary-navy border border-border text-[10px] font-bold shadow-subtle whitespace-nowrap mb-1">
            ${collegeDestination.name}
          </div>
          <div class="w-6 h-6 rounded-full bg-primary-navy border-2 border-white shadow-subtle flex items-center justify-center text-white text-[10px] font-bold">
            <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-7-3.18V17l7 3.18 7-3.18v-5.18L12 15z"/>
            </svg>
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
  }, [collegeDestination, activeLayer]);

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
              isSelected
                ? 'bg-accent-teal text-white ring-2 ring-accent-teal/40'
                : 'bg-white text-primary-navy border border-border'
            } text-[10px] font-bold shadow-subtle whitespace-nowrap mb-1 transition-transform group-hover:scale-105">
              ${stop.name}
            </div>
            <div class="relative flex items-center justify-center">
              ${isSelected ? '<span class="absolute w-7 h-7 rounded-full bg-accent-teal/30 animate-ping"></span>' : ''}
              <div class="w-5 h-5 rounded-full ${isSelected ? 'bg-accent-teal' : 'bg-primary-navy'} text-white border-2 border-white shadow-subtle flex items-center justify-center font-bold text-[10px]">
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
        <div style="font-family: inherit; font-size: 12px; color: #172B3A;">
          <strong>${stop.name}</strong><br/>
          <span style="color: #64748B;">Stop #${stop.sequenceNumber}</span>
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
          <!-- Floating Pill Tag -->
          <div class="px-2.5 py-0.5 rounded bg-primary-navy text-white font-bold text-[10px] shadow-card border border-white flex items-center space-x-1.5 mb-1 whitespace-nowrap">
            <span>${busNum}</span>
            <span class="text-accent-teal">· ${speed}</span>
          </div>

          <!-- Pulsing Radar Halo -->
          <div class="relative flex items-center justify-center">
            <span class="absolute w-10 h-10 rounded-full bg-accent-teal/40 animate-ping"></span>
            <span class="absolute w-7 h-7 rounded-full bg-accent-teal/30"></span>
            
            <!-- Pointer Vehicle Marker -->
            <div 
              class="w-8 h-8 rounded-full bg-primary-navy border-2 border-white shadow-card flex items-center justify-center text-white"
              style="transform: rotate(${headingDeg}deg); transition: transform 0.4s ease;"
            >
              <svg class="w-3.5 h-3.5 fill-accent-teal" viewBox="0 0 24 24">
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
      className={`relative rounded-card overflow-hidden border border-border shadow-card bg-white ${className}`}
      style={{ minHeight: '360px' }}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '360px' }}
        className="w-full h-full"
      />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center space-x-2">
        {/* Layer Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="px-3 py-1.5 rounded-btn shadow-subtle text-xs font-semibold flex items-center space-x-1.5 bg-white text-primary-navy border border-border hover:bg-bg-subtle cursor-pointer"
            title="Switch Map Layers"
          >
            <Layers className="w-3.5 h-3.5 text-accent-teal" strokeWidth={2} />
            <span className="hidden sm:inline">{MAP_LAYERS[activeLayer].name}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-btn bg-white border border-border shadow-dropdown p-1.5 space-y-1 z-[1100]">
              {(['osm_standard', 'google_streets', 'google_satellite', 'google_terrain', 'pastel_vector'] as MapLayerType[]).map(
                (layerKey) => (
                  <button
                    key={layerKey}
                    onClick={() => handleSelectLayer(layerKey)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium flex items-center justify-between cursor-pointer ${
                      activeLayer === layerKey
                        ? 'bg-primary-navy text-white font-semibold'
                        : 'text-text-primary hover:bg-bg-subtle'
                    }`}
                  >
                    <span>{MAP_LAYERS[layerKey].name}</span>
                    {activeLayer === layerKey && <Check className="w-3 h-3 text-accent-teal" />}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Center on Bus Button */}
        <button
          onClick={handleCenterOnBus}
          className={`px-3 py-1.5 rounded-btn shadow-subtle text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
            followBus
              ? 'bg-primary-navy text-white'
              : 'bg-white text-primary-navy border border-border hover:bg-bg-subtle'
          }`}
          title="Center on Live Bus"
        >
          <Compass className="w-3.5 h-3.5 text-accent-teal" strokeWidth={2} />
          <span className="hidden sm:inline">Follow Bus</span>
        </button>

        {/* Fit Overview Button */}
        <button
          onClick={handleFitRoute}
          className="btn-icon !w-8 !h-8"
          title="Fit Route Bounds"
          aria-label="Fit Route Bounds"
        >
          <Maximize2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Status Overlay Footer Pill */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1 rounded text-[11px] text-text-secondary font-medium shadow-subtle border border-border flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
        <span>Live Telemetry Layer Active</span>
      </div>
    </div>
  );
};
