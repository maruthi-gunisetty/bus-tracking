export type MapLayerType = 'osm_standard' | 'google_streets' | 'google_satellite' | 'google_terrain' | 'pastel_vector';

export interface MapLayerConfig {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
  badge: string;
  description: string;
}

export const MAP_LAYERS: Record<MapLayerType, MapLayerConfig> = {
  osm_standard: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: 'abc',
    badge: 'Free Tier Standard',
    description: 'Standard OpenStreetMap tiles with open community geographic data',
  },
  google_streets: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    badge: 'Standard',
    description: 'Clean roads, landmarks & street labels',
  },
  google_satellite: {
    name: 'Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Imagery',
    maxZoom: 20,
    badge: 'Photographic',
    description: 'High-res satellite imagery with road overlays',
  },
  google_terrain: {
    name: 'Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Terrain',
    maxZoom: 20,
    badge: 'Topographic',
    description: 'Topography, elevations and nature features',
  },
  pastel_vector: {
    name: 'Pastel Vector',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
    subdomains: 'abcd',
    badge: 'Soft Minimal',
    description: 'Minimalist light canvas matching theme',
  },
};
