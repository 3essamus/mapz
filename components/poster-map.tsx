"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useStore } from "@/lib/store";
import "leaflet/dist/leaflet.css";

// Map layer providers - matching original MesseMap
const MAP_LAYERS = {
  "OpenStreetMap": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "Imagery (E)": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "Voyager (C)": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
  "Positron (C)": "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  "Dark Matter (C)": "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  "Toner (S)": "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png",
  "Watercolor (S)": "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}{r}.jpg",
};

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Default center (France - like original MesseMap)
const DEFAULT_CENTER: [number, number] = [44.79777779831652, 1.542703666063447];
const DEFAULT_ZOOM = 5;

interface PosterMapProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  selectedLayer?: string;
  title?: string;
  subtitle?: string;
  comment?: string;
  darkTheme?: boolean;
  textOnTop?: boolean;
  orientation?: "vertical" | "horizontal";
}

function LocationMarker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number, address: string) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const setSelectedLocation = useStore((state) => state.setSelectedLocation);
  const setCheckoutData = useStore((state) => state.setCheckoutData);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(3)}°N / ${lng.toFixed(3)}°E`;
    } catch {
      return `${lat.toFixed(3)}°N / ${lng.toFixed(3)}°E`;
    }
  }, []);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      
      const address = await reverseGeocode(lat, lng);
      
      setSelectedLocation({
        lat,
        lng,
        address,
      });
      
      setCheckoutData({ address });
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng, address);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  );
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

function ChangeLayer({ layerUrl }: { layerUrl: string }) {
  const map = useMap();
  
  useEffect(() => {
    // Remove all existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    
    // Add the new tile layer
    L.tileLayer(layerUrl, {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
  }, [map, layerUrl]);
  
  return null;
}

export function PosterMap({
  onLocationSelect,
  selectedLayer = "Imagery (E)",
  title = "مابز",
  subtitle = "اختر موقعك",
  comment,
  darkTheme = false,
  textOnTop = false,
  orientation = "vertical",
}: PosterMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const selectedLocation = useStore((state) => state.selectedLocation);
  
  const displayComment = comment || (selectedLocation 
    ? `${selectedLocation.lat.toFixed(3)}°N / ${selectedLocation.lng.toFixed(3)}°E`
    : `${DEFAULT_CENTER[0].toFixed(3)}°N / ${DEFAULT_CENTER[1].toFixed(3)}°E`);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
      setMapZoom(14);
    }
  }, [selectedLocation]);

  const layerUrl = MAP_LAYERS[selectedLayer as keyof typeof MAP_LAYERS] || MAP_LAYERS["Imagery (E)"];

  if (!mounted) {
    return (
      <div className={`map-container standard-style ${orientation} ${darkTheme ? "dark-theme" : ""}`}>
        <div className="map-area flex items-center justify-center bg-muted">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <div className="user-text-wrapper">
          <h1>{title}</h1>
          <h2>
            <span className="line-before"></span>
            <span className="subtitle-text">{subtitle}</span>
            <span className="line-after"></span>
          </h2>
          <p>{displayComment}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container standard-style ${orientation} ${darkTheme ? "dark-theme" : ""} ${textOnTop ? "txt-reverse" : ""}`}>
      <div className="map-area">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer
            url={layerUrl}
            maxZoom={19}
          />
          <ChangeLayer layerUrl={layerUrl} />
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <LocationMarker onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
      <div className="user-text-wrapper">
        <h1>{title}</h1>
        <h2>
          <span className="line-before"></span>
          <span className="subtitle-text">{subtitle}</span>
          <span className="line-after"></span>
        </h2>
        <p>{displayComment}</p>
      </div>
    </div>
  );
}

export { MAP_LAYERS };
