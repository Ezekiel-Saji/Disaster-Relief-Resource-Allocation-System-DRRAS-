"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Package, Truck, Users, LayoutDashboard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted animate-pulse rounded-md flex items-center justify-center font-bold text-muted-foreground uppercase tracking-widest text-xs">
      Initializing Geographic Buffer...
    </div>
  ),
});

interface ActivityItem {
  id: string;
  event: string;
  color: string;
  time: string;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function Home() {
  const [mapData, setMapData] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    fetchMapData();
    fetchActivityFeed();
  }, []);

  async function fetchMapData() {
    try {
      setLoadingMap(true);
      const { data, error } = await supabase.from("v_admin_affected_areas").select("*");
      if (error) throw error;
      const normalizedData = (data || []).map((item) => ({
        area_id: item.affected_id,
        name: item.area_name,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
        disaster_type: item.affected_disaster,
        severity_score: parseFloat(item.severity_score),
      }));
      setMapData(normalizedData);
    } catch (error) {
      console.error("Error fetching map data:", error);
    } finally {
      setLoadingMap(false);
    }
  }

  async function fetchActivityFeed() {
    try {
      setLoadingActivity(true);

      // Use the same views every other page uses — raw tables are blocked by RLS
      const [disasterRes, requestRes, allocationRes, dispatchRes] = await Promise.all([
        supabase
          .from("v_disasters")
          .select("disaster_type, severity_level, start_date")
          .order("start_date", { ascending: false })
          .limit(5),
        supabase
          .from("v_area_requests")
          .select("request_id, area, resource, quantity, status, date")
          .order("date", { ascending: false })
          .limit(5),
        supabase
          .from("v_allocations")
          .select("allocation_id, resource, source_center, quantity, date")
          .order("date", { ascending: false })
          .limit(5),
        supabase
          .from("v_dispatches")
          .select("dispatch_id, destination_area, resource, status, dispatch_date")
          .order("dispatch_date", { ascending: false })
          .limit(5),
      ]);

      const merged: ActivityItem[] = [
        ...(disasterRes.data ?? []).map((d, i) => ({
          id: `disaster-${i}`,
          event: `${d.severity_level} ${d.disaster_type} disaster registered`,
          color:
            d.severity_level === "Critical"
              ? "bg-destructive"
              : d.severity_level === "High"
              ? "bg-orange-500"
              : "bg-yellow-500",
          time: d.start_date,
        })),
        ...(requestRes.data ?? []).map((r) => ({
          id: `request-${r.request_id}`,
          event: `Request for ${r.quantity} ${r.resource} — ${r.area} [${r.status}]`,
          color: "bg-yellow-500",
          time: r.date,
        })),
        ...(allocationRes.data ?? []).map((a) => ({
          id: `allocation-${a.allocation_id}`,
          event: `${a.quantity} ${a.resource} allocated from ${a.source_center}`,
          color: "bg-primary",
          time: a.date,
        })),
        ...(dispatchRes.data ?? []).map((d) => ({
          id: `dispatch-${d.dispatch_id}`,
          event: `Dispatch #${d.dispatch_id} to ${d.destination_area} — ${d.status}`,
          color: "bg-green-500",
          time: d.dispatch_date,
        })),
      ];

      merged.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(merged.slice(0, 8));
    } catch (err) {
      console.error("Error fetching activity feed:", err);
    } finally {
      setLoadingActivity(false);
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
        {/* Map */}
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
              <Map areas={mapData} showDisasterVisuals={true} center={[22.3511, 78.6677]} zoom={5} />
            )}
            {loadingMap && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                  Syncing Geographic Indices...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-none shadow-xl rounded-2xl flex flex-col">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Activity Hub</CardTitle>
              {loadingActivity && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 overflow-y-auto">

            {/* Loading skeleton */}
            {loadingActivity && (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 h-[10px] w-[10px] rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-muted animate-pulse rounded w-full" />
                      <div className="h-2 bg-muted animate-pulse rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loadingActivity && activities.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Activity className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  No recent activity found
                </p>
              </div>
            )}

            {/* Live feed */}
            {!loadingActivity && activities.length > 0 && (
              <div className="space-y-6">
                {activities.map((activity, i) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {i !== activities.length - 1 && (
                      <div className="absolute left-[4px] top-4 w-[2px] h-[calc(100%+8px)] bg-muted" />
                    )}
                    <div className={`mt-1 h-[10px] w-[10px] rounded-full ${activity.color} ring-4 ring-background z-10 shadow-sm shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-snug">{activity.event}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                        {timeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full mt-8 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10">
              Access Full Audit Log
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
