"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Plus, 
  Loader2, 
  Globe2, 
  Navigation, 
  Users, 
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { triggerInAppNotification } from "@/lib/page-notifications";

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-muted animate-pulse rounded-xl flex items-center justify-center font-bold text-muted-foreground">LOADING GEOGRAPHIC DATA...</div>
});

interface Area {
  area_id: number;
  name: string;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  population: number;
}

export default function AdminAreasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    district: "",
    state: "",
    population: "",
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("area")
        .select("*")
        .order("area_name");

      if (error) throw error;
      
      // Normalize data: map 'area_name' to 'name' and parse coordinates
      const normalizedData = (data || [])
        .map(item => {
          const lat = parseFloat(item.latitude);
          const lng = parseFloat(item.longitude);
          
          return {
            ...item,
            area_id: item.area_id, // Ensure primary key is present
            name: item.area_name || item.name || "Unnamed Area",
            latitude: isNaN(lat) ? null : lat,
            longitude: isNaN(lng) ? null : lng
          };
        })
        .filter(item => item.area_id !== undefined && item.area_id !== null);
      
      setAreas(normalizedData);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPos([lat, lng]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPos) {
      alert("Please select a location on the map first.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("area").insert([
        {
          area_name: formData.name,
          district: formData.district,
          state: formData.state,
          population: parseInt(formData.population) || 0,
          latitude: selectedPos[0],
          longitude: selectedPos[1],
        },
      ]);

      if (error) throw error;

      await fetchAreas();
      setFormData({ name: "", district: "", state: "", population: "" });
      setSelectedPos(null);
      
      triggerInAppNotification({
        page: "/admin-areas",
        title: "New Area Cataloged",
        message: `${formData.name} has been successfully added to the regional registry.`,
        type: "Alert",
      });
    } catch (error) {
      console.error("Error adding area:", error);
      alert("Failed to add area. Please check the logs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold tracking-tighter">ACCESS DENIED</h1>
        <p className="text-muted-foreground mt-2 max-w-md">This high-level administrative interface is restricted to authorized personnel only.</p>
        <Button className="mt-6 font-bold" onClick={() => window.history.back()}>Return to Safety</Button>
      </div>
    );
  }

  const filteredAreas = areas.filter(a =>
  (a.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
  (a.district?.toLowerCase() || "").includes(searchTerm.toLowerCase())
);

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-2">ADMIN-ONLY</Badge>
             <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">Geo-Intelligence Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Regional Master Registry</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Coordinate the geographic distribution of relief efforts via centralized area management.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search registry indices..." 
            className="pl-10 h-11 bg-card/50 border-primary/10 transition-all focus:border-primary/40 focus:ring-primary/20 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl overflow-hidden rounded-2xl bg-card border-t-8 border-t-primary">
            <CardHeader className="bg-muted/30 pb-4 border-b border-primary/5">
              <CardTitle className="text-xl flex items-center gap-2 font-black uppercase tracking-wider text-primary">
                <Globe2 className="w-6 h-6 text-primary" />
                Interative Geographic Overlay
              </CardTitle>
              <CardDescription className="font-bold text-xs">
                {selectedPos 
                  ? <span className="text-amber-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Pin dropped: {selectedPos[0].toFixed(4)}, {selectedPos[1].toFixed(4)}</span>
                  : "Click anywhere on the map to drop a pin and begin cataloging a new area."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px] relative">
              <Map 
                areas={filteredAreas} 
                onMapClick={handleMapClick} 
                selectedPos={selectedPos} 
              />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/10 shadow-lg">
              <CardContent className="p-4 pt-4">
                <p className="text-[10px] font-black uppercase text-primary/60 tracking-wider mb-1">Total Zones</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black leading-none">{areas.length}</span>
                  <Globe2 className="w-4 h-4 text-primary opacity-50 mb-0.5" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/20 shadow-lg">
              <CardContent className="p-4 pt-4">
                <p className="text-[10px] font-black uppercase text-blue-600/60 tracking-wider mb-1">Registry Health</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black leading-none">100%</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-500 opacity-50 mb-0.5" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/20 shadow-lg">
              <CardContent className="p-4 pt-4">
                <p className="text-[10px] font-black uppercase text-amber-600/60 tracking-wider mb-1">Population</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black leading-none">{(areas.reduce((acc, curr) => acc + (curr.population || 0), 0) / 1000000).toFixed(1)}M</span>
                  <Users className="w-4 h-4 text-amber-500 opacity-50 mb-0.5" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-lg">
              <CardContent className="p-4 pt-4">
                <p className="text-[10px] font-black uppercase text-emerald-600/60 tracking-wider mb-1">Last Update</p>
                <div className="flex items-end gap-2 text-emerald-600">
                  <span className="text-xs font-black leading-none uppercase">Today</span>
                  <Navigation className="w-4 h-4 opacity-50 mb-0.5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-2xl rounded-2xl bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Catalog New Area
              </CardTitle>
              <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">Registry Data Entry</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase text-muted-foreground">Area Designation</Label>
                  <Input 
                    id="name"
                    required
                    placeholder="e.g. South Kochi Sector-4" 
                    className="h-12 bg-muted/30 border-none font-bold placeholder:text-muted-foreground/40"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-xs font-black uppercase text-muted-foreground">District</Label>
                    <Input 
                      id="district"
                      required
                      placeholder="District" 
                      className="h-12 bg-muted/30 border-none font-bold"
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs font-black uppercase text-muted-foreground">State</Label>
                    <Input 
                      id="state"
                      required
                      placeholder="State" 
                      className="h-12 bg-muted/30 border-none font-bold"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="population" className="text-xs font-black uppercase text-muted-foreground">Estimated Population</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input 
                      id="population"
                      type="number"
                      required
                      placeholder="Total residents..." 
                      className="h-12 bg-muted/30 border-none pl-10 font-bold"
                      value={formData.population}
                      onChange={(e) => setFormData({...formData, population: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Geographic Coordinates</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-[10px] font-mono font-bold border border-primary/5">
                      <span className="text-muted-foreground uppercase opacity-40">LAT:</span>
                      <span className={selectedPos ? "text-primary" : "text-muted-foreground/30"}>
                        {selectedPos ? selectedPos[0].toFixed(6) : "PENDING"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-[10px] font-mono font-bold border border-primary/5">
                      <span className="text-muted-foreground uppercase opacity-40">LNG:</span>
                      <span className={selectedPos ? "text-primary" : "text-muted-foreground/30"}>
                        {selectedPos ? selectedPos[1].toFixed(6) : "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>

                {!selectedPos && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800 leading-tight">
                      MANDATORY ACTION: Drop a pin on the geographic overlay to authorize coordinate capturing.
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-black uppercase tracking-tighter"
                  disabled={submitting || !selectedPos}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      SECURE LOGGING IN PROGRESS...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 mr-2" />
                      Authorize Registry Entry
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-2xl bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-6 relative">
              <Navigation className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
              <h3 className="text-lg font-black uppercase mb-1">Quick Instructions</h3>
              <ul className="text-xs font-bold space-y-2 opacity-80 mt-4 list-disc pl-4">
                <li>Pan and zoom the map to locate the target zone.</li>
                <li>Left-click any position to drop a dynamic marker.</li>
                <li>The coordinates are automatically captured into the form.</li>
                <li>Finalize details and submit to update the regional ledger.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
