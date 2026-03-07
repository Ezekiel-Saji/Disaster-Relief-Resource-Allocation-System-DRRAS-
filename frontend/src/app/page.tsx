import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Package, Truck, Users, LayoutDashboard } from "lucide-react";

export default function Home() {
  const kpis = [
    { title: "Active Disasters", value: "4", icon: ShieldAlert, color: "text-destructive" },
    { title: "Affected Areas", value: "18", icon: Activity, color: "text-orange-500" },
    { title: "Pending Requests", value: "12", icon: Users, color: "text-yellow-500" },
    { title: "Resources Allocated", value: "3,200", icon: Package, color: "text-blue-500" },
    { title: "Dispatches Today", value: "6", icon: Truck, color: "text-green-500" },
    { title: "Deliveries Completed", value: "4", icon: LayoutDashboard, color: "text-primary" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of disaster relief logistics and operations.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2 min-h-[500px]">
          <CardHeader>
            <CardTitle>Disaster Map Visualization</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center bg-muted/50 rounded-md m-6 border border-dashed border-border mt-0">
            <p className="text-muted-foreground">Interactive map loading...</p>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "10 mins ago", event: "Flood detected in Area A", color: "bg-destructive" },
                { time: "45 mins ago", event: "Request submitted for 500 food kits", color: "bg-yellow-500" },
                { time: "2 hours ago", event: "Allocation approved from Center 2", color: "bg-primary" },
                { time: "3 hours ago", event: "Dispatch initiated tracking #88X", color: "bg-green-500" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full ${activity.color}`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
