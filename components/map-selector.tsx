"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useStore } from "@/lib/store";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/types";
import "leaflet/dist/leaflet.css";

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

function LocationMarker() {
  const selectedLocation = useStore((state) => state.selectedLocation);
  const setSelectedLocation = useStore((state) => state.setSelectedLocation);
  const setCheckoutData = useStore((state) => state.setCheckoutData);
  const [position, setPosition] = useState<L.LatLng | null>(
    selectedLocation ? new L.LatLng(selectedLocation.lat, selectedLocation.lng) : null
  );

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  );
}

function LocateButton() {
  const map = useMap();
  const setSelectedLocation = useStore((state) => state.setSelectedLocation);
  const setCheckoutData = useStore((state) => state.setCheckoutData);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    setIsLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
  };

  useEffect(() => {
    const onLocationFound = async (e: L.LocationEvent) => {
      setIsLocating(false);
      const { lat, lng } = e.latlng;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        setSelectedLocation({ lat, lng, address });
        setCheckoutData({ address });
      } catch {
        setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      }
    };

    const onLocationError = () => {
      setIsLocating(false);
      alert("تعذر تحديد موقعك. يرجى السماح بالوصول إلى الموقع أو اختيار الموقع يدوياً على الخريطة.");
    };

    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    return () => {
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map, setSelectedLocation, setCheckoutData]);

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className="absolute bottom-4 left-4 z-[1000] bg-card text-foreground px-4 py-2 rounded-lg shadow-md
                 flex items-center gap-2 hover:bg-secondary transition-colors border border-border
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLocating ? (
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.872a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>{isLocating ? "جاري التحديد..." : "موقعي الحالي"}</span>
    </button>
  );
}

export function MapSelector() {
  const selectedLocation = useStore((state) => state.selectedLocation);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] lg:h-[500px] bg-secondary rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-muted-foreground">جاري تحميل الخريطة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        <LocateButton />
      </MapContainer>
      
      {selectedLocation && (
        <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md max-w-[280px] border border-border">
          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                clipRule="evenodd"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">الموقع المحدد</p>
              <p className="text-sm text-foreground line-clamp-2">{selectedLocation.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
