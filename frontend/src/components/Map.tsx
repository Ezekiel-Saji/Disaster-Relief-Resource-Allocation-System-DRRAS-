"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon issues in Next.js
function useLeafletFix() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);
}

interface Area {
  area_id: number;
  name: string;
  latitude: number;
  longitude: number;
  district?: string;
  state?: string;
}

interface MapProps {
  areas: Area[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPos?: [number, number] | null;
  center?: [number, number];
  zoom?: number;
}

function MapEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Map({ 
  areas, 
  onMapClick, 
  selectedPos, 
  center = [20.5937, 78.9629], // Default: Center of India
  zoom = 5 
}: MapProps) {
  useLeafletFix();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Existing Areas */}
      {areas.map((area) => (
        <Marker key={area.area_id} position={[area.latitude, area.longitude]}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{area.name}</h3>
              <p className="text-xs text-muted-foreground">{area.district}, {area.state}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Selected Position for New Area */}
      {selectedPos && (
        <Marker position={selectedPos}>
          <Popup>New Area Location</Popup>
        </Marker>
      )}

      <MapEvents onClick={onMapClick} />
    </MapContainer>
  );
}
