"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Package, Truck, Users, LayoutDashboard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-md flex items-center justify-center font-bold text-muted-foreground uppercase tracking-widest text-xs">Initializing Geographic Buffer...</div>
});

export default function Home() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  async function fetchMapData() {
    try {
      setLoadingMap(true);
      const { data, error } = await supabase
        .from("v_admin_affected_areas")
        .select("*");
      
      if (error) throw error;
      
      // Map view columns to component props
      const normalizedData = (data || []).map(item => ({
        area_id: item.affected_id,
        name: item.area_name,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        disaster_type: item.affected_disaster,
        severity_score: parseFloat(item.severity_score)
      }));
      
      setMapData(normalizedData);
    } catch (error) {
      console.error("Error fetching dashboard map data:", error);
    } finally {
      setLoadingMap(false);
    }
  }

  const kpis = [
    { title: "Active Disasters", value: "4", icon: ShieldAlert, color: "text-destructive" },
    { title: "Affected Areas", value: mapData.length.toString(), icon: Activity, color: "text-orange-500" },
    { title: "Pending Requests", value: "12", icon: Users, color: "text-yellow-500" },
    { title: "Resources Allocated", value: "3,200", icon: Package, color: "text-blue-500" },
    { title: "Dispatches Today", value: "6", icon: Truck, color: "text-green-500" },
    { title: "Deliveries Completed", value: "4", icon: LayoutDashboard, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Operations Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-medium">Real-time oversight of regional impact and relief logistics.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow border-t-2 border-t-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disaster Map Visualization */}
        <Card className="lg:col-span-2 min-h-[600px] border-none shadow-xl overflow-hidden rounded-2xl flex flex-col">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Regional Impact Overlay
              </CardTitle>
              {loadingMap && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            {!loadingMap && (
              <Map 
                areas={mapData} 
                showDisasterVisuals={true}
                center={[22.3511, 78.6677]} // Center of India for better overview
                zoom={5}
              />
            )}
            {loadingMap && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Geographic Indices...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-none shadow-xl rounded-2xl">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Activity Hub</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[
                { time: "10 mins ago", event: "Flood detected in South Sector", color: "bg-destructive" },
                { time: "45 mins ago", event: "Request submitted for 500 food kits", color: "bg-yellow-500" },
                { time: "2 hours ago", event: "Allocation approved from Kerala Hub", color: "bg-primary" },
                { time: "3 hours ago", event: "Dispatch initiated tracking #88X", color: "bg-green-500" },
                { time: "5 hours ago", event: "Weather advisory issued for coastal areas", color: "bg-blue-500" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 4 && <div className="absolute left-[5px] top-4 w-[2px] h-[calc(100%+8px)] bg-muted" />}
                  <div className={`mt-1 h-[10px] w-[10px] rounded-full ${activity.color} ring-4 ring-background z-10 shadow-sm`}></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{activity.event}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10">
              Access Full Audit Log
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
