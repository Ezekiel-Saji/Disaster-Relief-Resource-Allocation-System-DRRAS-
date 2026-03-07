import Link from "next/link";
import { 
  Building2, 
  Map, 
  Package, 
  ShieldAlert, 
  LayoutDashboard, 
  FileText, 
  PackageMinus, 
  Truck,
  CloudLightning,
  History,
  Activity,
  BarChart3,
  Settings
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const { user } = useAuth();
  
  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["admin", "officer", "manager"] },
    { label: "Disaster Management", icon: ShieldAlert, href: "/disasters", roles: ["admin", "officer"] },
    { label: "Affected Areas", icon: Map, href: "/areas", roles: ["admin", "officer"] },
    { label: "Relief Centers", icon: Building2, href: "/centers", roles: ["admin"] },
    { label: "Inventory", icon: Package, href: "/inventory", roles: ["admin", "manager"] },
    { label: "Area Requests", icon: FileText, href: "/requests", roles: ["admin", "officer"] },
    { label: "Allocations", icon: PackageMinus, href: "/allocations", roles: ["admin", "manager"] },
    { label: "Dispatch Tracking", icon: Truck, href: "/dispatch", roles: ["admin", "manager"] },
    { label: "Delivery Reports", icon: FileText, href: "/deliveries", roles: ["admin", "officer"] },
    { label: "Weather Monitoring", icon: CloudLightning, href: "/weather", roles: ["admin", "officer"] },
    { label: "Disaster History", icon: History, href: "/history", roles: ["admin", "officer"] },
    { label: "Risk Prediction", icon: Activity, href: "/predictions", roles: ["admin"] },
    { label: "Reports & Analytics", icon: BarChart3, href: "/reports", roles: ["admin"] },
    { label: "Settings", icon: Settings, href: "/settings", roles: ["admin"] },
  ];

  const filteredRoutes = routes.filter(route => 
    user && route.roles.includes(user.role)
  );

  return (
    <aside className="w-64 h-screen bg-card border-r border-border hidden md:flex flex-col sticky top-0">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <ShieldAlert className="w-6 h-6" /> DRRAS
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Disaster Relief System</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <route.icon className="w-4 h-4" />
            {route.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
