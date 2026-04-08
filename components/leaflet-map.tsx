"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with webpack/next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LeafletMapProps {
  tileUrl: string;
  onMapClick?: (lat: number, lng: number) => void;
  onMapMove?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function LeafletMap({
  tileUrl,
  onMapClick,
  onMapMove,
  selectedLocation,
  initialCenter = [44.79777779831652, 1.542703666063447],
  initialZoom = 5,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance with smooth wheel zoom
    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomSnap: 0.1,
      scrollWheelZoom: true,
      doubleClickZoom: true,
    }).setView(initialCenter, initialZoom);

    // Set max bounds (like original)
    map.setMaxBounds(L.latLngBounds(
      L.latLng(-89.98155760646617, -360),
      L.latLng(89.99346179538875, 360)
    ));

    // Add initial tile layer
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Add layer control with all available layers
    const baseLayers: Record<string, L.TileLayer> = {
      "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }),
      "Imagery (E)": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 18 }),
      "Voyager (C)": L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", { maxZoom: 20, subdomains: "abcd" }),
      "Positron (C)": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", { maxZoom: 20, subdomains: "abcd" }),
      "Dark Matter (C)": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", { maxZoom: 20, subdomains: "abcd" }),
      "Toner (S)": L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png", { maxZoom: 16 }),
      "Toner Lite (S)": L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_toner-lite/{z}/{x}/{y}.png", { maxZoom: 16 }),
      "Watercolor (S)": L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg", { maxZoom: 16 }),
    };

    // Add layer control to top right
    L.control.layers(baseLayers, {}, { position: "topright" }).addTo(map);

    // Add zoom control
    L.control.zoom({ position: "topright" }).addTo(map);

    // Store refs
    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    setIsMapReady(true);

    // Handle map click
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Handle map move
    map.on("move", () => {
      if (onMapMove) {
        const center = map.getCenter();
        onMapMove(center.lat, center.lng);
      }
    });

    // Initial coordinate update
    if (onMapMove) {
      const center = map.getCenter();
      onMapMove(center.lat, center.lng);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update tile layer when tileUrl changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    // Remove existing tile layer
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    // Add new tile layer
    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [tileUrl, isMapReady]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Add new marker if location is selected
    if (selectedLocation) {
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 24px;
            height: 24px;
            background-color: #56d45b;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(mapInstanceRef.current);

      markerRef.current = marker;
    }
  }, [selectedLocation, isMapReady]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: "100%", 
        height: "100%",
        borderRadius: "inherit",
      }} 
    />
  );
}
