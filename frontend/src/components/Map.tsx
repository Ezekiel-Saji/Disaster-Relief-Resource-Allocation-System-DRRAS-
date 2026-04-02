"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Waves, Flame, Wind, Zap, Sun, AlertTriangle, MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

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
  disaster_type?: string;
  severity_score?: number;
}

interface MapProps {
  areas: Area[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedPos?: [number, number] | null;
  center?: [number, number];
  zoom?: number;
  showDisasterVisuals?: boolean;
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

// Helper to get disaster icon
const getDisasterIcon = (type: string = "", severity: number = 5) => {
  const color = severity > 8 ? "#ef4444" : severity > 5 ? "#f97316" : "#eab308";
  const size = 30 + (severity * 2);

  let IconComponent = AlertTriangle;
  const t = type.toLowerCase();
  if (t.includes("flood")) IconComponent = Waves;
  else if (t.includes("fire")) IconComponent = Flame;
  else if (t.includes("cyclone") || t.includes("wind") || t.includes("storm")) IconComponent = Wind;
  else if (t.includes("earthquake") || t.includes("quake")) IconComponent = Zap;
  else if (t.includes("drought") || t.includes("heat")) IconComponent = Sun;

  const html = renderToString(
    <div style={{ 
      color: color, 
      filter: `drop-shadow(0 0 8px ${color}44)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "leaflet-floating 2s ease-in-out infinite"
    }}>
      <IconComponent size={size} strokeWidth={2.5} />
    </div>
  );

  return L.divIcon({
    html: html,
    className: "custom-disaster-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Helper for default admin icon (replaces buggy Leaflet default)
const getAdminIcon = () => {
  const html = renderToString(
    <div className="text-primary flex items-center justify-center filter drop-shadow-md">
      <MapPin size={32} fill="currentColor" fillOpacity={0.2} strokeWidth={2.5} />
    </div>
  );
  return L.divIcon({
    html: html,
    className: "custom-admin-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

export default function Map({ 
  areas, 
  onMapClick, 
  selectedPos, 
  center = [20.5937, 78.9629], // Default: Center of India
  zoom = 5,
  showDisasterVisuals = false
}: MapProps) {
  useLeafletFix();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-muted animate-pulse rounded-lg flex items-center justify-center font-bold text-muted-foreground">LOADING GEOGRAPHIC DATA...</div>;

  return (
    <div className="w-full h-full relative">
      <style>{`
        @keyframes leaflet-floating {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .custom-disaster-icon, .custom-admin-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>
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
        {areas
          .filter(area => 
            area && 
            typeof area.latitude === "number" && 
            typeof area.longitude === "number" && 
            !isNaN(area.latitude) && 
            !isNaN(area.longitude)
          )
          .map((area) => (
            <Marker 
              key={`area-${area.area_id}-${showDisasterVisuals}`} 
              position={[area.latitude, area.longitude]}
              icon={showDisasterVisuals ? getDisasterIcon(area.disaster_type, area.severity_score) : getAdminIcon()}
            >
              <Popup className="disaster-popup font-sans">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-black text-lg text-primary uppercase tracking-tight mb-1">{area.name}</h3>
                  {area.disaster_type && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${area.severity_score && area.severity_score > 8 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                        {area.disaster_type}
                      </span>
                      <span className="text-xs font-black text-muted-foreground">{area.severity_score}/10 SEVERITY</span>
                    </div>
                  )}
                  <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Impacted Zone Coordinates</p>
                  <p className="text-[10px] font-mono font-bold text-primary/80">{area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Selected Position for New Area */}
        {selectedPos && (
          <Marker 
            key="selected-pos"
            position={selectedPos} 
            icon={getAdminIcon()}
          >
            <Popup>
              <div className="p-1 font-sans">
                <span className="font-black text-[10px] uppercase text-muted-foreground block mb-1 tracking-widest">Selected Point</span>
                <span className="font-mono font-bold text-xs">{selectedPos[0].toFixed(6)}, {selectedPos[1].toFixed(6)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        <MapEvents onClick={onMapClick} />
      </MapContainer>
    </div>
  );
}
